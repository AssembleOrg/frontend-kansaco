// app/(shop)/checkout/page.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Loader2,
  Building2,
  Store,
  ShoppingBag,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCart } from '@/features/cart/hooks/useCart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendOrderEmail } from '@/lib/api';
import { SendOrderEmailData, BusinessInfo } from '@/types/order';

const SITUACIONES_AFIP = [
  'No Inscripto',
  'Monotributista',
  'Responsable Inscripto',
  'Persona Jurídica',
];

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

  const [fullName, setFullName] = useState(
    user ? `${user.nombre} ${user.apellido}`.trim() : ''
  );
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [cuit, setCuit] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [situacionAfip, setSituacionAfip] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const isMayorista = user?.rol === 'CLIENTE_MAYORISTA';

  // Reset scroll on mount so the fixed navbar (hide-on-scroll) reappears.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const validateCUIT = (v: string): boolean => /^\d{2}-\d{8}-\d{1}$/.test(v);
  const validatePhone = (v: string): boolean => v.replace(/\D/g, '').length >= 8;

  const handleCuitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length <= 2) setCuit(v);
    else if (v.length <= 10) setCuit(`${v.substring(0, 2)}-${v.substring(2)}`);
    else
      setCuit(
        `${v.substring(0, 2)}-${v.substring(2, 10)}-${v.substring(10)}`
      );
  };

  useEffect(() => {
    if (!isAuthReady || cartLoading || orderConfirmed) return;

    if (!token) {
      router.replace('/login?redirect=/checkout');
      return;
    }
    if (!cart || cart.items.length === 0) {
      router.replace('/productos');
      return;
    }
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

  const validateForm = (): boolean => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Requerido';
    if (!email.trim()) e.email = 'Requerido';
    if (!phone.trim()) e.phone = 'Requerido';
    else if (!validatePhone(phone)) e.phone = 'Mínimo 8 dígitos';
    if (!address.trim()) e.address = 'Requerido';

    if (isMayorista) {
      if (!cuit) e.cuit = 'Requerido';
      else if (!validateCUIT(cuit)) e.cuit = 'Formato XX-XXXXXXXX-X';
      if (!situacionAfip) e.situacionAfip = 'Requerido';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();

    if (!token || !user?.id) {
      toast.error('Error de autenticación', {
        description: 'Debes iniciar sesión para completar tu pedido.',
      });
      return;
    }

    const validItems = (cart?.items || []).filter((i) => i.quantity > 0);
    if (validItems.length === 0) {
      toast.error('Carrito vacío', {
        description: 'Tu carrito está vacío. Añade productos para hacer un pedido.',
      });
      return;
    }

    if (!validateForm()) {
      toast.error('Revisá los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderEmailData: SendOrderEmailData = {
        customerType: isMayorista ? 'CLIENTE_MAYORISTA' : 'CLIENTE_MINORISTA',
        contactInfo: { fullName, email, phone, address },
        items: validItems.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: getProductPrice(item.product),
          presentation: item.presentation || '',
        })),
        totalAmount: subtotal,
        notes: notes || undefined,
      };

      if (isMayorista) {
        const businessInfo: BusinessInfo = {
          cuit,
          situacionAfip,
          razonSocial: razonSocial || undefined,
          codigoPostal: codigoPostal || undefined,
        };
        orderEmailData.businessInfo = businessInfo;
      }

      const response = await sendOrderEmail(token, orderEmailData);

      if (response.pdfBase64) {
        sessionStorage.setItem(`order-pdf-${response.orderId}`, response.pdfBase64);
        if (response.presupuestoNumber) {
          sessionStorage.setItem(
            `order-presupuesto-${response.orderId}`,
            response.presupuestoNumber
          );
        }
      }

      setOrderConfirmed(true);
      window.scrollTo({ top: 0, behavior: 'instant' });
      await clearCart();

      setFullName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setNotes('');
      setCuit('');
      setRazonSocial('');
      setSituacionAfip('');
      setCodigoPostal('');

      router.replace(`/order-success?orderId=${response.orderId}`);
    } catch (err) {
      console.error('Error al procesar el pedido:', err);
      const msg =
        err instanceof Error
          ? err.message
          : 'Hubo un error al procesar tu pedido. Inténtalo de nuevo.';
      toast.error('Error al procesar el pedido', {
        description: msg,
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReady =
    isAuthReady && !cartLoading && !!token && cart && cart.items.length > 0;

  if (!isReady) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-green-600" />
        <p className="text-neutral-600">Cargando tu carrito...</p>
      </div>
    );
  }

  const validItems = cart!.items.filter((i) => i.quantity > 0);
  const totalUnits = validItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen bg-neutral-50 pb-32 md:pb-12">
      <div className="container mx-auto px-4 pt-16 md:pt-20">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">
            Finalizar pedido
          </h1>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium md:text-sm">
            {isMayorista ? (
              <>
                <Building2 className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-amber-800">Cliente Mayorista</span>
              </>
            ) : (
              <>
                <Store className="h-3.5 w-3.5 text-green-600" />
                <span className="text-green-800">Cliente Minorista</span>
              </>
            )}
          </div>
        </header>

        {/* Mobile: collapsible order summary */}
        <details
          className="group mb-4 rounded-xl border border-neutral-200 bg-white md:hidden"
          open={validItems.length <= 3}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-green-700" />
              <span className="text-sm font-semibold text-neutral-900">
                Tu pedido
              </span>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-800">
                {validItems.length} {validItems.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-neutral-500 transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-neutral-100 px-4 py-3">
            <OrderItemsList items={validItems} />
            <p className="mt-3 text-xs text-neutral-500">
              {totalUnits} {totalUnits === 1 ? 'unidad' : 'unidades'} en total
            </p>
          </div>
        </details>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Form column */}
          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            className="space-y-5 md:col-span-2"
            noValidate
          >
            <section className="rounded-xl border border-neutral-200 bg-white p-5 md:p-6">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">
                Datos de contacto
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  id="fullName"
                  label="Nombre completo"
                  required
                  error={errors.fullName}
                >
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu nombre completo"
                    autoComplete="name"
                  />
                </Field>
                <Field id="email" label="Email" required error={errors.email}>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.email@ejemplo.com"
                    autoComplete="email"
                  />
                </Field>
                <Field id="phone" label="Teléfono" required error={errors.phone}>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej: 1123456789"
                    autoComplete="tel"
                  />
                </Field>
                {isMayorista && (
                  <Field id="codigoPostal" label="Código Postal">
                    <Input
                      id="codigoPostal"
                      type="text"
                      inputMode="numeric"
                      value={codigoPostal}
                      onChange={(e) => setCodigoPostal(e.target.value)}
                      placeholder="CP"
                      autoComplete="postal-code"
                    />
                  </Field>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-5 md:p-6">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">
                Dirección de envío
              </h2>
              <Field id="address" label="Dirección" required error={errors.address}>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle, número, piso, departamento, localidad, provincia"
                  rows={3}
                  autoComplete="street-address"
                />
              </Field>
            </section>

            {isMayorista && (
              <section className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 md:p-6">
                <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-neutral-900">
                  <Building2 className="h-5 w-5 text-amber-600" />
                  Datos fiscales
                </h2>
                <p className="mb-4 text-xs text-neutral-600">
                  Necesarios para emitir tu factura.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field id="cuit" label="CUIT" required error={errors.cuit}>
                    <Input
                      id="cuit"
                      type="text"
                      value={cuit}
                      onChange={handleCuitChange}
                      placeholder="XX-XXXXXXXX-X"
                      maxLength={13}
                    />
                  </Field>
                  <Field id="razonSocial" label="Razón Social">
                    <Input
                      id="razonSocial"
                      type="text"
                      value={razonSocial}
                      onChange={(e) => setRazonSocial(e.target.value)}
                      placeholder="Nombre de la empresa"
                    />
                  </Field>
                </div>
                <div className="mt-4">
                  <Field
                    id="situacionAfip"
                    label="Situación ante AFIP"
                    required
                    error={errors.situacionAfip}
                  >
                    <select
                      id="situacionAfip"
                      value={situacionAfip}
                      onChange={(e) => setSituacionAfip(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    >
                      <option value="">Seleccioná tu situación</option>
                      {SITUACIONES_AFIP.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </section>
            )}

            <section className="rounded-xl border border-neutral-200 bg-white p-5 md:p-6">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">
                Notas del pedido <span className="text-sm font-normal text-neutral-500">(opcional)</span>
              </h2>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Horario de entrega preferido, referencias del domicilio, etc."
                rows={3}
              />
            </section>

            {/* Desktop submit (mobile uses bottom bar) */}
            <div className="hidden md:block">
              <Button
                type="submit"
                className="h-12 w-full bg-green-600 text-base font-semibold hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando tu pedido...
                  </>
                ) : (
                  'Confirmar pedido'
                )}
              </Button>
            </div>
          </form>

          {/* Sticky summary (desktop) */}
          <aside className="hidden md:col-span-1 md:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-neutral-900">
                  <ShoppingBag className="h-4 w-4 text-green-700" />
                  Tu pedido
                </h2>
                <OrderItemsList items={validItems} />
                <div className="mt-4 border-t border-neutral-100 pt-3 text-sm">
                  <div className="flex justify-between text-neutral-600">
                    <span>Productos</span>
                    <span className="font-medium tabular-nums text-neutral-900">
                      {validItems.length}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-neutral-600">
                    <span>Unidades</span>
                    <span className="font-medium tabular-nums text-neutral-900">
                      {totalUnits}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold text-neutral-900">
                  Cómo sigue
                </h3>
                <ol className="space-y-2.5 text-sm text-neutral-600">
                  <Step n={1} text="Confirmás tu pedido y recibís un email con los datos." />
                  <Step n={2} text="Nuestro equipo se contacta para coordinar pago y envío." />
                  <Step n={3} text="Coordinás la entrega o retiro en la sucursal." />
                </ol>
                {isMayorista && (
                  <p className="mt-4 rounded-md bg-amber-50 p-3 text-xs text-amber-800">
                    <strong>Mayoristas:</strong> los precios se confirman según
                    volumen y condiciones de pago.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white p-3 shadow-lg md:hidden">
        <Button
          type="submit"
          form="checkout-form"
          className="h-12 w-full bg-green-600 text-base font-semibold hover:bg-green-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              Confirmar pedido
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {totalUnits} {totalUnits === 1 ? 'ud.' : 'uds.'}
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block text-sm">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-[11px] font-bold text-green-700">
        {n}
      </span>
      <span>{text}</span>
    </li>
  );
}

type SummaryItem = {
  product: { id: number; name: string; slug: string; imageUrl?: string | null };
  quantity: number;
  presentation?: string | null;
};

function OrderItemsList({ items }: { items: SummaryItem[] }) {
  return (
    <ul className="divide-y divide-neutral-100">
      {items.map((item) => (
        <li
          key={`${item.product.id}-${item.presentation ?? ''}`}
          className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
        >
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-neutral-100 bg-neutral-50">
            <Image
              src={item.product.imageUrl || '/sauberatras.jpg'}
              alt={item.product.name}
              fill
              sizes="48px"
              className="object-contain p-1"
            />
          </div>
          <div className="min-w-0 flex-1">
            <Link
              href={`/productos/${item.product.slug}`}
              className="line-clamp-1 text-sm font-medium text-neutral-800 hover:text-green-700"
            >
              {item.product.name}
            </Link>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500">
              <span className="tabular-nums">×{item.quantity}</span>
              {item.presentation && (
                <>
                  <span>·</span>
                  <span className="truncate">{item.presentation}</span>
                </>
              )}
            </div>
          </div>
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
        </li>
      ))}
    </ul>
  );
}
