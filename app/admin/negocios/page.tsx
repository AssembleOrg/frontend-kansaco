'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw, Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDealKanban } from '@/features/crm/hooks/useDealKanban';
import { KanbanBoard } from '@/features/crm/components/KanbanBoard';
import { DealDrawer } from '@/features/crm/components/DealDrawer';
import { DealFormDialog } from '@/features/crm/components/DealFormDialog';
import { getPipelineStages, getVendors } from '@/lib/crmApi';
import type { LeadType, PipelineStage, Vendor } from '@/types/crm';

export default function NegociosPage() {
  const { token } = useAuth();
  const { kanban, isLoading, error, filters, setFilters, refresh, moveDeal } =
    useDealKanban();
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [activeDealId, setActiveDealId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    void Promise.all([getPipelineStages(token), getVendors(token, true)])
      .then(([s, v]) => {
        setStages(s);
        setVendors(v);
      })
      .catch(() => {
        /* ignore — toast lo maneja kanban */
      });
  }, [token]);

  function openDeal(dealId: number) {
    setActiveDealId(dealId);
    setDrawerOpen(true);
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-4">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Negocios</h1>
          <p className="text-sm text-gray-500">
            Pipeline comercial: arrastrá las tarjetas entre etapas para
            actualizar el estado.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="mr-1 h-4 w-4" /> Refrescar
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Nuevo negocio
          </Button>
        </div>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <Label htmlFor="search" className="text-xs">
              Buscar
            </Label>
            <Input
              id="search"
              placeholder="Nombre del cliente"
              value={filters.search ?? ''}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value || undefined })
              }
            />
          </div>
          <div>
            <Label htmlFor="vendor" className="text-xs">
              Vendedor
            </Label>
            <select
              id="vendor"
              value={filters.vendorId ?? ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  vendorId: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="tipo" className="text-xs">
              Tipo
            </Label>
            <select
              id="tipo"
              value={filters.tipo ?? ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  tipo: e.target.value
                    ? (e.target.value as LeadType)
                    : undefined,
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="MAYORISTA">Mayorista</option>
              <option value="REVENDEDOR">Revendedor</option>
            </select>
          </div>
          <div>
            <Label htmlFor="ciudad" className="text-xs">
              Ciudad
            </Label>
            <Input
              id="ciudad"
              value={filters.ciudad ?? ''}
              onChange={(e) =>
                setFilters({ ...filters, ciudad: e.target.value || undefined })
              }
            />
          </div>
          <div>
            <Label htmlFor="provincia" className="text-xs">
              Provincia
            </Label>
            <Input
              id="provincia"
              value={filters.provincia ?? ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  provincia: e.target.value || undefined,
                })
              }
            />
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {isLoading && !kanban ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : kanban?.columns.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center">
            <Settings className="mb-3 h-10 w-10 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">
              No hay etapas configuradas
            </h3>
            <p className="mt-1 max-w-md text-sm text-gray-500">
              Configurá las etapas del pipeline antes de empezar a cargar
              negocios.
            </p>
            <Link
              href="/admin/configuracion/pipeline"
              className="mt-4 inline-flex items-center gap-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Ir a configuración
            </Link>
          </div>
        ) : kanban ? (
          <KanbanBoard
            kanban={kanban}
            stages={stages}
            onMove={moveDeal}
            onDealClick={openDeal}
          />
        ) : null}
      </div>

      <DealDrawer
        dealId={activeDealId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onMutate={refresh}
      />
      <DealFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={refresh}
      />
    </div>
  );
}
