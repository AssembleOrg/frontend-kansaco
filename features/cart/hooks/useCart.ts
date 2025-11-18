// features/cart/hooks/useCart.ts
import { useCallback } from 'react';
import { useCartStore } from '../store/cartStore';
import { generateConsistentPrice } from '@/lib/utils';

const MINIMUM_PURCHASE = 50000; // $50,000 mínimo de compra

export const useCart = () => {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    toggleCart,
    openCart,
    closeCart,
    isLoading,
    error,
    syncWithServer,
  } = useCartStore();

  const itemCount =
    cart?.items?.reduce((total, item) => (total + (item?.quantity || 0)), 0) || 0;

  const subtotal =
    cart?.items?.reduce((total, item) => {
      if (!item || !item.product) {
        return total;
      }
      const price =
        item.product.price && item.product.price > 0
          ? item.product.price
          : generateConsistentPrice(item.product.id);
      return total + price * (item.quantity || 0);
    }, 0) || 0;

  const formatPrice = (price: number | string | null | undefined): string => {
    if (price === undefined || price === null || price === 0) {
      return '$0,00';
    }
    if (typeof price === 'string') {
      const numPrice = parseFloat(price);
      if (!isNaN(numPrice)) {
        return `$${numPrice.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return '$0,00';
    }
    if (typeof price === 'number') {
      if (!isNaN(price) && isFinite(price)) {
        return `$${price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return '$0,00';
    }
    return '$0,00';
  };

  const isInCart = (productId: number): boolean => {
    return cart?.items?.some((item) => item?.product?.id === productId) || false;
  };

  const getQuantity = (productId: number): number => {
    const item = cart?.items?.find((item) => item?.product?.id === productId);
    return item?.quantity || 0;
  };

  const hasReachedMinimumPurchase = subtotal >= MINIMUM_PURCHASE;

  const percentageToMinimum = Math.min(
    (subtotal / MINIMUM_PURCHASE) * 100,
    100
  );

  const amountMissingForMinimum = Math.max(MINIMUM_PURCHASE - subtotal, 0);

  const getProductPrice = (product: any): number => {
    if (!product) {
      return 0;
    }
    return product.price && product.price > 0
      ? product.price
      : generateConsistentPrice(product.id);
  };

  const syncCart = useCallback(async () => {
    await syncWithServer();
  }, [syncWithServer]);

  return {
    cart,
    itemCount,
    subtotal,
    formatPrice,
    isInCart,
    getQuantity,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    toggleCart,
    openCart,
    closeCart,
    isLoading,
    error,
    syncCart,
    MINIMUM_PURCHASE,
    hasReachedMinimumPurchase,
    percentageToMinimum,
    amountMissingForMinimum,
    getProductPrice,
  };
};
