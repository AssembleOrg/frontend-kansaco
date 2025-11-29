'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CartItem } from '@/types';
import { useCart } from '../../hooks/useCart';
import { Button } from '@/components/ui/button';
import { Trash, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface CartItemCardProps {
  item: CartItem;
}

export const CartItemCard = ({ item }: CartItemCardProps) => {
  const {
    removeFromCart,
    isLoading,
    getProductPrice,
    formatPrice,
  } = useCart();
  const { product, quantity } = item;
  const [localLoading, setLocalLoading] = useState(false);

  const productPrice = getProductPrice(product);

  // Use product.id for all operations (consistent across server/local)
  const handleRemove = async () => {
    setLocalLoading(true);
    try {
      await removeFromCart(product.id);
    } finally {
      setLocalLoading(false);
    }
  };

  const isButtonDisabled = isLoading || localLoading;

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="flex p-3">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 h-6 w-6 flex-shrink-0 self-start text-gray-400 hover:text-red-500"
          onClick={handleRemove}
          disabled={isButtonDisabled}
          aria-label="Eliminar del carrito"
        >
          {localLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash size={14} />
          )}
        </Button>

        <div className="flex flex-1 gap-3">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
            <Link href={`/productos/${product.slug}`}>
              <Image
                src={product.imageUrl || '/sauberatras.jpg'}
                alt={product.name}
                fill
                className="object-contain p-1"
              />
            </Link>
          </div>

          <div className="flex flex-1 flex-col">
            <Link
              href={`/productos/${product.slug}`}
              className="line-clamp-2 font-medium text-gray-700 hover:text-green-600"
            >
              {product.name}
            </Link>

            {product.sku && (
              <span className="text-xs text-gray-500">SKU: {product.sku}</span>
            )}

            {item.presentation && (
              <span className="mt-1 text-xs text-gray-600 font-medium">
                Presentación: {item.presentation}
              </span>
            )}

            <div className="mt-auto flex items-center justify-between pt-2">
              <div className="text-sm text-gray-600">
                Cantidad: <span className="font-medium">{quantity}</span>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatPrice(productPrice * quantity)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
