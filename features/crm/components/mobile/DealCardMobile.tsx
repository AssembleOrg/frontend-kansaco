'use client';

import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import type { Deal } from '@/types/crm';
import {
  dealTitle,
  formatDate,
  leadTypeBadgeClass,
  leadTypeLabel,
} from '@/features/crm/utils';
import { MoneyText } from './MoneyText';
import { cn } from '@/lib/utils';

interface Props {
  deal: Deal;
  stageColor: string;
  index?: number;
  onClick: (dealId: number) => void;
}

export function DealCardMobile({ deal, stageColor, index = 0, onClick }: Props) {
  const isAlt = index % 2 === 1;
  return (
    <button
      type="button"
      onClick={() => onClick(deal.id)}
      className={cn(
        'group flex w-full items-center gap-3 px-4 py-3 text-left',
        'border-b border-neutral-200/60 last:border-b-0',
        'transition-colors active:bg-neutral-100',
        isAlt ? 'bg-[#16a245]/[0.07]' : 'bg-white'
      )}
    >
      <span
        aria-hidden
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: stageColor }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-[15px] font-medium tracking-tight text-neutral-900">
            {dealTitle(deal)}
          </p>
          <MoneyText
            value={deal.monto}
            currency="ARS"
            className="shrink-0 text-[14px] font-semibold text-neutral-900"
          />
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-neutral-500">
          <span className="truncate">{deal.vendor?.nombre ?? 'Sin vendedor'}</span>
          <span aria-hidden>·</span>
          <span className="shrink-0">{formatDate(deal.fechaCierre)}</span>
          <span aria-hidden>·</span>
          <span
            className={cn(
              'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide',
              leadTypeBadgeClass(deal.lead.tipo)
            )}
          >
            {leadTypeLabel(deal.lead.tipo)}
          </span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300 transition-transform group-active:translate-x-0.5" />
    </button>
  );
}
