'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import { KanbanColumn } from './KanbanColumn';
import { DealCard } from './DealCard';
import { DealStageReasonDialog } from './DealStageReasonDialog';
import type {
  Deal,
  DealKanban,
  PipelineStage,
  TerminalReason,
} from '@/types/crm';

interface KanbanBoardProps {
  kanban: DealKanban;
  stages: PipelineStage[];
  onMove: (dealId: number, toStageId: number, reasonId?: number) => Promise<void>;
  onDealClick: (dealId: number) => void;
}

interface PendingTerminalMove {
  dealId: number;
  toStageId: number;
  stageNombre: string;
  reasons: TerminalReason[];
}

export function KanbanBoard({
  kanban,
  stages,
  onMove,
  onDealClick,
}: KanbanBoardProps) {
  const [pendingMove, setPendingMove] =
    useState<PendingTerminalMove | null>(null);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const stagesById = useMemo(() => {
    const m = new Map<number, PipelineStage>();
    for (const s of stages) m.set(s.id, s);
    return m;
  }, [stages]);

  const dealsById = useMemo(() => {
    const m = new Map<number, Deal>();
    for (const col of kanban.columns) {
      for (const d of col.deals) m.set(d.id, d);
    }
    return m;
  }, [kanban]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const sortedColumns = useMemo(
    () => [...kanban.columns].sort((a, b) => a.orden - b.orden),
    [kanban],
  );

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as
      | { dealId: number }
      | undefined;
    if (data) setActiveDeal(dealsById.get(data.dealId) ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;
    const data = active.data.current as
      | { dealId: number; fromStageId: number }
      | undefined;
    const overData = over.data.current as
      | { stageId: number; isTerminal: boolean }
      | undefined;
    if (!data || !overData) return;
    const { dealId, fromStageId } = data;
    const toStageId = overData.stageId;
    if (toStageId === fromStageId) return;

    const toStage = stagesById.get(toStageId);
    if (!toStage) return;

    if (toStage.isTerminal) {
      setPendingMove({
        dealId,
        toStageId,
        stageNombre: toStage.nombre,
        reasons: toStage.reasons,
      });
      return;
    }

    try {
      await onMove(dealId, toStageId);
      toast.success('Negocio movido');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Error al mover negocio',
      );
    }
  }

  async function handleConfirmReason(reasonId: number) {
    if (!pendingMove) return;
    try {
      await onMove(pendingMove.dealId, pendingMove.toStageId, reasonId);
      toast.success('Negocio movido');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Error al mover negocio',
      );
    } finally {
      setPendingMove(null);
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveDeal(null)}
      >
        <div className="flex h-full gap-3 overflow-x-auto pb-2">
          {sortedColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onDealClick={onDealClick}
            />
          ))}
        </div>
        <DragOverlay>
          {activeDeal ? (
            <div className="w-72 rotate-1 opacity-90 shadow-xl">
              <DealCard deal={activeDeal} onClick={() => undefined} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <DealStageReasonDialog
        open={pendingMove !== null}
        stageNombre={pendingMove?.stageNombre ?? ''}
        reasons={pendingMove?.reasons ?? []}
        onCancel={() => setPendingMove(null)}
        onConfirm={handleConfirmReason}
      />
    </>
  );
}
