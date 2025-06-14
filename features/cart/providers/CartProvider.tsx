// features/cart/providers/CartProvider.tsx
'use client';

import { ReactNode, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '../store/cartStore';
import { CartDrawer } from '../components/client/CartDrawer';

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const { syncWithServer } = useCartStore();
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const syncedRef = useRef(false);

  const isAuthenticated = !!(token && user?.id);
  const userId = user?.id;

  // Memoizar la función de sincronización
  const handleSync = useCallback(() => {
    if (!isAuthReady || syncedRef.current) {
      return;
    }

    if (isAuthenticated && userId) {
      console.log('CartProvider: Sincronizando carrito con servidor usando userId como cartId');
      syncWithServer();
      syncedRef.current = true;
    } else {
      console.log('CartProvider: Usuario no autenticado, carrito local');
      syncedRef.current = false;
    }
  }, [isAuthReady, isAuthenticated, userId, syncWithServer]);

  useEffect(() => {
    handleSync();
  }, [handleSync]);

  // Reset sync flag when user changes
  useEffect(() => {
    syncedRef.current = false;
  }, [userId]);

  return (
    <>
      {children}
      <CartDrawer />
    </>
  );
};
