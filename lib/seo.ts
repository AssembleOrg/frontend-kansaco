import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

/** Dominio canónico (sin www). trailingSlash: true en next.config → rutas con "/" final. */
export const SITE_URL = siteConfig.company.url;

/** Imagen para compartir cuando la página no tiene una propia. */
export const DEFAULT_OG_IMAGE = '/logo-kansaco.webp';

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

/** Normaliza a la forma con barra final que sirve Next (trailingSlash: true). */
export function canonicalPath(path: string): string {
  if (path === '/' || path === '') return '/';
  const p = path.startsWith('/') ? path : `/${path}`;
  return p.endsWith('/') ? p : `${p}/`;
}

interface PageSeo {
  /** Título sin la marca: el template del layout raíz agrega " | Kansaco". */
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
}

export function pageMetadata({ title, description, path, image, noindex }: PageSeo): Metadata {
  const url = canonicalPath(path);
  const images = [{ url: image || DEFAULT_OG_IMAGE, alt: title }];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${siteConfig.company.name}`,
      description,
      url,
      siteName: siteConfig.company.name,
      locale: 'es_AR',
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteConfig.company.name}`,
      description,
      images: images.map((i) => i.url),
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Para páginas privadas (login, carrito, pedidos): fuera de Google. */
export const privateMetadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Recorta un texto a ~max caracteres sin cortar palabras. */
export function truncate(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : max).replace(/[,.;:\s]+$/, '')}…`;
}

/** Serializa JSON-LD sin permitir cerrar el <script> desde los datos. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organizacion`,
    name: siteConfig.company.name,
    legalName: siteConfig.company.legalName,
    url: `${SITE_URL}/`,
    logo: absoluteUrl('/Kansaco-logo-negro.png'),
    slogan: siteConfig.company.tagline,
    email: siteConfig.contact.email,
    telephone: '+54-11-4237-2636',
    taxID: siteConfig.company.cuit,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Magallanes 2051',
      addressLocality: 'Florencio Varela',
      addressRegion: 'Buenos Aires',
      addressCountry: 'AR',
    },
    sameAs: [siteConfig.social.facebook, siteConfig.social.instagram],
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#sitio`,
    name: siteConfig.company.name,
    url: `${SITE_URL}/`,
    inLanguage: 'es-AR',
    publisher: { '@id': `${SITE_URL}/#organizacion` },
  };
}
