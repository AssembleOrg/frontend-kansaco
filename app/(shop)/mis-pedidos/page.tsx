'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getMyOrdersPaginated } from '@/lib/api';
import { Order } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, Package, Calendar } from 'lucide-react';
import Link from 'next/link';
import { OrderDetailsModal } from '@/features/orders/components/OrderDetailsModal';
import { formatDateForDisplay } from '@/lib/dateUtils';

const ITEMS_PER_PAGE = 20;

function OrdersHistoryContent() {
  const { token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }>({
    total: 0,
    page: 1,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        router.replace('/login?redirect=/mis-pedidos');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getMyOrdersPaginated(token, {
          page: pagination.page,
          limit: ITEMS_PER_PAGE,
        });

        // Extraer los datos de la respuesta anidada
        const ordersData = response.data || [];
        setOrders(ordersData);
        setPagination({
          total: response.total || 0,
          page: response.page || 1,
          totalPages: response.totalPages || 0,
          hasNext: response.hasNext || false,
          hasPrev: response.hasPrev || false,
        });
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(
          err instanceof Error ? err.message : 'Error al cargar tus pedidos'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [token, pagination.page, router]);

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
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

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center mt-20">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <p className="text-xl text-gray-600">Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="container mx-auto p-8 mt-20">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="mb-4 text-2xl font-semibold text-red-800">Error</h2>
          <p className="mb-6 text-red-600">{error}</p>
          <Link href="/productos">
            <Button variant="outline" className="text-red-600 hover:bg-red-50">
              Volver a productos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="mb-8">
        <Link href="/productos">
          <Button variant="ghost" className="mb-4 group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Volver a Productos
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
        <p className="mt-2 text-gray-600">
          Historial de todos tus pedidos realizados
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            No tienes pedidos aún
          </h3>
          <p className="mb-6 text-gray-600">
            Cuando realices tu primer pedido, aparecerá aquí.
          </p>
          <Link href="/productos">
            <Button className="bg-green-600 hover:bg-green-700">
              Ver Productos
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-base font-semibold text-gray-900">
                        Pedido #{order.id.slice(0, 8)}
                      </h3>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {formatDateForDisplay(order.createdAt, 'datetime')}
                        </span>
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Package className="h-3.5 w-3.5" />
                          <span>
                            {order.items.length} producto{order.items.length !== 1 ? 's' : ''} •{' '}
                            {order.items.reduce((acc, item) => acc + item.quantity, 0)} unidades
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                      }}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación - Siempre visible */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
            <div className="text-sm text-gray-600">
              {pagination.totalPages > 0 ? (
                <>
                  Página {pagination.page} de {pagination.totalPages} •{' '}
                  {pagination.total} pedido{pagination.total !== 1 ? 's' : ''} en total
                </>
              ) : (
                <span>No hay pedidos para mostrar</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={!pagination.hasPrev || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={!pagination.hasNext || isLoading}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Modal de Detalles */}
      <OrderDetailsModal
        order={selectedOrder}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}

export default function OrdersHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center mt-20">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            <p className="text-xl text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <OrdersHistoryContent />
    </Suspense>
  );
}

