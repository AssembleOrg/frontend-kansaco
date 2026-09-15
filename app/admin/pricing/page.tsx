'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getRolePricing, updateRolePricing, RolePricing } from '@/lib/api';
import { useAdminProducts } from '@/features/admin/hooks/useAdminProducts';
import { UserRole } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  RefreshCw,
  Save,
  Percent,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

// Etiquetas legibles para cada categoría B2B.
const ROLE_LABELS: Partial<Record<UserRole, string>> = {
  CLIENTE_MAYORISTA: 'Mayorista',
  SUBMAYORISTA: 'Submayorista',
  REVENDEDOR: 'Revendedor',
  TALLER: 'Taller',
};

const formatARS = (v: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(v);

// Precio final para un rol dado un base y un %.
const applyPct = (base: number, pct: number) =>
  Math.round(base * (1 + pct / 100) * 100) / 100;

export default function PricingPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<RolePricing[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Categoría seleccionada para la lista de precios real (por defecto, la primera).
  const [selectedRol, setSelectedRol] = useState<UserRole | null>(null);

  // Productos reales (precio base para ADMIN) — reusa el hook del panel.
  const {
    products,
    isLoading: productsLoading,
    pagination,
    goToPage,
  } = useAdminProducts(token);

  const load = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRolePricing(token);
      setRows(data);
      setDraft(
        Object.fromEntries(data.map((r) => [r.rol, String(Number(r.percentage))]))
      );
      if (!selectedRol && data.length > 0) setSelectedRol(data[0].rol);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las listas de precios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    const items: { rol: UserRole; percentage: number }[] = [];
    for (const r of rows) {
      const raw = draft[r.rol];
      const num = parseFloat(raw);
      if (isNaN(num) || num < -100 || num > 1000) {
        toast.error(`Porcentaje inválido para ${ROLE_LABELS[r.rol] ?? r.rol}`);
        return;
      }
      items.push({ rol: r.rol, percentage: num });
    }
    setIsSaving(true);
    try {
      const updated = await updateRolePricing(token, items);
      setRows(updated);
      setDraft(
        Object.fromEntries(updated.map((r) => [r.rol, String(Number(r.percentage))]))
      );
      toast.success('Listas de precios actualizadas');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  // % actualmente en edición para la categoría seleccionada (draft en vivo).
  const selectedPct = useMemo(() => {
    if (!selectedRol) return 0;
    const n = parseFloat(draft[selectedRol]);
    return isNaN(n) ? 0 : n;
  }, [selectedRol, draft]);

  // Label de la categoría seleccionada.
  const selectedLabel = selectedRol ? ROLE_LABELS[selectedRol] ?? selectedRol : '';

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-neutral-900 lg:text-2xl">
            <Percent className="h-5 w-5 text-green-700" />
            Listas de precios
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Recargo porcentual sobre el precio base para cada categoría de cliente.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-6">
          {/* ===== Columna izquierda: categorías (master) ===== */}
          <aside className="mb-6 lg:mb-0 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-xl border border-neutral-200 bg-white p-2">
              <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                Categorías
              </p>
              <ul className="space-y-0.5">
                {rows.map((r) => {
                  const pct = parseFloat(draft[r.rol]);
                  const isActive = selectedRol === r.rol;
                  return (
                    <li key={r.rol}>
                      <button
                        type="button"
                        onClick={() => setSelectedRol(r.rol)}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-green-50 text-green-700'
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                        }`}
                      >
                        <span className="truncate">{ROLE_LABELS[r.rol] ?? r.rol}</span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
                            isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {isNaN(pct) ? '0' : pct}%
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="mt-4 w-full bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar cambios
            </Button>
          </aside>

          {/* ===== Columna derecha: config + lista (detail) ===== */}
          <section className="space-y-6">
            {/* Card: configuración del % de la categoría seleccionada */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="text-base font-semibold text-neutral-900">
                Recargo — {selectedLabel}
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Porcentaje sobre el precio base. Podés usar decimales.
              </p>

              {selectedRol &&
                (() => {
                  const num = parseFloat(draft[selectedRol]);
                  const valid = !isNaN(num);
                  const example = 10000;
                  const final = valid ? applyPct(example, num) : null;
                  const delta = final !== null ? final - example : null;
                  return (
                    <div className="mt-4 flex flex-wrap items-end gap-6">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-neutral-500">
                          Recargo
                        </label>
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            step="1"
                            value={draft[selectedRol] ?? ''}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, [selectedRol]: e.target.value }))
                            }
                            className="h-9 w-28"
                          />
                          <span className="text-neutral-400">%</span>
                        </div>
                      </div>
                      <div>
                        <span className="mb-1 block text-xs font-medium text-neutral-500">
                          Ejemplo ({formatARS(example)} base)
                        </span>
                        {final !== null ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold tabular-nums text-green-600">
                              {formatARS(final)}
                            </span>
                            {delta !== null && delta !== 0 && (
                              <span
                                className={`text-xs tabular-nums ${
                                  delta > 0 ? 'text-green-600' : 'text-red-500'
                                }`}
                              >
                                {delta > 0 ? '+' : '−'}
                                {formatARS(Math.abs(delta))} · {delta > 0 ? '+' : '−'}
                                {Math.abs(num)}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
            </div>

            {/* Card: lista de precios real de productos */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-neutral-900">
                  Lista de precios — {selectedLabel}
                </h2>
              </div>
              <p className="mb-3 text-xs text-neutral-400">
                Precio calculado con el recargo en edición ({selectedPct}%). Guardá para
                aplicarlo a la tienda.
              </p>

              <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                      <th className="px-4 py-3 font-semibold">Producto</th>
                      <th className="px-4 py-3 text-right font-semibold">Precio base</th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Precio {selectedLabel}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {productsLoading ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-10 text-center">
                          <Loader2 className="mx-auto h-5 w-5 animate-spin text-green-600" />
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-10 text-center text-neutral-400">
                          No hay productos.
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => {
                        const base =
                          typeof p.price === 'string'
                            ? parseFloat(p.price)
                            : p.price ?? 0;
                        const final = applyPct(base || 0, selectedPct);
                        const delta = final - (base || 0);
                        return (
                          <tr key={p.id}>
                            <td className="px-4 py-3">
                              <div className="font-medium text-neutral-800">{p.name}</div>
                              {p.sku && (
                                <div className="text-xs text-neutral-400">SKU {p.sku}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-neutral-600">
                              {base ? formatARS(base) : '—'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-semibold tabular-nums text-green-600">
                                {base ? formatARS(final) : '—'}
                              </span>
                              {base > 0 && delta !== 0 && (
                                <span
                                  className={`ml-2 text-xs tabular-nums ${
                                    delta > 0 ? 'text-green-600' : 'text-red-500'
                                  }`}
                                >
                                  {delta > 0 ? '+' : '−'}
                                  {formatARS(Math.abs(delta))}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-neutral-500">
                    Página {pagination.page} de {pagination.totalPages} ·{' '}
                    {pagination.total} productos
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasPrev}
                      onClick={() => goToPage(pagination.page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasNext}
                      onClick={() => goToPage(pagination.page + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
