import type { MetadataRoute } from 'next';
import { SITE_URL, canonicalPath } from '@/lib/seo';
import { getPublicProductsForSitemap } from '@/lib/seo-products';

// Se regenera cada hora: los productos nuevos entran solos.
export const revalidate = 3600;

const STATIC_PAGES: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/productos', priority: 0.9, changeFrequency: 'daily' },
  { path: '/lineas-de-productos', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/kancore', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/tecnologia-lubricantes', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/lubri-experto', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/mayorista', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/sobre-nosotros', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/contacto', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/trabaja-con-nosotros', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/privacidad', priority: 0.1, changeFrequency: 'yearly' },
  { path: '/terminos-y-condiciones', priority: 0.1, changeFrequency: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: `${SITE_URL}${canonicalPath(p.path)}`,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const products = await getPublicProductsForSitemap();
  const seen = new Set<string>();
  for (const product of products) {
    if (seen.has(product.slug)) continue;
    seen.add(product.slug);
    pages.push({
      url: `${SITE_URL}${canonicalPath(`/productos/${product.slug}`)}`,
      changeFrequency: 'weekly',
      priority: product.isFeatured ? 0.8 : 0.7,
      ...(product.imageUrl ? { images: [product.imageUrl] } : {}),
    });
  }
  return pages;
}
