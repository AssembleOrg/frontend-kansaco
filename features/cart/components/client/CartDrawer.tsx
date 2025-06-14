'use client';

import { useEffect } from 'react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CartItemCard } from './CartItemCard';
import { ShoppingCart, AlertCircle, Check, LogIn } from 'lucide-react';
import Link from 'next/link';

export const CartDrawer = () => {
  const { token } = useAuth();
  const {
    cart,
    isCartOpen,
    closeCart,
    itemCount,
    subtotal,
    formatPrice,
    isLoading,
    error,
    syncCart,
    MINIMUM_PURCHASE,
    hasReachedMinimumPurchase,
    percentageToMinimum,
    amountMissingForMinimum,
    clearCart,
  } = useCart();

  const isAuthenticated = !!token;
  const canProceedToCheckout = isAuthenticated && hasReachedMinimumPurchase;

  useEffect(() => {
    if (isCartOpen) {
      syncCart();
    }
  }, [isCartOpen, syncCart]);

  const handleProceedToCheckout = () => {
    closeCart();
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="space-y-2.5">
          <SheetTitle className="flex items-center text-xl">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Carrito de compra
          </SheetTitle>
        </SheetHeader>

        {isLoading && (
          <div className="flex h-20 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-600"></div>
            <span className="ml-2 text-sm text-gray-500">Cargando...</span>
          </div>
        )}

        {error && (
          <div className="my-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            <p>Ha ocurrido un error: {error}</p>
            <p className="mt-1 text-xs">
              Puedes intentar cerrar y abrir el carrito nuevamente.
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-4">
          {!isLoading && cart && cart.items.length > 0 ? (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <CartItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            !isLoading && (
              <div className="flex h-full flex-col items-center justify-center">
                <ShoppingCart className="mb-4 h-16 w-16 text-gray-300" />
                <p className="mb-1 text-xl font-medium">
                  Tu carrito está vacío
                </p>
                <p className="mb-4 text-center text-sm text-gray-500">
                  Añade productos a tu carrito para comenzar tu compra
                </p>
                <Button onClick={closeCart} variant="outline">
                  Continuar comprando
                </Button>
              </div>
            )
          )}
        </div>

        {!isLoading && cart && cart.items.length > 0 && (
          <SheetFooter className="border-t border-gray-200 pt-4">
            <div className="w-full space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Cantidad de productos</span>
                  <span>
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 rounded-md bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Monto mínimo de compra
                  </span>
                  <span className="text-sm font-medium">
                    {formatPrice(MINIMUM_PURCHASE)}
                  </span>
                </div>
                <Progress value={percentageToMinimum} className="h-2" />

                {hasReachedMinimumPurchase ? (
                  <div className="flex items-center rounded-md bg-green-50 p-2 text-xs text-green-600">
                    <Check className="mr-1 h-4 w-4" />
                    <span>¡Has alcanzado el monto mínimo de compra!</span>
                  </div>
                ) : (
                  <div className="flex items-start rounded-md bg-amber-50 p-2 text-xs text-amber-600">
                    <AlertCircle className="mr-1 mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>
                      Te faltan {formatPrice(amountMissingForMinimum)} para
                      completar tu pedido
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {canProceedToCheckout ? (
                  <Link href="/checkout" className="w-full">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={handleProceedToCheckout}
                    >
                      Proceder al pago
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    {!isAuthenticated && (
                      <div className="flex items-center rounded-md bg-blue-50 p-2 text-xs text-blue-600">
                        <LogIn className="mr-1 h-4 w-4" />
                        <span>
                          Debes iniciar sesión para proceder al pago
                        </span>
                      </div>
                    )}
                    {!hasReachedMinimumPurchase && (
                      <div className="flex items-start rounded-md bg-amber-50 p-2 text-xs text-amber-600">
                        <AlertCircle className="mr-1 mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>
                          Te faltan {formatPrice(amountMissingForMinimum)} para
                          alcanzar el mínimo de compra mayorista
                        </span>
                      </div>
                    )}
                    <Button
                      className="w-full cursor-not-allowed bg-gray-400 hover:bg-gray-500"
                      disabled
                      title={
                        !isAuthenticated
                          ? "Debes iniciar sesión para proceder al pago"
                          : "Debes alcanzar el mínimo de compra"
                      }
                    >
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
                    onClick={() => clearCart()}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Vaciar carrito
                  </Button>
                </div>
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
