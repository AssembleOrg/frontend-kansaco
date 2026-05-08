'use client';

import * as React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  desktopWrapperClassName?: string;
  triggerLabel?: string;
  title?: string;
  activeCount?: number;
  onClear?: () => void;
};

export function FilterSheet({
  children,
  desktopWrapperClassName,
  triggerLabel = 'Filtros',
  title = 'Filtros',
  activeCount = 0,
  onClear,
}: Props) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <section
        className={cn(
          'rounded-xl border border-neutral-200/70 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
          desktopWrapperClassName
        )}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {children}
        </div>
      </section>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <SlidersHorizontal className="mr-1 h-4 w-4" />
            {triggerLabel}
            {activeCount > 0 ? (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1.5 text-[10px] font-medium text-white">
                {activeCount}
              </span>
            ) : null}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="safe-bottom max-h-[85dvh] overflow-y-auto overscroll-contain-y rounded-t-2xl"
        >
          <div
            aria-hidden
            className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-300"
          />
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">{children}</div>
          <div className="mt-5 flex items-center justify-between gap-2">
            {onClear ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="text-neutral-600"
              >
                Limpiar
              </Button>
            ) : (
              <span />
            )}
            <SheetClose asChild>
              <Button size="sm">Aplicar</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
