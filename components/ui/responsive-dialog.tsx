'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

type RootProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

export function ResponsiveDialog({ open, onOpenChange, children }: RootProps) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        {children}
      </Sheet>
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
}

type ContentProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export function ResponsiveDialogContent({
  className,
  children,
  ...props
}: ContentProps) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <SheetContent
        side="bottom"
        className={cn(
          'safe-bottom max-h-[92dvh] overflow-y-auto overscroll-contain-y rounded-t-2xl border-t-0 p-5 pt-6',
          className,
          // force correct slide animation regardless of caller overrides
          'data-[state=open]:!slide-in-from-bottom data-[state=closed]:!slide-out-to-bottom'
        )}
        {...props}
      >
        <div
          aria-hidden
          className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-300"
        />
        {children}
      </SheetContent>
    );
  }
  return (
    <DialogContent className={className} {...props}>
      {children}
    </DialogContent>
  );
}

export function ResponsiveDialogHeader(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  const isMobile = useIsMobile();
  return isMobile ? <SheetHeader {...props} /> : <DialogHeader {...props} />;
}

export function ResponsiveDialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const isMobile = useIsMobile();
  return isMobile ? (
    <SheetTitle className={className}>{children}</SheetTitle>
  ) : (
    <DialogTitle className={className}>{children}</DialogTitle>
  );
}

export function ResponsiveDialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const isMobile = useIsMobile();
  return isMobile ? (
    <SheetDescription className={className}>{children}</SheetDescription>
  ) : (
    <DialogDescription className={className}>{children}</DialogDescription>
  );
}

export function ResponsiveDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const isMobile = useIsMobile();
  return isMobile ? (
    <SheetFooter className={cn('mt-2', className)} {...props} />
  ) : (
    <DialogFooter className={className} {...props} />
  );
}
