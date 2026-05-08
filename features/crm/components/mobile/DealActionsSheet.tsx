'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import type { Deal } from '@/types/crm';
import { dealTitle } from '@/features/crm/utils';
import { MoneyText } from './MoneyText';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: Deal | null;
  stageColor?: string;
  onMoveStage: () => void;
  onOpenDetail: () => void;
}

export function DealActionsSheet({
  open,
  onOpenChange,
  deal,
  stageColor,
  onMoveStage,
  onOpenDetail,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="safe-bottom max-h-[60dvh] overflow-y-auto overscroll-contain-y rounded-t-2xl border-t-0 bg-transparent p-0 shadow-none"
      >
        <div
          aria-hidden
          className="mx-auto mb-2 mt-2 h-1 w-10 rounded-full bg-neutral-300/80"
        />

        <div className="mx-3 overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <SheetHeader className="px-5 pt-4 pb-3 text-center">
            <SheetTitle className="text-[17px] font-semibold tracking-tight text-neutral-900">
              {deal ? dealTitle(deal) : 'Acciones'}
            </SheetTitle>
            {deal ? (
              <SheetDescription className="flex items-center justify-center gap-2 text-[13px] text-neutral-500">
                <MoneyText
                  value={deal.monto}
                  currency="ARS"
                  className="font-medium text-neutral-700"
                />
                <span aria-hidden className="text-neutral-300">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: stageColor ?? deal.stage.color }}
                  />
                  {deal.stage.nombre}
                </span>
              </SheetDescription>
            ) : null}
          </SheetHeader>

          <div className="border-t border-neutral-200/70">
            <button
              type="button"
              onClick={onMoveStage}
              disabled={!deal}
              className="block w-full px-5 py-4 text-center text-[16px] font-normal text-neutral-900 transition-colors active:bg-neutral-100 disabled:opacity-40"
            >
              Mover Etapa
            </button>
            <div className="border-t border-neutral-200/70" />
            <button
              type="button"
              onClick={onOpenDetail}
              disabled={!deal}
              className="block w-full px-5 py-4 text-center text-[16px] font-normal text-neutral-900 transition-colors active:bg-neutral-100 disabled:opacity-40"
            >
              Editar / Ver Detalle
            </button>
          </div>
        </div>

        <div className="mx-3 mt-2 overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <SheetClose asChild>
            <button
              type="button"
              className="block w-full px-5 py-4 text-center text-[16px] font-semibold text-neutral-900 transition-colors active:bg-neutral-100"
            >
              Cancelar
            </button>
          </SheetClose>
        </div>

        <div className="h-3" />
      </SheetContent>
    </Sheet>
  );
}
