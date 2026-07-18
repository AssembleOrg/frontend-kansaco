'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getAdminUsers, changeUserRole, AdminUser } from '@/lib/api';
import { UserRole, esCategoriaB2B } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, UserCheck, Search } from 'lucide-react';
import { toast } from 'sonner';

// Roles asignables desde el panel. Se excluye ADMIN por seguridad
// (no se degradan/crean admins desde esta vista).
const ASSIGNABLE_ROLES: { value: UserRole; label: string }[] = [
  { value: 'CLIENTE_MINORISTA', label: 'Pendiente / Sin categoría' },
  { value: 'CLIENTE_MAYORISTA', label: 'Mayorista' },
  { value: 'SUBMAYORISTA', label: 'Submayorista' },
  { value: 'REVENDEDOR', label: 'Revendedor' },
  { value: 'TALLER', label: 'Taller' },
  { value: 'ASISTENTE', label: 'Asistente' },
];

const roleLabel = (rol: UserRole) =>
  ASSIGNABLE_ROLES.find((r) => r.value === rol)?.label ??
  (rol === 'ADMIN' ? 'Admin' : rol);

function AdminUsersContent() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  // Filtros CRM-like.
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'enabled'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  // Provincia inicial desde el query param (?provincia=), p. ej. link desde Analytics.
  const [provinciaFilter, setProvinciaFilter] = useState<string>(
    () => searchParams.get('provincia') || 'all'
  );
  const [localidadFilter, setLocalidadFilter] = useState<string>('all');

  // Al cambiar de provincia, resetear el sub-filtro de localidad.
  useEffect(() => {
    setLocalidadFilter('all');
  }, [provinciaFilter]);

  const load = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers(token);
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleChangeRole = async (userId: string, rol: UserRole) => {
    if (!token) return;
    setSavingId(userId);
    try {
      const updated = await changeUserRole(token, userId, rol);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, rol: updated.rol } : u)));
      toast.success(`Rol actualizado a ${roleLabel(rol)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar el rol');
    } finally {
      setSavingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      // Buscador
      if (
        q &&
        !u.email.toLowerCase().includes(q) &&
        !`${u.nombre} ${u.apellido}`.toLowerCase().includes(q)
      ) {
        return false;
      }
      // Filtro por estado (admin/asistente = sistema, no cuentan como pendientes)
      const isSystem = u.rol === 'ADMIN' || u.rol === 'ASISTENTE';
      if (statusFilter === 'enabled' && !esCategoriaB2B(u.rol)) return false;
      if (statusFilter === 'pending' && (esCategoriaB2B(u.rol) || isSystem))
        return false;
      // Filtro por categoría/rol
      if (roleFilter !== 'all' && u.rol !== roleFilter) return false;
      // Filtro por provincia
      if (provinciaFilter !== 'all' && u.provincia !== provinciaFilter) return false;
      // Sub-filtro por localidad
      if (localidadFilter !== 'all' && u.localidad !== localidadFilter) return false;
      return true;
    });
  }, [users, query, statusFilter, roleFilter, provinciaFilter, localidadFilter]);

  // Provincias presentes en los datos, con su conteo (para el filtro "Prov (N)").
  const provincias = useMemo(() => {
    const map = new Map<string, number>();
    for (const u of users) {
      const p = u.provincia?.trim();
      if (p) map.set(p, (map.get(p) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([provincia, count]) => ({ provincia, count }))
      .sort((a, b) => a.provincia.localeCompare(b.provincia));
  }, [users]);

  // Localidades presentes en la provincia elegida (sub-filtro).
  const localidades = useMemo(() => {
    if (provinciaFilter === 'all') return [];
    const set = new Set<string>();
    for (const u of users) {
      if (u.provincia === provinciaFilter && u.localidad?.trim()) {
        set.add(u.localidad);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [users, provinciaFilter]);

  // Breakdown de la provincia filtrada (total / pendientes / habilitados).
  const zoneBreakdown = useMemo(() => {
    if (provinciaFilter === 'all') return null;
    let pending = 0;
    let enabled = 0;
    let total = 0;
    for (const u of users) {
      if (u.provincia !== provinciaFilter) continue;
      total++;
      const isSystem = u.rol === 'ADMIN' || u.rol === 'ASISTENTE';
      if (esCategoriaB2B(u.rol)) enabled++;
      else if (!isSystem) pending++;
    }
    return { total, pending, enabled };
  }, [users, provinciaFilter]);

  // Mini-resumen para el panel de filtros.
  const counts = useMemo(() => {
    let pending = 0;
    let enabled = 0;
    for (const u of users) {
      const isSystem = u.rol === 'ADMIN' || u.rol === 'ASISTENTE';
      if (esCategoriaB2B(u.rol)) enabled++;
      else if (!isSystem) pending++;
    }
    return { pending, enabled, total: users.length };
  }, [users]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-neutral-900 lg:text-2xl">
            <UserCheck className="h-5 w-5 text-green-700" />
            Cuentas de usuario
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Asigná una categoría comercial para habilitar (aprobar) cada cuenta.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-6">
        {/* ===== Columna izquierda: filtros + resumen ===== */}
        <aside className="mb-6 lg:mb-0 lg:sticky lg:top-6 lg:self-start">
          <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Buscar…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Chips de estado (verticales) */}
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                Estado
              </p>
              <div className="flex flex-col gap-0.5">
                {([
                  { key: 'all', label: 'Todos' },
                  { key: 'pending', label: 'Pendientes' },
                  { key: 'enabled', label: 'Habilitados' },
                ] as const).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setStatusFilter(opt.key)}
                    className={`rounded-md px-3 py-1.5 text-left text-sm font-medium transition-colors ${
                      statusFilter === opt.key
                        ? 'bg-green-50 text-green-700'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro por categoría */}
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                Categoría
              </p>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
                className="h-9 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm text-neutral-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="all">Todas</option>
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por provincia con conteo (solo las que tienen usuarios) */}
            {provincias.length > 0 && (
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  Provincia
                </p>
                <select
                  value={provinciaFilter}
                  onChange={(e) => setProvinciaFilter(e.target.value)}
                  className="h-9 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm text-neutral-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="all">Todas</option>
                  {provincias.map(({ provincia, count }) => (
                    <option key={provincia} value={provincia}>
                      {provincia} ({count})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sub-filtro por localidad (solo con provincia elegida y localidades) */}
            {provinciaFilter !== 'all' && localidades.length > 0 && (
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  Localidad
                </p>
                <select
                  value={localidadFilter}
                  onChange={(e) => setLocalidadFilter(e.target.value)}
                  className="h-9 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm text-neutral-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="all">Todas</option>
                  {localidades.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Mini-resumen */}
            <div className="border-t border-neutral-100 pt-3 text-xs text-neutral-500">
              <div className="flex items-center justify-between py-0.5">
                <span>Pendientes</span>
                <span className="font-semibold text-amber-600 tabular-nums">
                  {counts.pending}
                </span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span>Habilitados</span>
                <span className="font-semibold text-green-600 tabular-nums">
                  {counts.enabled}
                </span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span>Total</span>
                <span className="font-semibold text-neutral-700 tabular-nums">
                  {counts.total}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* ===== Columna derecha: tabla de cuentas ===== */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : (
          <div className="space-y-3">
          {/* Breakdown de la provincia filtrada */}
          {zoneBreakdown && (
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-green-200 bg-green-50/60 px-4 py-3 text-sm">
              <span className="font-semibold text-green-800">{provinciaFilter}</span>
              <span className="text-neutral-600">
                Total: <span className="font-semibold text-neutral-800 tabular-nums">{zoneBreakdown.total}</span>
              </span>
              <span className="text-neutral-600">
                Habilitados: <span className="font-semibold text-green-700 tabular-nums">{zoneBreakdown.enabled}</span>
              </span>
              <span className="text-neutral-600">
                Pendientes: <span className="font-semibold text-amber-600 tabular-nums">{zoneBreakdown.pending}</span>
              </span>
            </div>
          )}
          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3 font-semibold">Usuario</th>
                <th className="px-4 py-3 font-semibold">Contacto</th>
                <th className="px-4 py-3 font-semibold">Zona</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Categoría / Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((u) => {
                const isAdmin = u.rol === 'ADMIN';
                const isSelf = currentUser?.id === u.id;
                const active = esCategoriaB2B(u.rol);
                return (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-800">
                        {u.nombre} {u.apellido}
                      </div>
                      <div className="text-xs text-neutral-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      {u.telefono ? (
                        <a
                          href={`tel:${u.telefono}`}
                          className="text-sm text-green-600 hover:underline"
                        >
                          {u.telefono}
                        </a>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.provincia || u.localidad ? (
                        <div className="text-sm text-neutral-700">
                          {[u.localidad, u.provincia].filter(Boolean).join(', ')}
                          {u.codigoPostal && (
                            <span className="text-xs text-neutral-400"> (CP {u.codigoPostal})</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                          Admin
                        </span>
                      ) : active ? (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                          Habilitado
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin || isSelf ? (
                        <span className="text-neutral-500">{roleLabel(u.rol)}</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            value={u.rol}
                            disabled={savingId === u.id}
                            onChange={(e) =>
                              handleChangeRole(u.id, e.target.value as UserRole)
                            }
                            className="h-9 rounded-md border border-neutral-200 bg-white px-2 text-sm text-neutral-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50"
                          >
                            {ASSIGNABLE_ROLES.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                          {savingId === u.id && (
                            <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-neutral-400">
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
        </div>
      }
    >
      <AdminUsersContent />
    </Suspense>
  );
}
