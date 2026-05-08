'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
    <div className="space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendedores</h1>
          <p className="text-sm text-gray-500">
            Personas asignables a un negocio. No tienen login propio en esta versión.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" /> Nuevo vendedor
        </Button>
      </header>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
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
                      <button
                        type="button"
                        title="Editar"
                        onClick={() => openEdit(v)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Eliminar"
                        onClick={() => handleDelete(v)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar vendedor' : 'Nuevo vendedor'}
            </DialogTitle>
          </DialogHeader>
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
            <DialogFooter>
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
