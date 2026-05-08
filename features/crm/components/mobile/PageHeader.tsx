'use client';

import * as React from 'react';
import { Info } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, description, actions, className }: Props) {
  return (
    <header
      className={cn(
        'flex items-start justify-between gap-3 sm:items-end',
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-[20px] font-semibold tracking-tight text-neutral-900 sm:text-2xl">
            {title}
          </h1>
          {description ? (
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 sm:hidden"
                  aria-label="Información"
                >
                  <Info className="h-4 w-4" />
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="safe-bottom rounded-t-2xl">
                <SheetHeader>
                  <SheetTitle>{title}</SheetTitle>
                </SheetHeader>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {description}
                </p>
              </SheetContent>
            </Sheet>
          ) : null}
        </div>
        {description ? (
          <p className="mt-1 hidden text-sm text-neutral-500 sm:block">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
