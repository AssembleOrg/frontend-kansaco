// features/products/components/ProductCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/features/cart/components/client/AddToCartButton';
import { useCart } from '@/features/cart/hooks/useCart';

export default function ProductCard({ product }: { product: Product }) {
  const { formatPrice, getProductPrice } = useCart();

  const imageUrl = product.imageUrl || '/sauberatras.jpg';
  const imageAlt = product.name;
  const uniqueCategories =
    product.category && Array.isArray(product.category)
      ? [...new Set(product.category)]
      : [];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-green-500 hover:shadow-xl">
      <Link
        href={`/productos/${product.slug}`}
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
        <Link href={`/productos/${product.slug}`}>
          <h3 className="mb-2 flex-grow text-base font-semibold text-gray-800 hover:text-green-700 md:text-lg">
            {product.name}
          </h3>
        </Link>

        {/* SKU si existe */}
        {product.sku && (
          <p className="mb-1 text-xs text-gray-500">SKU: {product.sku}</p>
        )}

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
          <Link href={`/productos/${product.slug}`} className="block">
            <span className="block w-full rounded-md border border-green-600 bg-white px-4 py-2 text-center text-sm font-medium text-green-600 transition-colors duration-300 hover:bg-green-50">
              Ver detalles
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
