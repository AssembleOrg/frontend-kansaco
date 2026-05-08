'use client';

import { memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Mail, MessageCircle, MapPin } from 'lucide-react';
import {
  buildMailtoLink,
  buildWhatsAppLink,
  dealTitle,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  leadTypeLabel,
} from '@/features/crm/utils';
import type { Deal } from '@/types/crm';
import { cn } from '@/lib/utils';

interface DealCardProps {
  deal: Deal;
  onClick: (dealId: number) => void;
}

function DealCardInner({ deal, onClick }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `deal-${deal.id}`,
      data: { dealId: deal.id, fromStageId: deal.stage.id },
    });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const ciudad = [deal.lead.ciudad, deal.lead.provincia]
    .filter(Boolean)
    .join(', ');
  const wa = buildWhatsAppLink(deal.lead.telefono);
  const mailto = buildMailtoLink(deal.lead.email);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(deal.id)}
      className={cn(
        'group cursor-pointer rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md',
        isDragging && 'opacity-50 shadow-lg',
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-tight text-gray-900 line-clamp-2">
          {dealTitle(deal)}
        </h3>
        <span
          className={cn(
            'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase',
            deal.lead.tipo === 'MAYORISTA'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-purple-100 text-purple-700',
          )}
        >
          {leadTypeLabel(deal.lead.tipo)}
        </span>
      </div>

      <div className="space-y-1 text-xs text-gray-600">
        <p>
          <span className="font-medium">Monto:</span>{' '}
          {formatCurrency(deal.monto)}
        </p>
        <p>
          <span className="font-medium">Cierre:</span>{' '}
          {formatDate(deal.fechaCierre)}
        </p>
        <p>
          <span className="font-medium">Vendedor:</span>{' '}
          {deal.vendor?.nombre ?? '—'}
        </p>
        {ciudad && (
          <p className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{ciudad}</span>
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
        <div className="flex items-center gap-2">
          {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            title={`WhatsApp ${deal.lead.telefono}`}
            className="flex h-6 w-6 items-center justify-center rounded text-green-600 hover:bg-green-50"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        )}
          {mailto && (
            <a
              href={mailto}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              title={`Email ${deal.lead.email}`}
              className="flex h-6 w-6 items-center justify-center rounded text-blue-600 hover:bg-blue-50"
            >
              <Mail className="h-4 w-4" />
            </a>
          )}
        </div>
        {deal.ultimaActividad && (
          <span className="text-[10px] italic text-gray-400">
            {formatRelativeTime(deal.ultimaActividad)}
          </span>
        )}
      </div>
    </div>
  );
}

export const DealCard = memo(DealCardInner);
