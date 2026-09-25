'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, ShoppingCart, LogIn, ArrowRight, Trash2 } from 'lucide-react';

import { useCartStore } from '../../store/cartStore';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PRICES_ENABLED } from '@/lib/flags';

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CartItemCard } from './CartItemCard';
import { useBultos } from '@/features/cart/hooks/useBultos';

export const CartDrawer = () => {
  const { token } = useAuth();

  const isCartOpen = useCartStore((s) => s.isCartOpen);
  const closeCart = useCartStore((s) => s.closeCart);

  const { cart, itemCount, isLoading, error, syncCart, clearCart, subtotal, formatPrice } = useCart();

  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);
  // Un solo pedido de bultos para todo el carrito (no uno por tarjeta).
  const bultos = useBultos((cart?.items || []).map((i) => i.product.id), isCartOpen);

  const isAuthenticated = !!token;
  const productCount = cart?.items?.length ?? 0;
  const hasItems = productCount > 0;
  const canProceedToCheckout = isAuthenticated && hasItems;

  useEffect(() => {
    if (isCartOpen) syncCart();
  }, [isCartOpen, syncCart]);

  const handleProceedToCheckout = () => closeCart();

  const confirmEmptyCart = () => {
    setConfirmEmptyOpen(false);
    clearCart();
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-neutral-200 bg-white px-5 py-4 text-left">
          <div className="flex items-center justify-between gap-3">
            <SheetTitle className="flex items-center gap-2 text-base font-semibold text-neutral-900">
              <ShoppingCart className="h-5 w-5 text-green-700" />
              Tu carrito
            </SheetTitle>
            {hasItems && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                {itemCount} {itemCount === 1 ? 'unidad' : 'unidades'}
              </span>
            )}
          </div>
          {hasItems && (
            <SheetDescription className="text-xs text-neutral-500">
              {productCount} {productCount === 1 ? 'producto' : 'productos'} listos para pedir
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overscroll-contain bg-neutral-50 px-4 py-4">
          {error && (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading && !hasItems ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[110px] animate-pulse rounded-xl border border-neutral-200 bg-white"
                />
              ))}
            </div>
          ) : hasItems ? (
            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {(cart?.items || []).map((item) => (
                  <motion.li
                    key={`${item.product.id}-${item.presentation ?? ''}`}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.2 }}
                  >
                    <CartItemCard
                      item={item}
                      bultos={bultos[item.product.id]?.[item.presentation ?? '']}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-neutral-300 bg-white">
                <ShoppingBag className="h-9 w-9 text-neutral-400" />
              </div>
              <p className="mb-1 text-base font-semibold text-neutral-800">
                Tu carrito está vacío
              </p>
              <p className="mb-5 max-w-xs text-sm text-neutral-500">
                Agregá productos para comenzar tu pedido. Te esperan los productos Kansaco.
              </p>
              <Link href="/productos" onClick={closeCart}>
                <Button className="bg-green-600 hover:bg-green-700">
                  Explorar productos
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {hasItems && (
          <SheetFooter className="safe-bottom border-t border-neutral-200 bg-white px-5 py-4 sm:flex-col sm:items-stretch sm:space-x-0">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Productos</span>
              <span className="font-semibold tabular-nums text-neutral-900">
                {productCount} · {itemCount} {itemCount === 1 ? 'ud.' : 'uds.'}
              </span>
            </div>

            {PRICES_ENABLED && subtotal > 0 && (
              <div className="mt-1 flex items-center justify-between text-base">
                <span className="font-medium text-neutral-700">Subtotal</span>
                <span className="font-bold tabular-nums text-neutral-900">
                  {formatPrice(subtotal)}
                </span>
              </div>
            )}

            <div className="mt-3 flex flex-col gap-2">
              {canProceedToCheckout ? (
                <Link href="/checkout" className="w-full">
                  <Button
                    className="h-11 w-full bg-green-600 text-base font-semibold hover:bg-green-700"
                    onClick={handleProceedToCheckout}
                  >
                    Proceder al pago
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <div className="space-y-2">
                  {!isAuthenticated && (
                    <div className="flex items-center gap-1.5 rounded-md bg-green-50 p-2 text-xs text-green-800">
                      <LogIn className="h-4 w-4" />
                      <span>Iniciá sesión para finalizar tu pedido</span>
                    </div>
                  )}
                  <Button className="h-11 w-full" disabled>
                    Proceder al pago
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={closeCart}
                  variant="outline"
                  className="flex-1"
                >
                  Seguir comprando
                </Button>
                <Button
                  onClick={() => setConfirmEmptyOpen(true)}
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  aria-label="Vaciar carrito"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>

      <Dialog open={confirmEmptyOpen} onOpenChange={setConfirmEmptyOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Vaciar carrito</DialogTitle>
            <DialogDescription>
              Esta acción quitará todos los productos del carrito. ¿Continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmEmptyOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmEmptyCart}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Vaciar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
};
