// features/cart/providers/CartProvider.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '../store/cartStore';
import { CartDrawer } from '../components/client/CartDrawer';

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const { syncWithServer, cart } = useCartStore();
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const token = useAuthStore((state) => state.token);
  const [initialSyncDone, setInitialSyncDone] = useState(false);

  useEffect(() => {
    if (!isAuthReady) {
      console.log('CartProvider: Esperando hidratación de Auth Store...');
      return;
    }

    if (token && !initialSyncDone) {
      console.log(
        'CartProvider: Autenticado y listo. Realizando sincronización inicial del carrito...'
      );
      syncWithServer();
      setInitialSyncDone(true);
    } else if (!token && initialSyncDone) {
      console.log(
        'CartProvider: Usuario desautenticado. Reseteando bandera de sync inicial.'
      );
      setInitialSyncDone(false);
    } else if (!token) {
      console.log('CartProvider: No autenticado. Carrito operará localmente.');
    }
  }, [isAuthReady, token, syncWithServer, initialSyncDone]);

  return (
    <>
      {children}
      <CartDrawer />
    </>
  );
};
