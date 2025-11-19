// app/(shop)/order-success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Building2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFPedidoDownloadButton } from '@/features/shop/components/PDFPedido';
import { SendOrderEmailData } from '@/types/order';

interface OrderSuccessData extends SendOrderEmailData {
  orderDate: string;
}

export default function OrderSuccessPage() {
  const [orderData, setOrderData] = useState<OrderSuccessData | null>(null);

  useEffect(() => {
    // Leer datos del pedido de sessionStorage
    const storedOrder = sessionStorage.getItem('lastOrder');
    if (storedOrder) {
      try {
        setOrderData(JSON.parse(storedOrder));
      } catch (error) {
        console.error('Error parsing order data:', error);
      }
    }
  }, []);

  const isMayorista = orderData?.customerType === 'CLIENTE_MAYORISTA';

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center">
          <CheckCircle className="mx-auto mb-6 h-24 w-24 text-green-500" />
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            ¡Pedido Confirmado!
          </h1>
          <p className="mb-8 text-lg text-gray-600 sm:text-xl">
            ¡Gracias por tu compra en Kansaco!
          </p>
        </div>

        {/* Resumen del pedido */}
        {orderData && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
            {/* Tipo de cliente */}
            <div className={`mb-4 flex items-center gap-2 rounded-lg p-3 ${
              isMayorista
                ? 'bg-amber-50 border border-amber-200'
                : 'bg-blue-50 border border-blue-200'
            }`}>
              {isMayorista ? (
                <>
                  <Building2 className="h-5 w-5 text-amber-600" />
                  <span className="font-medium text-amber-800">
                    Pedido Mayorista
                  </span>
                </>
              ) : (
                <>
                  <Store className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    Pedido Minorista
                  </span>
                </>
              )}
            </div>

            {/* Datos de contacto */}
            <div className="mb-4">
              <h3 className="mb-2 font-semibold text-gray-900">Datos de contacto</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Nombre:</span> {orderData.contactInfo.fullName}</p>
                <p><span className="font-medium">Email:</span> {orderData.contactInfo.email}</p>
                <p><span className="font-medium">Teléfono:</span> {orderData.contactInfo.phone}</p>
                <p><span className="font-medium">Dirección:</span> {orderData.contactInfo.address}</p>
              </div>
            </div>

            {/* Datos fiscales (mayoristas) */}
            {isMayorista && orderData.businessInfo && (
              <div className="mb-4 border-t pt-4">
                <h3 className="mb-2 font-semibold text-gray-900">Datos fiscales</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">CUIT:</span> {orderData.businessInfo.cuit}</p>
                  <p><span className="font-medium">Situación AFIP:</span> {orderData.businessInfo.situacionAfip}</p>
                  {orderData.businessInfo.razonSocial && (
                    <p><span className="font-medium">Razón Social:</span> {orderData.businessInfo.razonSocial}</p>
                  )}
                  {orderData.businessInfo.codigoPostal && (
                    <p><span className="font-medium">Código Postal:</span> {orderData.businessInfo.codigoPostal}</p>
                  )}
                </div>
              </div>
            )}

            {/* Productos */}
            <div className="mb-4 border-t pt-4">
              <h3 className="mb-2 font-semibold text-gray-900">Productos solicitados</h3>
              <ul className="space-y-2">
                {orderData.items.map((item, index) => (
                  <li key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.productName}</span>
                    <span className="font-medium text-gray-900">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-gray-500">
                Total: {orderData.items.reduce((acc, item) => acc + item.quantity, 0)} unidades
              </p>
            </div>

            {/* Notas */}
            {orderData.notes && (
              <div className="mb-4 border-t pt-4">
                <h3 className="mb-2 font-semibold text-gray-900">Notas</h3>
                <p className="text-sm text-gray-600">{orderData.notes}</p>
              </div>
            )}

            {/* Fecha */}
            <div className="border-t pt-4 text-sm text-gray-500">
              Pedido realizado el{' '}
              {new Date(orderData.orderDate).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        )}

        {/* Información importante */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-3 font-semibold text-gray-900">Próximos pasos</h3>
          <p className="text-gray-700">
            Un representante de Kansaco se pondrá en contacto contigo en breve por teléfono o email
            {orderData && (
              <span className="font-semibold"> ({orderData.contactInfo.email})</span>
            )} para coordinar el pago y el envío.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {orderData && (
            <PDFPedidoDownloadButton order={orderData} />
          )}
          <Link href="/productos" passHref>
            <Button variant="outline">
              Seguir Comprando
            </Button>
          </Link>
        </div>

        {/* Nota legal */}
        <p className="mt-6 text-center text-xs text-gray-400">
          El comprobante PDF no tiene validez como factura. Es solo una confirmación de pedido.
        </p>
      </div>
    </div>
  );
}
