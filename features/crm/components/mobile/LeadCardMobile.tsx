'use client';

import * as React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import type { Lead } from '@/types/crm';
import { leadTypeBadgeClass, leadTypeLabel } from '@/features/crm/utils';
import { cn } from '@/lib/utils';
import { RowActions } from './RowActions';

interface Props {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

export function LeadCardMobile({ lead, onEdit, onDelete }: Props) {
  const zona = [lead.ciudad, lead.provincia].filter(Boolean).join(', ');
  return (
    <div className="flex items-center gap-3 border-b border-neutral-200/60 bg-white px-4 py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-[15px] font-medium tracking-tight text-neutral-900">
            {lead.nombre}
          </p>
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
              leadTypeBadgeClass(lead.tipo)
            )}
          >
            {leadTypeLabel(lead.tipo)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-[12px] text-neutral-500">
          {lead.telefono ? (
            <span className="inline-flex items-center gap-1 truncate">
              <Phone className="h-3 w-3 shrink-0" />
              <span className="truncate">{lead.telefono}</span>
            </span>
          ) : null}
          {!lead.telefono && lead.email ? (
            <span className="inline-flex items-center gap-1 truncate">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{lead.email}</span>
            </span>
          ) : null}
          {zona ? (
            <span className="inline-flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{zona}</span>
            </span>
          ) : null}
        </div>
      </div>
      <RowActions
        onEdit={() => onEdit(lead)}
        onDelete={() => onDelete(lead)}
      />
    </div>
  );
}
