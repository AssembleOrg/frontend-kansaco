'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  createDeal,
  getLeads,
  getPipelineStages,
  getVendors,
} from '@/lib/crmApi';
import type { Lead, PipelineStage, Vendor } from '@/types/crm';
import { LeadFormDialog } from './LeadFormDialog';

interface DealFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function DealFormDialog({
  open,
  onOpenChange,
  onCreated,
}: DealFormDialogProps) {
  const { token } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [search, setSearch] = useState('');
  const [leadId, setLeadId] = useState<number | null>(null);
  const [vendorId, setVendorId] = useState<string>('');
  const [stageId, setStageId] = useState<string>('');
  const [monto, setMonto] = useState('');
  const [fechaCierre, setFechaCierre] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);

  useEffect(() => {
    if (!open || !token) return;
    void Promise.all([
      getLeads(token),
      getVendors(token),
      getPipelineStages(token),
    ])
      .then(([l, v, s]) => {
        setLeads(l);
        setVendors(v);
        setStages(s);
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : 'Error cargando datos');
      });
  }, [open, token]);

  useEffect(() => {
    if (open) {
      setLeadId(null);
      setVendorId('');
      setStageId('');
      setMonto('');
      setFechaCierre('');
      setSearch('');
    }
  }, [open]);

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads.slice(0, 30);
    return leads
      .filter(
        (l) =>
          l.nombre.toLowerCase().includes(q) ||
          (l.email ?? '').toLowerCase().includes(q),
      )
      .slice(0, 30);
  }, [leads, search]);

  async function handleSubmit() {
    if (!token) return;
    if (!leadId) {
      toast.error('Seleccioná un lead');
      return;
    }
    try {
      setIsSaving(true);
      await createDeal(token, {
        leadId,
        vendorId: vendorId === '' ? undefined : Number(vendorId),
        stageId: stageId === '' ? undefined : Number(stageId),
        monto: monto === '' ? undefined : monto,
        fechaCierre: fechaCierre === '' ? undefined : fechaCierre,
      });
      toast.success('Negocio creado');
      onCreated();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error creando negocio');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
        <ResponsiveDialogContent className="sm:max-w-lg">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Nuevo negocio</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Asociá el negocio a un lead existente o creá uno nuevo.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <Label>Lead *</Label>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => setLeadDialogOpen(true)}
                >
                  + Nuevo lead
                </button>
              </div>
              <Input
                placeholder="Buscar por nombre o email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-1"
              />
              <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-gray-200">
                {filteredLeads.length === 0 ? (
                  <p className="p-3 text-center text-xs text-gray-400">
                    Sin resultados
                  </p>
                ) : (
                  filteredLeads.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLeadId(l.id)}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                        leadId === l.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <span className="truncate font-medium">{l.nombre}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {l.tipo === 'MAYORISTA' ? 'Mayorista' : 'Revendedor'}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="dealVendor">Vendedor</Label>
                <select
                  id="dealVendor"
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Sin asignar</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="dealStage">Etapa inicial</Label>
                <select
                  id="dealStage"
                  value={stageId}
                  onChange={(e) => setStageId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Primera (default)</option>
                  {stages
                    .filter((s) => !s.isTerminal)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <Label htmlFor="dealMonto">Monto manual</Label>
                <Input
                  id="dealMonto"
                  type="number"
                  step="0.01"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dealFecha">Cierre estimado</Label>
                <Input
                  id="dealFecha"
                  type="date"
                  value={fechaCierre}
                  onChange={(e) => setFechaCierre(e.target.value)}
                />
              </div>
            </div>
          </div>

          <ResponsiveDialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving || !leadId}>
              {isSaving ? 'Creando…' : 'Crear negocio'}
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      <LeadFormDialog
        open={leadDialogOpen}
        onOpenChange={setLeadDialogOpen}
        onSaved={(lead) => {
          setLeads((prev) => [lead, ...prev]);
          setLeadId(lead.id);
        }}
      />
    </>
  );
}
