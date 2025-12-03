// app/(shop)/checkout/page.tsx
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
import { Loader2, Building2, Store } from 'lucide-react';
import Link from 'next/link';
import { sendOrderEmail } from '@/lib/api';
import { SendOrderEmailData, BusinessInfo } from '@/types/order';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { token, user, isAuthReady } = useAuth();
  const {
    cart,
    subtotal,
    clearCart,
    isLoading: cartLoading,
    hasReachedMinimumPurchase,
    getProductPrice,
  } = useCart();

  // Datos básicos (ambos tipos de cliente)
  const [fullName, setFullName] = useState(
    user ? `${user.nombre} ${user.apellido}`.trim() : ''
  );
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Datos adicionales para mayoristas
  const [cuit, setCuit] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [situacionAfip, setSituacionAfip] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const isMayorista = user?.rol === 'CLIENTE_MAYORISTA';

  const situacionesAfip = [
    'No Inscripto',
    'Monotributista',
    'Responsable Inscripto',
    'Persona Jurídica'
  ];

  // Validar formato CUIT: XX-XXXXXXXX-X
  const validateCUIT = (cuitValue: string): boolean => {
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
    return cuitRegex.test(cuitValue);
  };

  // Formatear CUIT mientras se escribe
  const handleCuitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Solo números
    if (value.length > 11) value = value.substring(0, 11);

    // Aplicar formato XX-XXXXXXXX-X
    if (value.length <= 2) {
      setCuit(value);
    } else if (value.length <= 10) {
      setCuit(`${value.substring(0, 2)}-${value.substring(2)}`);
    } else {
      setCuit(`${value.substring(0, 2)}-${value.substring(2, 10)}-${value.substring(10)}`);
    }
  };

  // Validar teléfono (solo números, mínimo 8 dígitos)
  const validatePhone = (phoneValue: string): boolean => {
    const phoneDigits = phoneValue.replace(/\D/g, '');
    return phoneDigits.length >= 8;
  };

  useEffect(() => {
    if (!isAuthReady || cartLoading) {
      return;
    }

    // No redirigir si acabamos de confirmar un pedido
    if (orderConfirmed) {
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

    // if (!hasReachedMinimumPurchase) {
    //   console.log(
    //     'Checkout: No se ha alcanzado el mínimo de compra, redirigiendo a productos.'
    //   );
    //   router.replace('/productos?openCart=true');
    //   return;
    // }

    if (user) {
      if (!fullName) setFullName(`${user.nombre} ${user.apellido}`.trim());
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
    orderConfirmed,
  ]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!token || !user?.id) {
      toast.error('Error de autenticación', {
        description: 'Debes iniciar sesión para completar tu pedido.',
        duration: 5000,
      });
      setIsSubmitting(false);
      return;
    }
    if (!cart || cart.items.length === 0) {
      toast.error('Carrito vacío', {
        description: 'Tu carrito está vacío. Añade productos para hacer un pedido.',
        duration: 5000,
      });
      setIsSubmitting(false);
      return;
    }
    // if (!hasReachedMinimumPurchase) {
    //   toast.error('Mínimo de compra', {
    //     description: 'No has alcanzado el mínimo de compra.',
    //     duration: 5000,
    //   });
    //   setIsSubmitting(false);
    //   return;
    // }
    if (!fullName || !email || !phone || !address) {
      toast.error('Campos incompletos', {
        description: 'Por favor, completa todos los campos obligatorios.',
        duration: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    // Validar teléfono
    if (!validatePhone(phone)) {
      toast.error('Teléfono inválido', {
        description: 'El teléfono debe tener al menos 8 dígitos.',
        duration: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    // Validaciones adicionales para mayoristas
    if (isMayorista) {
      if (!cuit || !situacionAfip) {
        toast.error('Datos fiscales incompletos', {
          description: 'Por favor, completa los datos fiscales requeridos (CUIT y Situación AFIP).',
          duration: 5000,
        });
        setIsSubmitting(false);
        return;
      }

      if (!validateCUIT(cuit)) {
        toast.error('CUIT inválido', {
          description: 'El formato del CUIT no es válido. Debe ser XX-XXXXXXXX-X',
          duration: 5000,
        });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Preparar datos para el email
      const orderEmailData: SendOrderEmailData = {
        customerType: isMayorista ? 'CLIENTE_MAYORISTA' : 'CLIENTE_MINORISTA',
        contactInfo: {
          fullName,
          email,
          phone,
          address,
        },
        items: cart.items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: getProductPrice(item.product),
          presentation: item.presentation || '',
        })),
        totalAmount: subtotal,
        notes: notes || undefined,
      };

      // Agregar datos de negocio si es mayorista
      if (isMayorista) {
        const businessInfo: BusinessInfo = {
          cuit,
          situacionAfip,
          razonSocial: razonSocial || undefined,
          codigoPostal: codigoPostal || undefined,
        };
        orderEmailData.businessInfo = businessInfo;
      }

      // Enviar email y crear orden en BD
      const response = await sendOrderEmail(token, orderEmailData);

      // Guardar el PDF base64 en sessionStorage para que esté disponible en order-success
      if (response.pdfBase64) {
        sessionStorage.setItem(`order-pdf-${response.orderId}`, response.pdfBase64);
        if (response.presupuestoNumber) {
          sessionStorage.setItem(`order-presupuesto-${response.orderId}`, response.presupuestoNumber);
        }
      }

      // NO mostrar toast aquí - se muestra en order-success page
      // El toast se mostrará en la página de confirmación para mejor UX

      // Marcar que el pedido fue confirmado antes de limpiar el carrito
      setOrderConfirmed(true);
      
      // Vaciar carrito
      await clearCart();
      
      // Limpiar el formulario
      setFullName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setNotes('');
      setCuit('');
      setRazonSocial('');
      setSituacionAfip('');
      setCodigoPostal('');
      
      // Redirigir a order-success con el orderId
      router.replace(`/order-success?orderId=${response.orderId}`);
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Hubo un error al procesar tu pedido. Inténtalo de nuevo.';
      
      // Mostrar notificación de error (ya no usamos setErrorMessage)
      toast.error('Error al procesar el pedido', {
        description: errorMessage,
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadyToRenderForm =
    isAuthReady &&
    !cartLoading &&
    !!token &&
    cart &&
    cart.items.length > 0;

  if (!isReadyToRenderForm) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <p>Cargando tu carrito o verificando tu sesión...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        Finalizar Compra
      </h1>

      {/* Indicador de tipo de cliente */}
      <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
        isMayorista
          ? 'bg-amber-50 border border-amber-200'
          : 'bg-green-50 border border-green-200'
      }`}>
        {isMayorista ? (
          <>
            <Building2 className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-amber-800">
              Estás comprando como Cliente Mayorista
            </span>
          </>
        ) : (
          <>
            <Store className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">
              Estás comprando como Cliente Minorista
            </span>
          </>
        )}
      </div>

      {/* Advertencia si no se alcanza el mínimo de compra */}
   
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
                    {item.presentation && (
                      <p className="text-sm text-gray-600 font-medium mt-1">
                        Presentación: {item.presentation}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t pt-4 text-right">
              <p className="text-sm text-gray-500">
                {cart.items.reduce((acc, item) => acc + item.quantity, 0)} productos en tu pedido
              </p>
            </div>
          </div>

          {/* Formulario de Contacto y Envío */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 border-b pb-3 text-2xl font-semibold">
              Datos de Contacto y Envío
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campos básicos */}
              <div className="grid gap-4 md:grid-cols-2">
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
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="phone" className="mb-2 block">
                    Teléfono <span className="text-red-500">*</span>
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
                {isMayorista && (
                  <div>
                    <Label htmlFor="codigoPostal" className="mb-2 block">
                      Código Postal
                    </Label>
                    <Input
                      id="codigoPostal"
                      type="text"
                      value={codigoPostal}
                      onChange={(e) => setCodigoPostal(e.target.value)}
                      placeholder="CP"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="address" className="mb-2 block">
                  Dirección de Envío <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle, número, piso, departamento, localidad, provincia"
                  rows={3}
                  required
                />
              </div>

              {/* Campos adicionales para mayoristas */}
              {isMayorista && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-amber-600" />
                    Datos Fiscales
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="cuit" className="mb-2 block">
                        CUIT <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="cuit"
                        type="text"
                        value={cuit}
                        onChange={handleCuitChange}
                        placeholder="XX-XXXXXXXX-X"
                        maxLength={13}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="razonSocial" className="mb-2 block">
                        Razón Social
                      </Label>
                      <Input
                        id="razonSocial"
                        type="text"
                        value={razonSocial}
                        onChange={(e) => setRazonSocial(e.target.value)}
                        placeholder="Nombre de la empresa"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="situacionAfip" className="mb-2 block">
                      Situación ante AFIP <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="situacionAfip"
                      value={situacionAfip}
                      onChange={(e) => setSituacionAfip(e.target.value)}
                      required
                      className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    >
                      <option value="">Selecciona tu situación</option>
                      {situacionesAfip.map((situacion) => (
                        <option key={situacion} value={situacion}>
                          {situacion}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

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

        {/* Columna Lateral */}
        <div className="md:col-span-1">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 border-b pb-3 text-2xl font-semibold">
              Información Importante
            </h2>
            <p className="mb-4 text-gray-700">
              Después de confirmar tu pedido, recibirás un email de confirmación
              y un miembro de nuestro equipo se comunicará contigo para
              finalizar los detalles de pago y coordinar el envío.
            </p>
            <p className="text-gray-700">
              Asegúrate de que tus datos de contacto sean correctos.
            </p>

            {isMayorista && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Nota para mayoristas:</strong> Los precios mayoristas
                  serán confirmados por nuestro equipo comercial según volumen
                  y condiciones de pago.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
