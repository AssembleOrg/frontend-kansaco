'use client';

import { useEffect, useState } from 'react';
import { getBultosForProducts } from '@/lib/api';
import type { BultosPorProducto } from '@/lib/bultos';

/**
 * Bultos de los productos dados (por presentación). Público, sin token.
 * Si falla, devuelve {} y todo se comporta como venta por unidad (como antes).
 */
export function useBultos(productIds: number[], enabled = true): BultosPorProducto {
  const [data, setData] = useState<BultosPorProducto>({});
  const key = [...new Set(productIds)].sort((a, b) => a - b).join(',');

  useEffect(() => {
    if (!enabled || !key) return;
    let cancelled = false;
    getBultosForProducts(key.split(',').map(Number))
      .then((res) => !cancelled && setData(res))
      .catch(() => !cancelled && setData({}));
    return () => {
      cancelled = true;
    };
  }, [key, enabled]);

  return data;
}
