import { useCallback, useEffect, useState } from 'react';
import { Order, OrderStatus, PaginatedOrdersResponse } from '@/types/order';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getAllOrdersPaginated, updateOrderStatus, updateOrder } from '@/lib/api';

export function useOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
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
  const fetchOrders = useCallback(async (page = 1, limit = 20) => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response: PaginatedOrdersResponse = await getAllOrdersPaginated(token, { page, limit });
      setOrders(response.data || []);
      setPagination({
        page: response.page || 1,
        total: response.total || 0,
        totalPages: response.totalPages || 0,
        hasNext: response.hasNext || false,
        hasPrev: response.hasPrev || false,
      });
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err instanceof Error ? err.message : 'Error loading orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders(1, 20);
  }, [fetchOrders]);

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
    getOrder,
    updateStatus,
    updateNotes,
    refresh,
    goToPage,
  };
}
