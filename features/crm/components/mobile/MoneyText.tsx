'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type Props = {
  value: number | string | null | undefined;
  currency?: string;
  locale?: string;
  className?: string;
  fallback?: string;
};

export function MoneyText({
  value,
  currency = 'ARS',
  locale = 'es-AR',
  className,
  fallback = '—',
}: Props) {
  const num = typeof value === 'string' ? Number(value) : value;
  if (num === null || num === undefined || Number.isNaN(num)) {
    return <span className={cn('tabular-nums', className)}>{fallback}</span>;
  }
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(num);
  return <span className={cn('tabular-nums', className)}>{formatted}</span>;
}
