'use client';

import * as React from 'react';
import { Mail, Phone } from 'lucide-react';
import type { Submission } from '../types';
import { relativeTime, submissionTypeBadgeClass, submissionTypeLabel } from '../utils';
import { buildWhatsAppLink } from '@/features/crm/utils';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { cn } from '@/lib/utils';

interface Props {
  submission: Submission;
  onOpen: (submission: Submission) => void;
}

export function SubmissionCardMobile({ submission, onOpen }: Props) {
  const { leida, tipo, nombre, email, telefono } = submission;
  const whatsapp = buildWhatsAppLink(telefono);

  return (
    <button
      type="button"
      onClick={() => onOpen(submission)}
      className={cn(
        'flex w-full items-start gap-3 border-b border-neutral-200/60 px-4 py-3 text-left transition-colors last:border-b-0 active:bg-neutral-100',
        leida ? 'bg-white' : 'bg-emerald-50/40',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'mt-1.5 h-2 w-2 shrink-0 rounded-full',
          leida ? 'bg-transparent' : 'bg-emerald-500',
        )}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={cn(
              'truncate text-[15px] tracking-tight text-neutral-900',
              leida ? 'font-normal' : 'font-semibold',
            )}
          >
            {nombre}
          </p>
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
              submissionTypeBadgeClass(tipo),
            )}
          >
            {submissionTypeLabel(tipo)}
          </span>
        </div>

        <div className="mt-0.5 flex items-center gap-3 text-[12px] text-neutral-500">
          <span className="inline-flex min-w-0 items-center gap-1">
            <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{email}</span>
          </span>
          {whatsapp ? (
            // Abre WhatsApp sin disparar el onClick de la card (que abre el
            // detalle). Va con window.open porque un <a> anidado en <button>
            // sería HTML inválido.
            <span
              role="link"
              tabIndex={0}
              title={`WhatsApp ${telefono}`}
              onClick={(e) => {
                e.stopPropagation();
                window.open(whatsapp, '_blank', 'noopener,noreferrer');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  window.open(whatsapp, '_blank', 'noopener,noreferrer');
                }
              }}
              className="inline-flex shrink-0 items-center gap-1 text-emerald-600"
            >
              <WhatsAppIcon className="h-3 w-3" />
              {telefono}
            </span>
          ) : (
            telefono && (
              <span className="inline-flex shrink-0 items-center gap-1">
                <Phone className="h-3 w-3" aria-hidden="true" />
                {telefono}
              </span>
            )
          )}
        </div>

        <p className="mt-1 text-[11px] text-neutral-400">
          {relativeTime(submission.createdAt)}
          {!leida && (
            <span className="ml-2 font-medium text-emerald-600">Sin leer</span>
          )}
        </p>
      </div>
    </button>
  );
}
