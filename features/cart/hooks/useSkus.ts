'use client';

import { useEffect, useState } from 'react';
import { getSkusForProducts, type SkusPorProducto } from '@/lib/api';

/**
 * Códigos Tango por presentación de los productos dados. Público, sin token.
 * Si falla, devuelve {} y simplemente no se muestran (igual que useBultos).
 */
export function useSkus(productIds: number[], enabled = true): SkusPorProducto {
  const [data, setData] = useState<SkusPorProducto>({});
  const key = [...new Set(productIds)].sort((a, b) => a - b).join(',');

  useEffect(() => {
    if (!enabled || !key) return;
    let cancelled = false;
    getSkusForProducts(key.split(',').map(Number))
      .then((res) => !cancelled && setData(res))
      .catch(() => !cancelled && setData({}));
    return () => {
      cancelled = true;
    };
  }, [key, enabled]);

  return data;
}
