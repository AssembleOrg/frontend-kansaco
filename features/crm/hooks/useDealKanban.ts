'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  getDealKanban,
  moveDealToStage as apiMoveDealToStage,
} from '@/lib/crmApi';
import type { Deal, DealFilters, DealKanban } from '@/types/crm';

function recalcColumn(col: DealKanban['columns'][number]) {
  const total = col.deals
    .reduce((acc, d) => acc + Number(d.monto ?? 0), 0)
    .toFixed(2);
  const totalPonderado = (
    (Number(total) * col.probability) /
    100
  ).toFixed(2);
  return { ...col, cantidad: col.deals.length, total, totalPonderado };
}

function applyOptimisticMove(
  kanban: DealKanban,
  dealId: number,
  toStageId: number,
): DealKanban {
  let moved: Deal | undefined;
  for (const col of kanban.columns) {
    const found = col.deals.find((d) => d.id === dealId);
    if (found) {
      moved = found;
      break;
    }
  }
  if (!moved) return kanban;

  const targetCol = kanban.columns.find((c) => c.id === toStageId);
  if (!targetCol) return kanban;

  const optimisticDeal: Deal = {
    ...moved,
    stage: {
      id: targetCol.id,
      nombre: targetCol.nombre,
      orden: targetCol.orden,
      color: targetCol.color,
      probability: targetCol.probability,
      isTerminal: targetCol.isTerminal,
    },
  };

  const columns = kanban.columns.map((col) => {
    if (col.deals.some((d) => d.id === dealId)) {
      return recalcColumn({
        ...col,
        deals: col.deals.filter((d) => d.id !== dealId),
      });
    }
    if (col.id === toStageId) {
      return recalcColumn({
        ...col,
        deals: [optimisticDeal, ...col.deals],
      });
    }
    return col;
  });

  return { columns };
}

export function useDealKanban(initialFilters: DealFilters = {}) {
  const { token } = useAuth();
  const [kanban, setKanban] = useState<DealKanban | null>(null);
  const [filters, setFilters] = useState<DealFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await getDealKanban(token, filters);
      setKanban(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando kanban');
    } finally {
      setIsLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const moveDeal = useCallback(
    async (dealId: number, toStageId: number, reasonId?: number) => {
      if (!token) throw new Error('No autenticado');
      const previous = kanban;
      if (kanban) {
        setKanban(applyOptimisticMove(kanban, dealId, toStageId));
      }
      try {
        await apiMoveDealToStage(token, dealId, toStageId, reasonId);
        await refresh();
      } catch (err) {
        setKanban(previous);
        throw err;
      }
    },
    [token, refresh, kanban],
  );

  return {
    kanban,
    isLoading,
    error,
    filters,
    setFilters,
    refresh,
    moveDeal,
  };
}
