// features/products/components/ProductCard.tsx
//Hardcoded mostly
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';

const displayPrice = (price: number | null): string => {
  if (typeof price === 'number') {
    return `$${price.toFixed(2)}`;
  }
  return '$49999';
};

export default function ProductCard({ product }: { product: Product }) {
  // Lo comento por ahora La base de datos devuelve todo isVisible: false
  // if (!product.isVisible) {
  //   return null;
  // }

  const imageUrl = product.imageUrl || '/sauberatras.jpg';
  const imageAlt = product.name;
  const uniqueCategories =
    product.category && Array.isArray(product.category)
      ? [...new Set(product.category)] // Crea un Set para eliminar duplicados y luego vuelve a convertirlo en array
      : [];

  // Precio hardcodeado para visualización
  const displayedPrice = product.price || 1850.5;

  return (
    <Link href={`/productos/${product.slug}`} className="block h-full w-full">
      <div className="flex h-full flex-col overflow-hidden rounded-lg border shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-green-500 hover:shadow-xl">
        <div className="group relative block aspect-square bg-gray-50">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, 30vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        </div>
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
          <h3 className="mb-2 flex-grow text-base font-semibold text-gray-800 hover:text-green-700 md:text-lg">
            {product.name}
          </h3>
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
          {/* Precio */}
          <p className="mb-3 text-lg font-bold text-green-600">
            {displayPrice(displayedPrice)}
          </p>
          {/* Botón de "Ver detalles" */}
          <div className="mt-auto text-center">
            <span className="inline-block rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-green-700">
              Ver detalles
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
