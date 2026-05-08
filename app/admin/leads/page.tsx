'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { deleteLead, getLeads } from '@/lib/crmApi';
import type { Lead, LeadType } from '@/types/crm';
import { LeadFormDialog } from '@/features/crm/components/LeadFormDialog';
import { formatDate, leadTypeBadgeClass, leadTypeLabel } from '@/features/crm/utils';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/features/crm/components/mobile/PageHeader';
import { FilterSheet } from '@/features/crm/components/mobile/FilterSheet';
import { LeadCardMobile } from '@/features/crm/components/mobile/LeadCardMobile';
import { RowActions } from '@/features/crm/components/mobile/RowActions';

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

  function openEdit(lead: Lead) {
    setEditing(lead);
    setDialogOpen(true);
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  const activeFiltersCount = useMemo(
    () => (search ? 1 : 0) + (tipo ? 1 : 0),
    [search, tipo]
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      <PageHeader
        title="Leads"
        description="Contactos y prospectos del CRM"
        actions={
          <Button
            onClick={openCreate}
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Plus className="mr-1 h-4 w-4" /> Nuevo lead
          </Button>
        }
      />

      <FilterSheet
        activeCount={activeFiltersCount}
        onClear={
          activeFiltersCount > 0
            ? () => {
                setSearch('');
                setTipo('');
              }
            : undefined
        }
        desktopWrapperClassName="lg:!grid-cols-3"
      >
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
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base sm:text-sm"
          >
            <option value="">Todos</option>
            <option value="MAYORISTA">Mayorista</option>
            <option value="REVENDEDOR">Revendedor</option>
          </select>
        </div>
      </FilterSheet>

      {/* Mobile: lista de cards */}
      <div className="overflow-hidden rounded-xl border border-neutral-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:hidden">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : leads.length === 0 ? (
          <p className="p-8 text-center text-sm text-neutral-400">
            No hay leads cargados
          </p>
        ) : (
          leads.map((lead) => (
            <LeadCardMobile
              key={lead.id}
              lead={lead}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Desktop: tabla */}
      <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white lg:block">
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
                  <td className="px-4 py-2">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide',
                        leadTypeBadgeClass(lead.tipo)
                      )}
                    >
                      {leadTypeLabel(lead.tipo)}
                    </span>
                  </td>
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
                      <RowActions
                        onEdit={() => openEdit(lead)}
                        onDelete={() => handleDelete(lead)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* FAB nuevo lead (mobile) */}
      <button
        type="button"
        onClick={openCreate}
        aria-label="Nuevo lead"
        className="fab-bottom fixed right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg shadow-green-600/30 transition-transform active:scale-95 sm:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>

      <LeadFormDialog
        open={dialogOpen}
        initial={editing}
        onOpenChange={setDialogOpen}
        onSaved={() => void refresh()}
      />
    </div>
  );
}
