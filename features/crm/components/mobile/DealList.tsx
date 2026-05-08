'use client';

import * as React from 'react';
import type { DealKanbanColumn } from '@/types/crm';
import { DealCardMobile } from './DealCardMobile';

interface Props {
  column: DealKanbanColumn | null;
  onDealClick: (dealId: number) => void;
}

export function DealList({ column, onDealClick }: Props) {
  if (!column) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12 text-center text-sm text-neutral-400">
        No hay etapa seleccionada.
      </div>
    );
  }
  if (column.deals.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12 text-center text-sm text-neutral-400">
        Sin negocios en {column.nombre}.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain-y bg-white">
      {column.deals.map((deal, index) => (
        <DealCardMobile
          key={deal.id}
          deal={deal}
          stageColor={column.color}
          index={index}
          onClick={onDealClick}
        />
      ))}
    </div>
  );
}
