import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Order, OrderFilters, OrderStatus, PaginatedOrdersResponse } from '@/types/order';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getAllOrdersPaginated, updateOrderStatus, updateOrder } from '@/lib/api';
import { useVisiblePolling } from '@/hooks/useVisiblePolling';
import { toast } from 'sonner';

/** Avisa al badge del sidebar que cambió algún estado. */
export const ORDERS_CHANGED = 'orders:changed';

export function useOrders(filters: OrderFilters = {}) {
  const { token } = useAuth();
  // Clave estable: el objeto de filtros se recrea en cada render del padre.
  const filtersKey = JSON.stringify(filters);
  const stableFilters = useMemo<OrderFilters>(() => JSON.parse(filtersKey), [filtersKey]);
  const [orders, setOrders] = useState<Order[]>([]);
  // Descarta respuestas viejas si cambian los filtros mientras una request está en vuelo.
  const lastRequest = useRef(0);
  // Pendientes de la última carga: si sube en un refresco automático, avisamos.
  const lastPending = useRef<number | null>(null);
  const [countsByStatus, setCountsByStatus] = useState<PaginatedOrdersResponse['countsByStatus']>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }>({
    page: 1,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Cargar órdenes desde la API con paginación
  // silent: refresco automático, sin "Cargando" ni borrar la lista si falla.
  const fetchOrders = useCallback(async (page = 1, limit = 20, silent = false) => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const requestId = ++lastRequest.current;
    try {
      if (!silent) {
        setIsLoading(true);
        setError(null);
      }
      const response: PaginatedOrdersResponse = await getAllOrdersPaginated(token, { page, limit, ...stableFilters });
      if (requestId !== lastRequest.current) return;
      setOrders(response.data || []);
      setCountsByStatus(response.countsByStatus);
      const pending = response.countsByStatus?.PENDIENTE;
      if (pending !== undefined) {
        if (silent && lastPending.current !== null && pending > lastPending.current) {
          const n = pending - lastPending.current;
          toast.success(n === 1 ? 'Llegó un pedido nuevo' : `Llegaron ${n} pedidos nuevos`);
          window.dispatchEvent(new Event(ORDERS_CHANGED));
        }
        lastPending.current = pending;
      }
      setPagination({
        page: response.page || 1,
        total: response.total || 0,
        totalPages: response.totalPages || 0,
        hasNext: response.hasNext || false,
        hasPrev: response.hasPrev || false,
      });
    } catch (err) {
      if (requestId !== lastRequest.current || silent) return;
      console.error('Error loading orders:', err);
      setError(err instanceof Error ? err.message : 'Error loading orders');
      setOrders([]);
    } finally {
      if (requestId === lastRequest.current && !silent) setIsLoading(false);
    }
  }, [token, stableFilters]);

  // Filtros nuevos → vuelve a la página 1.
  useEffect(() => {
    lastPending.current = null;
    fetchOrders(1, 20);
  }, [fetchOrders]);

  // Pedidos nuevos sin tocar nada: cada 60 s con la pestaña visible (y al volver a ella).
  useVisiblePolling(() => fetchOrders(pagination.page, 20, true), 60_000, !!token);

  // Obtener orden por ID
  const getOrder = useCallback((id: string): Order | undefined => {
    return orders.find((order) => order.id === id);
  }, [orders]);

  // Actualizar estado de una orden
  const updateStatus = useCallback(async (id: string, status: OrderStatus) => {
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const updatedOrder = await updateOrderStatus(token, id, status);
      // Merge defensivo: preservamos el objeto local (con id y campos completos)
      // por si el backend devuelve la orden con otra forma/anidamiento.
      setOrders(prev =>
        prev.map(order => order.id === id ? { ...order, ...updatedOrder, id } : order)
      );
      window.dispatchEvent(new Event(ORDERS_CHANGED));
      return updatedOrder;
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  }, [token]);

  // Actualizar las notas de una orden (motivo de cancelación o nota del admin).
  // El backend permite al staff editar notas en cualquier estado.
  const updateNotes = useCallback(async (id: string, notes: string) => {
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const updatedOrder = await updateOrder(token, id, { notes });
      // Merge defensivo: si el backend devuelve la orden con otra forma
      // (o sin id por doble-anidamiento), no perdemos el objeto local.
      setOrders(prev =>
        prev.map(order => order.id === id ? { ...order, ...updatedOrder, id, notes } : order)
      );
      return updatedOrder;
    } catch (err) {
      console.error('Error updating order notes:', err);
      throw err;
    }
  }, [token]);

  // Refrescar órdenes
  const refresh = useCallback(() => {
    fetchOrders(pagination.page, 20);
  }, [fetchOrders, pagination.page]);

  // Cambiar página
  const goToPage = useCallback((page: number) => {
    fetchOrders(page, 20);
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    pagination,
    countsByStatus,
    getOrder,
    updateStatus,
    updateNotes,
    refresh,
    goToPage,
  };
}
