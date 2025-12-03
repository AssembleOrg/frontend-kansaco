'use client';

import { useEffect, useState } from 'react';
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
import { CartItemCard } from './CartItemCard';
import { ShoppingCart, LogIn } from 'lucide-react';
import Link from 'next/link';
import { updateOrder, validateOrderForEdit } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const CartDrawer = () => {
  const { token } = useAuth();
  const router = useRouter();
  const {
    cart,
    isCartOpen,
    closeCart,
    itemCount,
    isLoading,
    error,
    syncCart,
    clearCart,
  } = useCart();

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  const isAuthenticated = !!token;
  const canProceedToCheckout = isAuthenticated && itemCount > 0;

  useEffect(() => {
    if (isCartOpen) {
      syncCart();
    }
  }, [isCartOpen, syncCart]);

  // Detect edit mode from localStorage
  useEffect(() => {
    const validateEditMode = async () => {
      const editMode = localStorage.getItem('editMode');
      const orderId = localStorage.getItem('editingOrderId');

      if (editMode === 'true' && orderId && token) {
        // ✅ VALIDAR que la orden existe
        const validation = await validateOrderForEdit(token, orderId);

        if (!validation.valid) {
          // ❌ Orden no válida → Limpiar y salir de modo edición
          console.warn('⚠️ CartDrawer: Order validation failed:', validation.reason);
          localStorage.removeItem('editMode');
          localStorage.removeItem('editingOrderId');
          localStorage.removeItem('editingOrderItems');

          setIsEditMode(false);
          setEditingOrderId(null);

          toast.error('La orden que intentabas editar ya no está disponible');
          return;
        }

        // ✅ Orden válida
        setIsEditMode(true);
        setEditingOrderId(orderId);
      } else {
        setIsEditMode(false);
        setEditingOrderId(null);
      }
    };

    validateEditMode();
  }, [cart, token]);

  const handleProceedToCheckout = () => {
    closeCart();
  };

  const handleUpdateOrder = async () => {
    if (!editingOrderId || !token) {
      toast.error('No se puede actualizar la orden');
      return;
    }

    try {
      toast.loading('Actualizando orden...');

      const orderItems = (cart?.items || []).map((item, index) => {
        const price = item.product.price;
        const unitPrice = typeof price === 'number'
          ? price
          : parseFloat(String(price || '0'));

        const orderItem = {
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice,
          presentation: item.presentation || '',
        };

        return orderItem;
      });

      if (orderItems.length === 0) {
        toast.dismiss();
        toast.error('Debes tener al menos 1 producto en el carrito');
        return;
      }

      await updateOrder(token, editingOrderId, { items: orderItems });

      localStorage.removeItem('editMode');
      localStorage.removeItem('editingOrderId');
      localStorage.removeItem('editingOrderItems');
      clearCart();

      toast.dismiss();
      toast.success('✅ Orden actualizada correctamente');
      closeCart();

      setTimeout(() => router.push('/mis-pedidos'), 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.dismiss();

      // ✅ MANEJAR 404 ESPECÍFICAMENTE
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        // Orden no existe → Limpiar localStorage
        localStorage.removeItem('editMode');
        localStorage.removeItem('editingOrderId');
        localStorage.removeItem('editingOrderItems');
        clearCart();

        toast.error(
          'Esta orden ya no existe. Serás redirigido a Mis Pedidos.',
          { duration: 4000 }
        );

        setTimeout(() => router.push('/mis-pedidos'), 2000);
        return;
      }

      // ✅ MANEJAR 400 (orden no PENDIENTE)
      if (errorMessage.includes('400') || errorMessage.includes('PENDIENTE')) {
        toast.error(
          'Esta orden ya no puede ser editada (fue procesada o cancelada)',
          { duration: 4000 }
        );

        // Limpiar y redirigir
        localStorage.removeItem('editMode');
        localStorage.removeItem('editingOrderId');
        localStorage.removeItem('editingOrderItems');

        setTimeout(() => router.push('/mis-pedidos'), 2000);
        return;
      }

      // ✅ MANEJAR 403 (sin permisos)
      if (errorMessage.includes('403') || errorMessage.includes('permisos')) {
        toast.error('No tienes permisos para editar esta orden');
        return;
      }

      // ❌ Error genérico
      toast.error('Error al actualizar la orden. Por favor, intenta nuevamente.');
    }
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
              <div className="flex justify-between text-sm text-gray-600">
                <span>Cantidad de productos</span>
                <span className="font-medium">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {isEditMode ? (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleUpdateOrder}
                  >
                    Actualizar Orden
                  </Button>
                ) : canProceedToCheckout ? (
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
                      <div className="flex items-center rounded-md bg-green-50 p-2 text-xs text-green-600">
                        <LogIn className="mr-1 h-4 w-4" />
                        <span>Debes iniciar sesión para proceder al pago</span>
                      </div>
                    )}
                    <Button
                      className="w-full cursor-not-allowed bg-gray-400 hover:bg-gray-500"
                      disabled
                      title="Debes iniciar sesión para proceder al pago"
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
