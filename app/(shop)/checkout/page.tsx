// app/(shop)/checkout/page.tsx
//Todavia no aplicado los endpoints so placeholder
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCart } from '@/features/cart/hooks/useCart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { token, user, isAuthReady } = useAuth();
  const {
    cart,
    subtotal,
    formatPrice,
    clearCart,
    isLoading: cartLoading,
    hasReachedMinimumPurchase,
    getProductPrice,
  } = useCart();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthReady || cartLoading) {
      return;
    }

    if (!token) {
      console.log('Checkout: No autenticado, redirigiendo a login.');
      router.replace(`/login?redirect=/checkout`);
      return;
    }

    if (!cart || cart.items.length === 0) {
      console.log('Checkout: Carrito vacío, redirigiendo a productos.');
      router.replace('/productos');
      return;
    }

    if (!hasReachedMinimumPurchase) {
      console.log(
        'Checkout: No se ha alcanzado el mínimo de compra, redirigiendo al carrito.'
      );
      router.replace('/cart');
      return;
    }

    if (user) {
      if (!fullName) setFullName(user.fullName || '');
      if (!email) setEmail(user.email || '');
    }
  }, [
    token,
    user,
    isAuthReady,
    cartLoading,
    cart,
    hasReachedMinimumPurchase,
    router,
    fullName,
    email,
  ]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    if (!token || !user?.id) {
      setErrorMessage('Debes iniciar sesión para completar tu pedido.');
      setIsSubmitting(false);
      return;
    }
    if (!cart || cart.items.length === 0) {
      setErrorMessage(
        'Tu carrito está vacío. Añade productos para hacer un pedido.'
      );
      setIsSubmitting(false);
      return;
    }
    if (!hasReachedMinimumPurchase) {
      setErrorMessage('No has alcanzado el mínimo de compra mayorista.');
      setIsSubmitting(false);
      return;
    }
    if (!fullName || !email || !phone || !address) {
      setErrorMessage('Por favor, completa todos los campos obligatorios.');
      setIsSubmitting(false);
      return;
    }

    try {
      const orderData = {
        userId: user.id,
        userEmail: user.email,
        contactInfo: {
          fullName,
          email,
          phone,
          address,
        },
        items: cart.items.map((item) => ({
          productId: item.product.id,
          productSlug: item.product.slug,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: getProductPrice(item.product),
          totalItemPrice: getProductPrice(item.product) * item.quantity,
        })),
        totalAmount: subtotal,
        notes: notes,
        orderDate: new Date().toISOString(),
        paymentMethodSuggestion:
          'Efectivo/Transferencia (a coordinar con administrativa)',
      };

      console.log(
        'PEDIDO SIMULADO (para administrativa):',
        JSON.stringify(orderData, null, 2)
      );

      // Guardar orden en localStorage para que el admin pueda verla
      const existingOrders = JSON.parse(
        localStorage.getItem('pending_orders') || '[]'
      );
      const newOrder = {
        ...orderData,
        id: `order_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      existingOrders.unshift(newOrder);
      localStorage.setItem('pending_orders', JSON.stringify(existingOrders));

      console.log('Orden guardada en localStorage para el admin');

      await clearCart();
      router.replace('/order-success'); // replace para no permitir volver al checkout con el carrito vacío
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      setErrorMessage(
        'Hubo un error al procesar tu pedido. Inténtalo de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadyToRenderForm =
    isAuthReady &&
    !cartLoading &&
    !!token &&
    cart &&
    cart.items.length > 0 &&
    hasReachedMinimumPurchase;

  if (!isReadyToRenderForm) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <p>Cargando tu carrito o verificando tu sesión...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        Finalizar Compra
      </h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Resumen del Pedido */}
        <div className="md:col-span-2">
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 border-b pb-3 text-2xl font-semibold">
              Tu Pedido
            </h2>
            <ul className="divide-y divide-gray-200">
              {cart.items.map((item) => (
                <li key={item.id} className="flex items-center py-4">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image
                      src={item.product.imageUrl || '/sauberatras.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="text-lg font-medium text-gray-800">
                      <Link
                        href={`/productos/${item.product.slug}`}
                        className="hover:text-green-600"
                      >
                        {item.product.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    Consultar precio
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t pt-4 text-right">
              <p className="text-lg font-medium text-gray-700">
                Total: Consultar precio
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Los precios se confirmarán al contactar con nuestro equipo
              </p>
            </div>
          </div>

          {/* Información de Contacto y Envío */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 border-b pb-3 text-2xl font-semibold">
              Datos de Contacto y Envío
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="fullName" className="mb-2 block">
                  Nombre Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="mb-2 block">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.email@ejemplo.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="mb-2 block">
                  Número de Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 1123456789"
                  required
                />
              </div>
              <div>
                <Label htmlFor="address" className="mb-2 block">
                  Dirección de Envío <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle, número, piso, departamento, localidad, provincia, código postal"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes" className="mb-2 block">
                  Notas del Pedido (Opcional)
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Horario de entrega preferido, referencias de la casa, etc."
                  rows={3}
                />
              </div>

              {errorMessage && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                  <p>{errorMessage}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando pedido...
                  </>
                ) : (
                  'Confirmar Pedido'
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Columna Lateral*/}
        <div className="md:col-span-1">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 border-b pb-3 text-2xl font-semibold">
              Información Importante
            </h2>
            <p className="mb-4 text-gray-700">
              Actualmente, los pagos se coordinan directamente con nuestra
              administración. Después de confirmar tu pedido, un miembro de
              nuestro equipo se comunicará contigo por teléfono o email para
              finalizar los detalles de pago (efectivo, tarjeta, o link de
              Mercado Pago) y coordinar el envío.
            </p>
            <p className="text-gray-700">
              Asegúrate de que tus datos de contacto sean correctos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
