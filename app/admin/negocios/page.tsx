'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw, Loader2, Settings, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDealKanban } from '@/features/crm/hooks/useDealKanban';
import { KanbanBoard } from '@/features/crm/components/KanbanBoard';
import { DealDrawer } from '@/features/crm/components/DealDrawer';
import { DealFormDialog } from '@/features/crm/components/DealFormDialog';
import { DealStageReasonDialog } from '@/features/crm/components/DealStageReasonDialog';
import { PageHeader } from '@/features/crm/components/mobile/PageHeader';
import { FilterSheet } from '@/features/crm/components/mobile/FilterSheet';
import { DealTabs } from '@/features/crm/components/mobile/DealTabs';
import { DealList } from '@/features/crm/components/mobile/DealList';
import { MoveStageSheet } from '@/features/crm/components/mobile/MoveStageSheet';
import { DealActionsSheet } from '@/features/crm/components/mobile/DealActionsSheet';
import { MoneyText } from '@/features/crm/components/mobile/MoneyText';
import { getPipelineStages, getVendors } from '@/lib/crmApi';
import type {
  LeadType,
  PipelineStage,
  TerminalReason,
  Vendor,
} from '@/types/crm';
import { cn } from '@/lib/utils';

interface PendingTerminalMove {
  dealId: number;
  toStageId: number;
  stageNombre: string;
  reasons: TerminalReason[];
}

