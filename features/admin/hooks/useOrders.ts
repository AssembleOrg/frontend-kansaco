import { useCallback, useEffect, useState } from 'react';
import { Order, OrderStatus } from '@/types/order';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getOrders, updateOrderStatus, deleteOrder as deleteOrderApi } from '@/lib/api';

export function useOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar órdenes desde la API
  const fetchOrders = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getOrders(token);
      // Extraer el array del objeto response si es necesario
      const ordersArray = Array.isArray(data) ? data : ((data as any)?.data || []);
      setOrders(ordersArray);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err instanceof Error ? err.message : 'Error loading orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
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
      setOrders(prev =>
        prev.map(order => order.id === id ? updatedOrder : order)
      );
      return updatedOrder;
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  }, [token]);

  // Eliminar orden
  const deleteOrder = useCallback(async (id: string) => {
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      await deleteOrderApi(token, id);
      setOrders(prev => prev.filter(order => order.id !== id));
    } catch (err) {
      console.error('Error deleting order:', err);
      throw err;
    }
  }, [token]);

  // Refrescar órdenes
  const refresh = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    getOrder,
    updateStatus,
    deleteOrder,
    refresh,
  };
}
