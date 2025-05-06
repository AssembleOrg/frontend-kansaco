'use client';

import { ReactNode, useEffect } from 'react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCart } from '../hooks/useCart';
import { CartDrawer } from '../components/client/CartDrawer';

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const { syncCart } = useCart();
  const { token, user } = useAuthStore();

  // Sincronización cuando el usuario inicia sesión
  useEffect(() => {
    if (user && token) {
      console.log(
        'Usuario autenticado, sincronizando carrito con el servidor...'
      );
      syncCart();
    }
  }, [user, token, syncCart]);

  // Sincronización tras la hidratación de los stores
  useEffect(() => {
    const isCartStoreHydrated = useCartStore.persist.hasHydrated();
    const isAuthStoreHydrated = useAuthStore.persist.hasHydrated();

    if (isCartStoreHydrated && isAuthStoreHydrated && user && token) {
      console.log(
        'Hidratación completa, usuario autenticado, sincronizando carrito...'
      );
      syncCart();
    }
  }, [user, token, syncCart]);

  return (
    <>
      {children}
      <CartDrawer />
    </>
  );
};
