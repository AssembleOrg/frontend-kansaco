'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CartItem } from '@/types';
import { useCart } from '../../hooks/useCart';
import { Button } from '@/components/ui/button';
import { Trash, Plus, Minus, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface CartItemCardProps {
  item: CartItem;
}

export const CartItemCard = ({ item }: CartItemCardProps) => {
  const {
    removeFromCart,
    updateQuantity,
    formatPrice,
    isLoading,
    getProductPrice,
  } = useCart();
  const { product, quantity, id } = item;
  const [localLoading, setLocalLoading] = useState(false);

  const productPrice = getProductPrice(product);
  const totalPrice = productPrice * quantity;

  const handleRemove = async () => {
    setLocalLoading(true);
    try {
      await removeFromCart(id);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleIncrement = async () => {
    setLocalLoading(true);
    try {
      await updateQuantity(id, quantity + 1);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDecrement = async () => {
    setLocalLoading(true);
    try {
      if (quantity > 1) {
        await updateQuantity(id, quantity - 1);
      } else {
        await removeFromCart(id);
      }
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

            <div className="mt-auto flex items-center justify-between pt-2">
              <div className="flex items-center rounded-md border">
                <button
                  onClick={handleDecrement}
                  className="flex h-6 w-6 items-center justify-center rounded-l-md border-r hover:bg-gray-100 disabled:opacity-50"
                  aria-label="Disminuir cantidad"
                  disabled={isButtonDisabled}
                >
                  <Minus size={14} />
                </button>
                <span className="flex h-6 w-8 items-center justify-center text-xs">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="flex h-6 w-6 items-center justify-center rounded-r-md border-l hover:bg-gray-100 disabled:opacity-50"
                  aria-label="Aumentar cantidad"
                  disabled={isButtonDisabled}
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium">{formatPrice(totalPrice)}</p>
                {quantity > 1 && (
                  <p className="text-xs text-gray-500">
                    {formatPrice(productPrice)} x {quantity}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
