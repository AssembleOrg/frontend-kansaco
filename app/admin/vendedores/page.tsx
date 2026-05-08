'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  createVendor,
  deleteVendor,
  getVendors,
  updateVendor,
} from '@/lib/crmApi';
import type { Vendor } from '@/types/crm';
import { formatDate } from '@/features/crm/utils';
import { PageHeader } from '@/features/crm/components/mobile/PageHeader';
import { RowActions } from '@/features/crm/components/mobile/RowActions';

export default function VendedoresPage() {
  const { token } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formActivo, setFormActivo] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await getVendors(token, true);
      setVendors(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error cargando vendedores');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function openCreate() {
    setEditing(null);
    setFormNombre('');
    setFormActivo(true);
    setDialogOpen(true);
  }

  function openEdit(vendor: Vendor) {
    setEditing(vendor);
    setFormNombre(vendor.nombre);
    setFormActivo(vendor.activo);
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!formNombre.trim()) {
      toast.error('Nombre obligatorio');
      return;
    }
    try {
      setIsSaving(true);
      const payload = { nombre: formNombre.trim(), activo: formActivo };
      if (editing) {
        await updateVendor(token, editing.id, payload);
        toast.success('Vendedor actualizado');
      } else {
        await createVendor(token, payload);
        toast.success('Vendedor creado');
      }
      setDialogOpen(false);
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error guardando');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(vendor: Vendor) {
    if (!token) return;
    if (!confirm(`¿Eliminar el vendedor "${vendor.nombre}"?`)) return;
    try {
      await deleteVendor(token, vendor.id);
      toast.success('Vendedor eliminado');
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error eliminando');
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <PageHeader
        title="Vendedores"
        description="Personas asignables a un negocio. No tienen login propio en esta versión."
        actions={
          <Button
            onClick={openCreate}
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Plus className="mr-1 h-4 w-4" /> Nuevo vendedor
          </Button>
        }
      />

      {/* Mobile: lista compacta */}
      <div className="overflow-hidden rounded-xl border border-neutral-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:hidden">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : vendors.length === 0 ? (
          <p className="p-8 text-center text-sm text-neutral-400">
            No hay vendedores cargados
          </p>
        ) : (
          vendors.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-3 border-b border-neutral-200/60 bg-white px-4 py-3 last:border-b-0"
            >
              <span
                aria-hidden
                className={
                  'h-2 w-2 shrink-0 rounded-full ' +
                  (v.activo ? 'bg-green-500' : 'bg-neutral-300')
                }
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium tracking-tight text-neutral-900">
                  {v.nombre}
                </p>
                <p className="text-[12px] text-neutral-500">
                  {v.activo ? 'Activo' : 'Inactivo'}
                  <span className="mx-1 text-neutral-300">·</span>
                  {formatDate(v.createdAt)}
                </p>
              </div>
              <RowActions
                onEdit={() => openEdit(v)}
                onDelete={() => handleDelete(v)}
              />
            </div>
          ))
        )}
      </div>

      {/* Desktop: tabla */}
      <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white lg:block">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : vendors.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400">
            No hay vendedores cargados
          </p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Creado</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {v.nombre}
                  </td>
                  <td className="px-4 py-2">
                    {v.activo ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Activo
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {formatDate(v.createdAt)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <RowActions
                        onEdit={() => openEdit(v)}
                        onDelete={() => handleDelete(v)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* FAB nuevo vendedor (mobile) */}
      <button
        type="button"
        onClick={openCreate}
        aria-label="Nuevo vendedor"
        className="fab-bottom fixed right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg shadow-green-600/30 transition-transform active:scale-95 sm:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>

      <ResponsiveDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <ResponsiveDialogContent className="sm:max-w-md">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              {editing ? 'Editar vendedor' : 'Nuevo vendedor'}
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="activo"
                checked={formActivo}
                onCheckedChange={(v) => setFormActivo(v === true)}
              />
              <Label htmlFor="activo" className="text-sm font-normal">
                Activo
              </Label>
            </div>
            <ResponsiveDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Guardando…' : editing ? 'Guardar' : 'Crear'}
              </Button>
            </ResponsiveDialogFooter>
          </form>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </div>
  );
}
