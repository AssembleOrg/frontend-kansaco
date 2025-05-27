// app/(shop)/order-success/page.tsx
//same placeholder
'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderSuccessPage() {
  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center bg-gray-50 px-4 py-12 text-center sm:px-6 lg:px-8">
      <CheckCircle className="mb-6 h-24 w-24 text-green-500" />
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
        ¡Pedido Confirmado!
      </h1>
      <p className="mb-8 text-lg text-gray-600 sm:text-xl">
        ¡Gracias por tu compra en Kansaco!
      </p>
      <p className="mb-8 max-w-xl text-gray-700">
        Hemos recibido tu pedido. Un representante de Kansaco se pondrá en
        contacto contigo en breve por teléfono o email (
        <span className="font-semibold">{/* mail del usuario ? */}</span>) para
        coordinar el pago y el envío.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href="/productos" passHref>
          <Button className="bg-green-600 hover:bg-green-700">
            Seguir Comprando
          </Button>
        </Link>
        {/* Funcion "Ver Mis Pedidos" ?? */}
        {/* <Link href="/my-orders" passHref>
          <Button variant="outline">Ver Mis Pedidos</Button>
        </Link> */}
      </div>
    </div>
  );
}
