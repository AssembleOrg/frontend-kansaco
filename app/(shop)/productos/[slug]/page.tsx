import type { Metadata } from 'next';
import { cache } from 'react';
import { getProductBySlug } from '@/lib/api';
import { siteConfig } from '@/lib/site-config';
import {
  SITE_URL,
  absoluteUrl,
  canonicalPath,
  jsonLd,
  pageMetadata,
  truncate,
} from '@/lib/seo';
import type { Product } from '@/types/product';
import ProductDetailClient from './ProductDetailClient';

type Params = Promise<{ slug: string }>;

function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

// Una sola consulta al backend por request (la usan metadata y la página).
const loadProduct = cache(async (slug: string): Promise<Product | null> => {
  const product = await getProductBySlug(slug);
  return product && product.isVisible !== false ? product : null;
});

function categoryNames(product: Product): string[] {
  if (product.categories?.length) return product.categories.map((c) => c.name);
  return Array.isArray(product.category) ? product.category : [];
}

function productDescription(product: Product): string {
  const parts = [product.description, product.aplication && `Aplicación: ${product.aplication}`]
    .filter(Boolean)
    .join(' ');
  return truncate(
    parts || `${product.name}, lubricante Kansaco fabricado en Argentina.`,
    155,
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeSlug(rawSlug);
  const product = await loadProduct(slug);
  if (!product) {
    return {
      title: { absolute: 'Producto no encontrado | Kansaco' },
      robots: { index: false, follow: true },
    };
  }
  const cats = categoryNames(product);
  const title = cats.length ? `${product.name} – ${cats[0]}` : product.name;
  const meta = pageMetadata({
    title,
    description: productDescription(product),
    path: `/productos/${product.slug}`,
    image: product.imageUrl || undefined,
  });
  // productos/layout.tsx define su propio título y corta el template del raíz:
  // la marca se agrega acá.
  return { ...meta, title: { absolute: `${title} | ${siteConfig.company.name}` } };
}

function productJsonLd(product: Product) {
  const url = `${SITE_URL}${canonicalPath(`/productos/${product.slug}`)}`;
  const cats = categoryNames(product);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${url}#producto`,
      name: product.name,
      url,
      ...(product.sku ? { sku: product.sku } : {}),
      ...(product.imageUrl ? { image: [product.imageUrl] } : {}),
      description: productDescription(product),
      ...(cats.length ? { category: cats.join(', ') } : {}),
      brand: { '@type': 'Brand', name: siteConfig.company.name },
      manufacturer: { '@id': `${SITE_URL}/#organizacion` },
      countryOfOrigin: 'AR',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Productos', item: absoluteUrl('/productos/') },
        { '@type': 'ListItem', position: 3, name: product.name, item: url },
      ],
    },
  ];
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug: rawSlug } = await params;
  const product = await loadProduct(decodeSlug(rawSlug));

  return (
    <>
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(productJsonLd(product)) }}
        />
      )}
      {/* Si el backend no respondió, el cliente lo vuelve a intentar como antes. */}
      <ProductDetailClient initialProduct={product} />
    </>
  );
}
