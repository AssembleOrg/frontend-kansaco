'use client';

import * as React from 'react';
import type { DealKanbanColumn } from '@/types/crm';
import { cn } from '@/lib/utils';

interface Props {
  columns: DealKanbanColumn[];
  activeId: number | null;
  onChange: (stageId: number) => void;
}

export function DealTabs({ columns, activeId, onChange }: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!containerRef.current || activeId == null) return;
    const el = containerRef.current.querySelector<HTMLButtonElement>(
      `[data-stage-id="${activeId}"]`
    );
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeId]);

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Etapas del pipeline"
      className={cn(
        'crm-motion flex w-full items-stretch gap-1 overflow-x-auto px-3 pt-2',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        '[scroll-snap-type:x_proximity]'
      )}
    >
      {columns.map((col) => {
        const isActive = col.id === activeId;
        return (
          <button
            key={col.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-stage-id={col.id}
            onClick={() => onChange(col.id)}
            className={cn(
              'group relative shrink-0 px-3 py-2 text-[13px] font-medium tracking-tight transition-colors',
              '[scroll-snap-align:center]',
              isActive ? 'text-neutral-900' : 'text-neutral-500'
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="whitespace-nowrap">{col.nombre}</span>
              <span
                className={cn(
                  'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums transition-colors',
                  isActive
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-500'
                )}
              >
                {col.cantidad}
              </span>
            </span>
            <span
              aria-hidden
              className={cn(
                'absolute inset-x-2 -bottom-px h-[2px] rounded-full transition-opacity duration-150',
                isActive ? 'opacity-100' : 'opacity-0'
              )}
              style={{ backgroundColor: col.color }}
            />
          </button>
        );
      })}
    </div>
  );
}
