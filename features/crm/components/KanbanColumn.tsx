'use client';

import { useDroppable } from '@dnd-kit/core';
import type { DealKanbanColumn } from '@/types/crm';
import { DealCard } from './DealCard';
import { formatCurrency } from '@/features/crm/utils';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  column: DealKanbanColumn;
  onDealClick: (dealId: number) => void;
}

export function KanbanColumn({ column, onDealClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${column.id}`,
    data: { stageId: column.id, isTerminal: column.isTerminal },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex h-full w-72 shrink-0 flex-col rounded-lg border bg-gray-50 transition-colors',
        isOver ? 'border-green-400 bg-green-50' : 'border-gray-200',
      )}
    >
      <header className="flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-white px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: column.color }}
            aria-hidden="true"
          />
          <h2 className="truncate text-sm font-semibold text-gray-900">
            {column.nombre}
          </h2>
          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
            {column.cantidad}
          </span>
        </div>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {column.deals.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-gray-400">
            Sin negocios
          </p>
        ) : (
          column.deals.map((deal, index) => (
            <DealCard
              key={deal.id}
              deal={deal}
              index={index}
              onClick={onDealClick}
            />
          ))
        )}
      </div>

      <footer className="rounded-b-lg border-t border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
        <p>
          {formatCurrency(column.total)} · cantidad total
        </p>
        <p className="text-gray-400">
          {formatCurrency(column.totalPonderado)} ({column.probability}%) ·
          ponderada
        </p>
      </footer>
    </div>
  );
}
