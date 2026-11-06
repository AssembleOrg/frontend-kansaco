import { getApiBaseUrl } from '@/lib/api-base-url';
import type { Product } from '@/types/product';

interface ProductPage {
  data: { data: Product[]; hasNext?: boolean; totalPages?: number };
}

/**
 * Productos visibles para el sitemap. Lee el backend del lado del servidor
 * (API_URL), sin token: lo mismo que ve un visitante anónimo.
 * Si el backend falla devuelve lo que haya juntado (el sitemap sale igual
 * con las páginas fijas).
 */
export async function getPublicProductsForSitemap(): Promise<Product[]> {
  const base = getApiBaseUrl();
  const all: Product[] = [];
  for (let page = 1; page <= 30; page++) {
    try {
      const res = await fetch(`${base}/product?isVisible=true&limit=100&page=${page}`, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const body = (await res.json()) as ProductPage;
      const items = body?.data?.data ?? [];
      all.push(...items);
      if (!body.data.hasNext || items.length === 0) break;
    } catch {
      break;
    }
  }
  return all.filter((p) => p.slug && p.isVisible !== false);
}
