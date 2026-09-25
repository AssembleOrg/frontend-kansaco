// features/products/components/ProductCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/features/cart/components/client/AddToCartButton';
import { useCart } from '@/features/cart/hooks/useCart';
import { BultoInfo, splitPresentations } from '@/lib/bultos';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/constants/images';

const MAX_PRES = 3;

export default function ProductCard({
  product,
  bultos,
}: {
  product: Product;
  /** Bultos por presentación de este producto (si tiene). */
  bultos?: Record<string, BultoInfo[]>;
}) {
  const { formatPrice, getProductPrice } = useCart();
  const searchParams = useSearchParams();
  
  // Construir la URL del detalle con los parámetros actuales (page, category, etc.)
  const getProductDetailUrl = () => {
    const page = searchParams.get('page');
    const category = searchParams.get('category');
    const params = new URLSearchParams();
    if (page) params.set('page', page);
    if (category) params.set('category', category);
    const queryString = params.toString();
    const safeSlug = encodeURIComponent(product.slug);
    return queryString ? `/productos/${safeSlug}?${queryString}` : `/productos/${safeSlug}`;
  };
  
  const productDetailUrl = getProductDetailUrl();

  const imageUrl = product.imageUrl || DEFAULT_PRODUCT_IMAGE;
  const imageAlt = product.name;
    // Preferir usar categories si está disponible, sino usar category
  const categoryNames = product.categories && product.categories.length > 0
    ? product.categories.map((cat) => cat.name)
    : product.category || [];
  const uniqueCategories = [...new Set(categoryNames)];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-green-500 hover:shadow-xl">
      <Link
        href={productDetailUrl}
        className="group relative block aspect-square bg-gray-50"
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, 30vw"
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-grow flex-col bg-white p-4">
        {/* Muestra las categorías ÚNICAS */}
        {uniqueCategories.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {uniqueCategories.map((catName) => (
              <Badge
                key={catName}
                variant="outline"
                className="border-green-300 bg-green-100 text-xs text-green-800"
              >
                {catName}
              </Badge>
            ))}
          </div>
        )}

        {/* Nombre del producto */}
        <Link href={productDetailUrl}>
          <h3 className="mb-2 flex-grow text-base font-semibold text-gray-800 hover:text-green-700 md:text-lg">
            {product.name}
          </h3>
        </Link>

        {/* SKU si existe */}
        {product.sku && (
          <p className="mb-1 text-xs text-gray-500">SKU: {product.sku}</p>
        )}

        {/* Presentaciones, con el bulto en que se venden */}
        {(() => {
          const pres = splitPresentations(product.presentation);
          if (pres.length === 0) return null;
          return (
            <ul className="mb-3 flex flex-wrap gap-1.5" aria-label="Presentaciones">
              {pres.slice(0, MAX_PRES).map((p) => (
                <li
                  key={p}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] text-gray-700"
                >
                  {p}
                  {bultos?.[p]?.map((b) => (
                    <span key={b.nombre} className="rounded bg-green-100 px-1 font-medium text-green-800">
                      {b.nombre}
                    </span>
                  ))}
                </li>
              ))}
              {pres.length > MAX_PRES && (
                <li className="px-1 text-[11px] text-gray-500">+{pres.length - MAX_PRES} más</li>
              )}
            </ul>
          );
        })()}

        {/* Aplicación del producto */}
        {product.aplication && (
          <p className="mb-3 line-clamp-2 text-sm text-gray-600">
            <span className="font-medium">Aplicación:</span>{' '}
            {product.aplication}
          </p>
        )}


        {/* Botón de añadir al carrito y ver detalles */}
        <div className="mt-auto space-y-2">
          <AddToCartButton
            product={product}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          />
          <Link href={productDetailUrl} className="block">
            <span className="block w-full rounded-md border border-green-600 bg-white px-4 py-2 text-center text-sm font-medium text-green-600 transition-colors duration-300 hover:bg-green-50">
              Ver detalles
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