export default function NegociosPage() {
  const { token } = useAuth();
  const { kanban, isLoading, error, filters, setFilters, refresh, moveDeal } =
    useDealKanban();
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [activeDealId, setActiveDealId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);
  const [pendingTerminal, setPendingTerminal] =
    useState<PendingTerminalMove | null>(null);
  const [actionsDealId, setActionsDealId] = useState<number | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);

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

  const sortedColumns = useMemo(
    () =>
      kanban
        ? [...kanban.columns].sort((a, b) => a.orden - b.orden)
        : [],
    [kanban]
  );

  useEffect(() => {
    if (sortedColumns.length === 0) {
      setActiveTab(null);
      return;
    }
    setActiveTab((prev) => {
      if (prev != null && sortedColumns.some((c) => c.id === prev)) {
        return prev;
      }
      const firstNonTerminal = sortedColumns.find((c) => !c.isTerminal);
      return (firstNonTerminal ?? sortedColumns[0]).id;
    });
  }, [sortedColumns]);

  const activeColumn = useMemo(
    () => sortedColumns.find((c) => c.id === activeTab) ?? null,
    [sortedColumns, activeTab]
  );

  const totals = useMemo(() => {
    if (!kanban) return { total: 0, ponderado: 0 };
    let total = 0;
    let ponderado = 0;
    for (const col of kanban.columns) {
      if (col.isTerminal) continue;
      total += Number(col.total) || 0;
      ponderado += Number(col.totalPonderado) || 0;
    }
    return { total, ponderado };
  }, [kanban]);

  const activeFiltersCount = useMemo(() => {
    let n = 0;
    if (filters.search) n++;
    if (filters.vendorId) n++;
    if (filters.tipo) n++;
    if (filters.ciudad) n++;
    if (filters.provincia) n++;
    return n;
  }, [filters]);

  function openDeal(dealId: number) {
    setActiveDealId(dealId);
    setDrawerOpen(true);
  }

  function openDealActions(dealId: number) {
    setActionsDealId(dealId);
    setActionsOpen(true);
  }

  function handleActionMoveStage() {
    if (actionsDealId == null) return;
    setActiveDealId(actionsDealId);
    setActionsOpen(false);
    setMoveOpen(true);
  }

  function handleActionOpenDetail() {
    if (actionsDealId == null) return;
    setActionsOpen(false);
    openDeal(actionsDealId);
  }

  function clearFilters() {
    setFilters({});
  }

  async function pickStage(stage: PipelineStage) {
    if (activeDealId == null) return;
    if (stage.isTerminal) {
      setMoveOpen(false);
      setPendingTerminal({
        dealId: activeDealId,
        toStageId: stage.id,
        stageNombre: stage.nombre,
        reasons: stage.reasons,
      });
      return;
    }
    try {
      await moveDeal(activeDealId, stage.id);
      toast.success('Negocio movido');
      setMoveOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al mover');
    }
  }

  async function confirmTerminalReason(reasonId: number) {
    if (!pendingTerminal) return;
    try {
      await moveDeal(
        pendingTerminal.dealId,
        pendingTerminal.toStageId,
        reasonId
      );
      toast.success('Negocio movido');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al mover');
    } finally {
      setPendingTerminal(null);
    }
  }

  const currentDealStageId = useMemo(() => {
    if (activeDealId == null || !kanban) return null;
    for (const col of kanban.columns) {
      if (col.deals.some((d) => d.id === activeDealId)) return col.id;
    }
    return null;
  }, [activeDealId, kanban]);

  const actionDeal = useMemo(() => {
    if (actionsDealId == null || !kanban) return null;
    for (const col of kanban.columns) {
      const found = col.deals.find((d) => d.id === actionsDealId);
      if (found) return { deal: found, color: col.color };
    }
    return null;
  }, [actionsDealId, kanban]);

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col gap-3 lg:gap-4">
      <PageHeader
        title="Negocios"
        description="Pipeline comercial: arrastrá las tarjetas entre etapas para actualizar el estado."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              aria-label="Refrescar"
              className="hidden sm:inline-flex"
            >
              <RefreshCw className="mr-1 h-4 w-4" /> Refrescar
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={refresh}
              aria-label="Refrescar"
              className="sm:hidden"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="hidden sm:inline-flex"
            >
              <Plus className="mr-1 h-4 w-4" /> Nuevo negocio
            </Button>
          </>
        }
      />

      {/* Filtros: grid desktop / Sheet mobile */}
      <div className="flex items-center justify-between gap-2 lg:block">
        <FilterSheet
          activeCount={activeFiltersCount}
          onClear={activeFiltersCount > 0 ? clearFilters : undefined}
        >
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
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base sm:text-sm"
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
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base sm:text-sm"
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
        </FilterSheet>

        {activeFiltersCount > 0 ? (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-[12px] text-neutral-500 hover:text-neutral-800 lg:hidden"
          >
            <X className="h-3.5 w-3.5" /> Limpiar
          </button>
        ) : null}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {isLoading && !kanban ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : sortedColumns.length === 0 ? (
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
        ) : (
          <>
            {/* Desktop: kanban horizontal */}
            <div className="hidden h-full lg:block">
              {kanban ? (
                <KanbanBoard
                  kanban={kanban}
                  stages={stages}
                  onMove={moveDeal}
                  onDealClick={openDeal}
                />
              ) : null}
            </div>

            {/* Mobile/Tablet: tabs + lista */}
            <div className="flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:hidden">
              <div className="flex items-center justify-between gap-3 border-b border-neutral-200/60 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-neutral-400">
                    Pipeline activo
                  </p>
                  <p className="truncate text-[13px] text-neutral-700">
                    <MoneyText
                      value={totals.total}
                      currency="ARS"
                      className="font-semibold text-neutral-900"
                    />
                    <span className="mx-1.5 text-neutral-300">·</span>
                    ponderado{' '}
                    <MoneyText value={totals.ponderado} currency="ARS" />
                  </p>
                </div>
              </div>
              <DealTabs
                columns={sortedColumns}
                activeId={activeTab}
                onChange={setActiveTab}
              />
              <div className="border-b border-neutral-200/60" />
              <DealList column={activeColumn} onDealClick={openDealActions} />
            </div>

            {/* FAB nuevo negocio (solo mobile/tablet) */}
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              aria-label="Nuevo negocio"
              className={cn(
                'fab-bottom fixed right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full',
                'bg-green-600 text-white shadow-lg shadow-green-600/30 transition-transform',
                'active:scale-95 lg:hidden'
              )}
            >
              <Plus className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      <DealDrawer
        dealId={activeDealId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onMutate={refresh}
        onRequestMoveStage={() => setMoveOpen(true)}
      />
      <DealFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={refresh}
      />
      <MoveStageSheet
        open={moveOpen}
        onOpenChange={setMoveOpen}
        stages={stages}
        currentStageId={currentDealStageId}
        onPick={pickStage}
      />
      <DealStageReasonDialog
        open={pendingTerminal !== null}
        stageNombre={pendingTerminal?.stageNombre ?? ''}
        reasons={pendingTerminal?.reasons ?? []}
        onCancel={() => setPendingTerminal(null)}
        onConfirm={confirmTerminalReason}
      />
      <DealActionsSheet
        open={actionsOpen}
        onOpenChange={setActionsOpen}
        deal={actionDeal?.deal ?? null}
        stageColor={actionDeal?.color}
        onMoveStage={handleActionMoveStage}
        onOpenDetail={handleActionOpenDetail}
      />
    </div>
  );
}
