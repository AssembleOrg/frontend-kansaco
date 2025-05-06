'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { useCart } from '../../hooks/useCart';
import { Button } from '@/components/ui/button';
import { Plus, Minus, ShoppingCart, Loader2 } from 'lucide-react';

interface AddToCartButtonProps {
  product: Product;
  variant?: 'default' | 'outline' | 'card';
  size?: 'sm' | 'default' | 'lg';
  showQuantity?: boolean;
  className?: string;
}

export const AddToCartButton = ({
  product,
  variant = 'default',
  size = 'default',
  showQuantity = true,
  className = '',
}: AddToCartButtonProps) => {
  const {
    addToCart,
    isInCart,
    getQuantity,
    updateQuantity,
    removeFromCart,
    isLoading,
    openCart,
  } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [localLoading, setLocalLoading] = useState(false);

  const productInCart = isInCart(product.id);
  const cartQuantity = getQuantity(product.id);

  const handleAddToCart = async () => {
    setLocalLoading(true);
    try {
      if (!productInCart) {
        await addToCart(product, quantity);
        setQuantity(1);
        openCart();
      } else {
        await updateQuantity(product.id, cartQuantity + 1);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const incrementQuantity = () => {
    if (productInCart) {
      updateQuantity(product.id, cartQuantity + 1);
    } else {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (productInCart) {
      if (cartQuantity > 1) {
        updateQuantity(product.id, cartQuantity - 1);
      } else {
        removeFromCart(product.id);
      }
    } else {
      setQuantity((prev) => Math.max(1, prev - 1));
    }
  };

  const getButtonClass = () => {
    if (variant === 'card') {
      return 'w-full bg-green-600 hover:bg-green-700 text-white';
    }
    if (variant === 'outline') {
      return 'border-green-600 text-green-600 hover:bg-green-50';
    }
    return 'bg-green-600 hover:bg-green-700 text-white';
  };

  const buttonSizeClass =
    size === 'sm' ? 'py-1 text-sm' : size === 'lg' ? 'py-3 text-lg' : 'py-2';

  const isButtonLoading = isLoading || localLoading;

  return (
    <div className={`flex flex-col ${className}`}>
      {showQuantity && (
        <div className="mb-2 flex items-center justify-center rounded-md border border-gray-300">
          <button
            onClick={decrementQuantity}
            className="flex h-8 w-8 items-center justify-center rounded-l-md hover:bg-gray-100"
            aria-label="Disminuir cantidad"
            disabled={isButtonLoading}
          >
            <Minus size={16} />
          </button>
          <span className="flex h-8 w-10 items-center justify-center border-x border-gray-300 text-center">
            {productInCart ? cartQuantity : quantity}
          </span>
          <button
            onClick={incrementQuantity}
            className="flex h-8 w-8 items-center justify-center rounded-r-md hover:bg-gray-100"
            aria-label="Aumentar cantidad"
            disabled={isButtonLoading}
          >
            <Plus size={16} />
          </button>
        </div>
      )}

      <Button
        onClick={handleAddToCart}
        className={`flex items-center justify-center gap-2 ${getButtonClass()} ${buttonSizeClass}`}
        disabled={isButtonLoading}
      >
        {isButtonLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <ShoppingCart size={18} />
        )}
        {isButtonLoading
          ? 'Procesando...'
          : productInCart
            ? 'Actualizar carrito'
            : 'Añadir al carrito'}
      </Button>
    </div>
  );
};
