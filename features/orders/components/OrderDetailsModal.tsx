'use client';

import { useState } from 'react';
import { Order } from '@/types/order';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Building2,
  Edit,
  Info,
  Download,
  RefreshCw,
} from 'lucide-react';
import { formatDateForDisplay } from '@/lib/dateUtils';
import { OrderEditModal } from './OrderEditModal';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { downloadOrderPDF } from '@/lib/api';
import { toast } from 'sonner';

interface OrderDetailsModalProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated?: () => void;
}

export function OrderDetailsModal({
  order,
  open,
  onOpenChange,
  onOrderUpdated,
}: OrderDetailsModalProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { token } = useAuth();

  if (!order) return null;

  const isPendiente = order.status === 'PENDIENTE';

  const handleDownloadPDF = async () => {
    if (!token) {
      toast.error('No estás autenticado');
      return;
    }

    setIsDownloading(true);
    try {
      await downloadOrderPDF(token, order.id);
      toast.success('PDF descargado correctamente');
    } catch (error) {
      console.error('Error descargando PDF:', error);
      toast.error('Error al descargar el PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETADO':
        return 'default';
      case 'ENVIADO':
        return 'default';
      case 'PROCESANDO':
        return 'secondary';
      case 'PENDIENTE':
        return 'outline';
      case 'CANCELADO':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      PROCESANDO: 'Procesando',
      ENVIADO: 'Enviado',
      COMPLETADO: 'Completado',
      CANCELADO: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getCustomerTypeLabel = (type: string) => {
    return type === 'CLIENTE_MAYORISTA' ? 'Mayorista' : 'Minorista';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Detalles del Pedido
            </span>
            <Badge variant={getStatusBadgeVariant(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información General */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Calendar className="h-4 w-4" />
              Información General
            </h3>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-gray-500">Fecha de Creación</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDateForDisplay(order.createdAt, 'datetime')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Tipo de Cliente</p>
                  <p className="text-sm font-medium text-gray-900">
                    {getCustomerTypeLabel(order.customerType)}
                  </p>
                </div>
                {order.updatedAt && order.updatedAt !== order.createdAt && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Última Actualización</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDateForDisplay(order.updatedAt, 'datetime')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información de Contacto y Negocio - Grid 2 columnas */}
          {(order.contactInfo || order.businessInfo) && (
            <>
              <Separator />
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Columna 1: Información de Contacto */}
                {order.contactInfo && (
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <User className="h-4 w-4" />
                      Información de Contacto
                    </h3>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <User className="mt-0.5 h-4 w-4 text-gray-400" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-500">Nombre Completo</p>
                            <p className="text-sm font-medium text-gray-900 break-words">
                              {order.contactInfo.fullName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail className="mt-0.5 h-4 w-4 text-gray-400" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-500">Email</p>
                            <p className="text-sm font-medium text-gray-900 break-words">
                              {order.contactInfo.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="mt-0.5 h-4 w-4 text-gray-400" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-500">Teléfono</p>
                            <p className="text-sm font-medium text-gray-900">
                              {order.contactInfo.phone}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-500">Dirección</p>
                            <p className="text-sm font-medium text-gray-900 break-words">
                              {order.contactInfo.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Columna 2: Información Fiscal (solo mayorista) */}
                {order.businessInfo && (
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Building2 className="h-4 w-4" />
                      Información Fiscal
                    </h3>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="space-y-3">
                        {order.businessInfo.razonSocial && (
                          <div>
                            <p className="text-xs font-medium text-gray-500">Razón Social</p>
                            <p className="text-sm font-medium text-gray-900 break-words">
                              {order.businessInfo.razonSocial}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium text-gray-500">CUIT</p>
                          <p className="text-sm font-medium text-gray-900">
                            {order.businessInfo.cuit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Situación AFIP</p>
                          <p className="text-sm font-medium text-gray-900">
                            {order.businessInfo.situacionAfip}
                          </p>
                        </div>
                        {order.businessInfo.codigoPostal && (
                          <div>
                            <p className="text-xs font-medium text-gray-500">Código Postal</p>
                            <p className="text-sm font-medium text-gray-900">
                              {order.businessInfo.codigoPostal}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Productos */}
          {order.items && order.items.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Package className="h-4 w-4" />
                  Productos ({order.items.length})
                </h3>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={`${item.productId}-${index}`}
                      className="rounded-lg border border-gray-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Package className="h-3.5 w-3.5" />
                              Cantidad: {item.quantity}
                            </span>
                            {item.presentation && (
                              <span className="flex items-center gap-1">
                                Presentación: {item.presentation}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notas */}
          {order.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <FileText className="h-4 w-4" />
                  Notas
                </h3>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {order.notes}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer con botón o mensaje */}
        <Separator />
        <DialogFooter className="flex-col sm:flex-col gap-3">
          {/* Botón Descargar PDF - SIEMPRE visible */}
          <Button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            variant="outline"
            className="w-full"
          >
            {isDownloading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Descargar Presupuesto PDF
          </Button>

          {/* Botón Editar - solo si PENDIENTE */}
          {isPendiente ? (
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar Orden
            </Button>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Esta orden ha sido <strong>{getStatusLabel(order.status)}</strong> y no puede modificarse.
                Si necesitas ayuda, contacta con nosotros:
                <div className="mt-2 space-y-1">
                  <div>
                    <Mail className="inline h-3 w-3 mr-1" />
                    <a href="mailto:ventas@kansaco.com" className="text-green-600 hover:underline">
                      ventas@kansaco.com
                    </a>
                  </div>
                  <div>
                    <Phone className="inline h-3 w-3 mr-1" />
                    <a href="tel:+541136585581" className="text-green-600 hover:underline">
                      +54 11 3658 5581
                    </a>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Modal de Edición */}
      {isPendiente && (
        <OrderEditModal
          order={order}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            if (onOrderUpdated) {
              onOrderUpdated();
            }
          }}
        />
      )}
    </Dialog>
  );
}

