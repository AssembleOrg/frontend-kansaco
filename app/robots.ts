import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /api/ queda abierto: el catálogo y las fotos se cargan desde ahí y Google
        // necesita leerlo para ver la página completa.
        disallow: [
          '/admin/',
          '/login/',
          '/register/',
          '/checkout/',
          '/order-success/',
          '/mis-pedidos/',
          '/dashboard/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
