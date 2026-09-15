// features/cart/hooks/useCart.ts
import { useCallback, useMemo } from 'react';
import { useCartStore } from '../store/cartStore';
import { Product } from '@/types/product';

const MINIMUM_PURCHASE = 50000;

export const useCart = () => {
  const cartRaw = useCartStore((s) => s.cart);
  const isCartOpen = useCartStore((s) => s.isCartOpen);
  const isLoading = useCartStore((s) => s.isLoading);
  const error = useCartStore((s) => s.error);

  const addToCart = useCartStore((s) => s.addToCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const openCart = useCartStore((s) => s.openCart);
  const closeCart = useCartStore((s) => s.closeCart);
  const syncWithServer = useCartStore((s) => s.syncWithServer);

  // Defensive sanitization at consumption time (belt + suspenders)
  const cart = useMemo(() => {
    if (!cartRaw) return cartRaw;
    const items = (cartRaw.items || []).filter(
      (i) => i && i.product && typeof i.quantity === 'number' && i.quantity > 0
    );
    return { ...cartRaw, items };
  }, [cartRaw]);

  const itemCount = useMemo(
    () => (cart?.items || []).reduce((t, i) => t + (i?.quantity || 0), 0),
    [cart]
  );

  const subtotal = useMemo(
    () =>
      (cart?.items || []).reduce((total, item) => {
        if (!item?.product) return total;
        // El precio ya viene calculado por el backend según el rol (o null si
        // el usuario no ve precios). No se inventan precios en el cliente.
        const raw =
          typeof item.product.price === 'string'
            ? parseFloat(item.product.price)
            : item.product.price;
        const price = typeof raw === 'number' && isFinite(raw) && raw > 0 ? raw : 0;
        return total + price * (item.quantity || 0);
      }, 0),
    [cart]
  );

  const formatPrice = useCallback((price: number | string | null | undefined): string => {
    if (price === undefined || price === null || price === 0) return '$0,00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (typeof numPrice === 'number' && !isNaN(numPrice) && isFinite(numPrice)) {
      return `$${numPrice.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return '$0,00';
  }, []);

  const isInCart = useCallback(
    (productId: number): boolean =>
      (cart?.items || []).some((i) => i?.product?.id === productId),
    [cart]
  );

  const getQuantity = useCallback(
    (productId: number): number => {
      const item = (cart?.items || []).find((i) => i?.product?.id === productId);
      return item?.quantity || 0;
    },
    [cart]
  );

  // Precio ya resuelto por el backend según el rol. null / 0 => sin precio visible.
  const getProductPrice = useCallback((product: Product | null | undefined): number => {
    if (!product) return 0;
    const raw = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    return typeof raw === 'number' && isFinite(raw) && raw > 0 ? raw : 0;
  }, []);

  const hasReachedMinimumPurchase = subtotal >= MINIMUM_PURCHASE;
  const percentageToMinimum = Math.min((subtotal / MINIMUM_PURCHASE) * 100, 100);
  const amountMissingForMinimum = Math.max(MINIMUM_PURCHASE - subtotal, 0);

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
