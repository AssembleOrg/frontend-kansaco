import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCallback } from 'react';
import { Product } from '@/types';

// Constante para el mínimo de compra
export const MINIMUM_PURCHASE = 400000;

// Genera un precio aleatorio pero consistente basado en el ID del producto
// (Temporal hasta tener precios reales en la API)
const generateConsistentPrice = (productId: number): number => {
  const seed = productId || Math.floor(Math.random() * 1000);
  return 5000 + ((seed * 937) % 45000);
};

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

  const { token } = useAuthStore();

  // Calcular el número total de items en el carrito
  const itemCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  // Calcular el subtotal del carrito (sin impuestos ni envío)
  const subtotal =
    cart?.items.reduce((total, item) => {
      // Si el precio es null, undefined o 0, usar un precio generado consistentemente
      const price =
        item.product.price && item.product.price > 0
          ? item.product.price
          : generateConsistentPrice(item.product.id);
      return total + price * item.quantity;
    }, 0) || 0;

  // Formateo seguro que maneja cualquier tipo de entrada
  const formatPrice = (price: number | string | null | undefined): string => {
    if (price === undefined || price === null || price === 0) {
      return '$9.999,00';
    }

    if (typeof price === 'string') {
      const numPrice = parseFloat(price);
      if (!isNaN(numPrice)) {
        return `$${numPrice.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return '$9.999,00';
    }

    if (typeof price === 'number') {
      if (!isNaN(price) && isFinite(price)) {
        return `$${price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return '$9.999,00';
    }

    return '$9.999,00';
  };

  // Verificar si un producto está en el carrito
  const isInCart = (productId: number): boolean => {
    return cart?.items.some((item) => item.product.id === productId) || false;
  };

  // Obtener la cantidad de un producto específico en el carrito
  const getQuantity = (productId: number): number => {
    const item = cart?.items.find((item) => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  // Verificar si se ha alcanzado el mínimo de compra
  const hasReachedMinimumPurchase = subtotal >= MINIMUM_PURCHASE;

  // Calcular el porcentaje alcanzado del mínimo de compra
  const percentageToMinimum = Math.min(
    (subtotal / MINIMUM_PURCHASE) * 100,
    100
  );

  // Calcular cuánto falta para el mínimo de compra
  const amountMissingForMinimum = Math.max(MINIMUM_PURCHASE - subtotal, 0);

  // Función para sincronizar el carrito con el servidor de manera segura
  const syncCart = useCallback(async () => {
    if (token) {
      await syncWithServer();
    }
  }, [token, syncWithServer]);

  // Obtener el precio real o generado para un producto específico
  const getProductPrice = (product: Product): number => {
    return product.price && product.price > 0
      ? product.price
      : generateConsistentPrice(product.id);
  };

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
