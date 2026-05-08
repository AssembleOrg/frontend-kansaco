'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { PipelineStage } from '@/types/crm';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: PipelineStage[];
  currentStageId: number | null;
  onPick: (stage: PipelineStage) => void;
}

export function MoveStageSheet({
  open,
  onOpenChange,
  stages,
  currentStageId,
  onPick,
}: Props) {
  const sorted = React.useMemo(
    () => [...stages].sort((a, b) => a.orden - b.orden),
    [stages]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="safe-bottom max-h-[80dvh] overflow-y-auto overscroll-contain-y rounded-t-2xl p-0"
      >
        <div
          aria-hidden
          className="mx-auto mt-3 mb-2 h-1 w-10 rounded-full bg-neutral-300"
        />
        <SheetHeader className="px-5 pt-2 pb-3">
          <SheetTitle className="text-[17px]">Mover a etapa</SheetTitle>
        </SheetHeader>
        <ul className="divide-y divide-neutral-200/60">
          {sorted.map((stage) => {
            const isCurrent = stage.id === currentStageId;
            return (
              <li key={stage.id}>
                <button
                  type="button"
                  disabled={isCurrent}
                  onClick={() => onPick(stage)}
                  className={cn(
                    'flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors',
                    isCurrent
                      ? 'cursor-default opacity-60'
                      : 'active:bg-neutral-50'
                  )}
                >
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="flex-1 text-[15px] font-medium text-neutral-900">
                    {stage.nombre}
                  </span>
                  <span className="text-[12px] text-neutral-400 tabular-nums">
                    {stage.probability}%
                  </span>
                  {isCurrent ? (
                    <Check className="h-4 w-4 text-neutral-400" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
