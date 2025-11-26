// app/(shop)/order-success/page.tsx
'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Building2, Store, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFPedidoDownloadButton } from '@/features/shop/components/PDFPedido';
import { Order } from '@/types/order';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getOrderById } from '@/lib/api';
import { toast } from 'sonner';
import { formatDateForDisplay } from '@/lib/dateUtils';

function OrderSuccessContent() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [presupuestoNumber, setPresupuestoNumber] = useState<string | null>(null);
  const hasShownNotification = useRef(false);

  useEffect(() => {
    const fetchOrder = async () => {
      const orderId = searchParams.get('orderId');

      // Validate orderId is present and not a literal "undefined" or "null" string
      if (!orderId || orderId === 'undefined' || orderId === 'null') {
        setError('No se encontró el ID del pedido válido. Por favor, vuelve a realizar tu compra.');
        setIsLoading(false);
        return;
      }

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const order = await getOrderById(token, orderId);
        setOrderData(order);
        
        // Intentar obtener el PDF base64 del sessionStorage
        const storedPdf = sessionStorage.getItem(`order-pdf-${orderId}`);
        const storedPresupuesto = sessionStorage.getItem(`order-presupuesto-${orderId}`);
        
        if (storedPdf) {
          setPdfBase64(storedPdf);
          // Limpiar del sessionStorage después de obtenerlo
          sessionStorage.removeItem(`order-pdf-${orderId}`);
        }
        
        if (storedPresupuesto) {
          setPresupuestoNumber(storedPresupuesto);
          // Limpiar del sessionStorage después de obtenerlo
          sessionStorage.removeItem(`order-presupuesto-${orderId}`);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('No se pudo cargar la información del pedido. Por favor, contacta a soporte.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [token, searchParams]);

  // Mostrar notificación cuando el pedido se carga exitosamente
  useEffect(() => {
    if (orderData && !hasShownNotification.current) {
      hasShownNotification.current = true;
      const email = orderData.contactInfo?.email || 'tu email registrado';
      
      toast.success('¡Pedido confirmado!', {
        description: `Tu pedido ha sido registrado correctamente. Se ha enviado un comprobante del pedido a ${email}.`,
        duration: 6000,
      });
    }
  }, [orderData]);

  const isMayorista = orderData?.customerType === 'CLIENTE_MAYORISTA';

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-120px)] bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          <span className="text-gray-600">Cargando información del pedido...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-50 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Error crítico - sin orderId o sin datos */}
        {error && !orderData && (
          <div className="text-center">
            <AlertCircle className="mx-auto mb-6 h-24 w-24 text-red-500" />
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              Error al cargar pedido
            </h1>
            <p className="mb-8 text-lg text-red-600 sm:text-xl">
              {error}
            </p>
            <Link href="/productos">
              <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
                Volver a productos
              </Button>
            </Link>
          </div>
        )}

        {/* Header de éxito - solo cuando hay datos */}
        {orderData && (
          <div className="text-center">
            <CheckCircle className="mx-auto mb-6 h-24 w-24 text-green-500" />
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              ¡Pedido Confirmado!
            </h1>
            <p className="mb-8 text-lg text-gray-600 sm:text-xl">
              ¡Gracias por tu compra en Kansaco!
            </p>
          </div>
        )}

        {error && orderData && (
          <div className="mb-8 rounded-lg bg-yellow-50 p-4 text-center text-yellow-700">
            <p>Hubo un problema al cargar algunos datos, pero tu pedido fue registrado correctamente.</p>
          </div>
        )}

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
            {orderData.contactInfo && (
              <div className="mb-4">
                <h3 className="mb-2 font-semibold text-gray-900">Datos de contacto</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Nombre:</span> {orderData.contactInfo.fullName}</p>
                  <p><span className="font-medium">Email:</span> {orderData.contactInfo.email}</p>
                  <p><span className="font-medium">Teléfono:</span> {orderData.contactInfo.phone}</p>
                  <p><span className="font-medium">Dirección:</span> {orderData.contactInfo.address}</p>
                </div>
              </div>
            )}

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
            {orderData.items && orderData.items.length > 0 && (
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
            )}

            {/* Notas */}
            {orderData.notes && (
              <div className="mb-4 border-t pt-4">
                <h3 className="mb-2 font-semibold text-gray-900">Notas</h3>
                <p className="text-sm text-gray-600">{orderData.notes}</p>
              </div>
            )}

            {/* Fecha */}
            <div className="border-t pt-4 text-sm text-gray-500">
              Pedido realizado el {formatDateForDisplay(orderData.createdAt, 'datetime')}
            </div>
          </div>
        )}

        {/* Información importante - solo cuando hay datos */}
        {orderData && (
          <>
            <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
              <h3 className="mb-3 font-semibold text-gray-900">Próximos pasos</h3>
              <p className="text-gray-700">
                Un representante de Kansaco se pondrá en contacto contigo en breve por teléfono o email
                {orderData.contactInfo?.email && (
                  <span className="font-semibold"> ({orderData.contactInfo.email})</span>
                )} para coordinar el pago y el envío.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <PDFPedidoDownloadButton 
                order={orderData} 
                pdfBase64={pdfBase64 || undefined}
                presupuestoNumber={presupuestoNumber || undefined}
              />
            </div>

            {/* Nota legal */}
            <p className="mt-6 text-center text-xs text-gray-400">
              El comprobante PDF no tiene validez como factura. Es solo una confirmación de pedido.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-120px)] bg-gray-50 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            <span className="text-gray-600">Cargando...</span>
          </div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
