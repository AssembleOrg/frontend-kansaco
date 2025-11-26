'use client';

import { Order } from '@/types/order';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateForDisplay } from '@/lib/dateUtils';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

export default function OrderDetailModal({
  order,
  onClose,
}: OrderDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Detalle de Orden</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Información del Cliente */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase">
              Información del Cliente
            </h3>
            <div className="mt-4 space-y-2">
              <p>
                <span className="font-medium text-gray-700">Nombre:</span>{' '}
                {order.contactInfo?.fullName || 'N/A'}
              </p>
              <p>
                <span className="font-medium text-gray-700">Email:</span>{' '}
                {order.contactInfo?.email ? (
                  <a
                    href={`mailto:${order.contactInfo.email}`}
                    className="text-green-600 hover:underline"
                  >
                    {order.contactInfo.email}
                  </a>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </p>
              <p>
                <span className="font-medium text-gray-700">Teléfono:</span>{' '}
                {order.contactInfo?.phone ? (
                  <a
                    href={`tel:${order.contactInfo.phone}`}
                    className="text-green-600 hover:underline"
                  >
                    {order.contactInfo.phone}
                  </a>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </p>
              <p>
                <span className="font-medium text-gray-700">Dirección:</span>{' '}
                {order.contactInfo?.address || 'N/A'}
              </p>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Productos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase">
              Productos
            </h3>
            <div className="mt-4 space-y-3">
              {order.items?.map((item) => (
                <div
                  key={`${item.productId}-${item.productName}`}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.productName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Información de Negocio */}
          {order.businessInfo && (
            <>
              <hr className="border-gray-200" />
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">
                  Información Fiscal
                </h3>
                <div className="mt-4 space-y-2">
                  <p>
                    <span className="font-medium text-gray-700">CUIT:</span>{' '}
                    {order.businessInfo.cuit}
                  </p>
                  {order.businessInfo.razonSocial && (
                    <p>
                      <span className="font-medium text-gray-700">Razón Social:</span>{' '}
                      {order.businessInfo.razonSocial}
                    </p>
                  )}
                  <p>
                    <span className="font-medium text-gray-700">Situación AFIP:</span>{' '}
                    {order.businessInfo.situacionAfip}
                  </p>
                  {order.businessInfo.codigoPostal && (
                    <p>
                      <span className="font-medium text-gray-700">Código Postal:</span>{' '}
                      {order.businessInfo.codigoPostal}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Notas */}
          {order.notes && (
            <>
              <hr className="border-gray-200" />
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">
                  Notas del Pedido
                </h3>
                <p className="mt-2 text-gray-700">{order.notes}</p>
              </div>
            </>
          )}

          {/* Información Adicional */}
          <hr className="border-gray-200" />
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium">Fecha de Orden:</span>{' '}
              {formatDateForDisplay(order.createdAt, 'datetime')}
            </p>
            <p>
              <span className="font-medium">Tipo de Cliente:</span>{' '}
              {order.customerType === 'CLIENTE_MAYORISTA' ? 'Mayorista' : 'Minorista'}
            </p>
            <p>
              <span className="font-medium">Estado:</span>{' '}
              {order.status}
            </p>
            <p>
              <span className="font-medium">ID de Orden:</span>{' '}
              <code className="rounded bg-gray-100 px-2 py-1 text-xs">
                {order.id}
              </code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <p className="mb-4 text-sm text-gray-600">
            Próximo paso: Contacta al cliente para coordinar el pago y envío.
          </p>
          <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
