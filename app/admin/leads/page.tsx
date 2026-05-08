'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { deleteLead, getLeads } from '@/lib/crmApi';
import type { Lead, LeadType } from '@/types/crm';
import { LeadFormDialog } from '@/features/crm/components/LeadFormDialog';
import { formatDate, leadTypeLabel } from '@/features/crm/utils';

export default function LeadsPage() {
  const { token } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState<LeadType | ''>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await getLeads(token, {
        search: search || undefined,
        tipo: tipo || undefined,
      });
      setLeads(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error cargando leads');
    } finally {
      setIsLoading(false);
    }
  }, [token, search, tipo]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleDelete(lead: Lead) {
    if (!token) return;
    if (!confirm(`¿Eliminar el lead "${lead.nombre}"?`)) return;
    try {
      await deleteLead(token, lead.id);
      toast.success('Lead eliminado');
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error eliminando');
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500">
            Contactos y prospectos del CRM
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" /> Nuevo lead
        </Button>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="search" className="text-xs">
              Buscar
            </Label>
            <Input
              id="search"
              placeholder="Nombre o email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="tipo" className="text-xs">
              Tipo
            </Label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as LeadType | '')}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="MAYORISTA">Mayorista</option>
              <option value="REVENDEDOR">Revendedor</option>
            </select>
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : leads.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400">
            No hay leads cargados
          </p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Teléfono</th>
                <th className="px-4 py-2">Zona</th>
                <th className="px-4 py-2">Creado</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {lead.nombre}
                  </td>
                  <td className="px-4 py-2">{leadTypeLabel(lead.tipo)}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {lead.email ?? '—'}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {lead.telefono ?? '—'}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {[lead.ciudad, lead.provincia].filter(Boolean).join(', ') ||
                      '—'}
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        title="Editar"
                        onClick={() => {
                          setEditing(lead);
                          setDialogOpen(true);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Eliminar"
                        onClick={() => handleDelete(lead)}
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

      <LeadFormDialog
        open={dialogOpen}
        initial={editing}
        onOpenChange={setDialogOpen}
        onSaved={() => void refresh()}
      />
    </div>
  );
}
