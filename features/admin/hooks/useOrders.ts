import { useCallback, useEffect, useState } from 'react';
import { Order } from '@/types/order';

const ORDERS_STORAGE_KEY = 'pending_orders';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar órdenes del localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      const parsedOrders = stored ? JSON.parse(stored) : [];
      setOrders(parsedOrders);
    } catch (error) {
      console.error('Error loading orders from localStorage:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Agregar nueva orden
  const addOrder = useCallback((order: Omit<Order, 'id' | 'createdAt'>) => {
    try {
      const newOrder: Order = {
        ...order,
        id: `order_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      const updated = [newOrder, ...orders];
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
      setOrders(updated);
      return newOrder;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  }, [orders]);

  // Obtener orden por ID
  const getOrder = useCallback((id: string): Order | undefined => {
    return orders.find((order) => order.id === id);
  }, [orders]);

  // Eliminar orden
  const deleteOrder = useCallback((id: string) => {
    try {
      const updated = orders.filter((order) => order.id !== id);
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
      setOrders(updated);
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }, [orders]);

  // Limpiar todas las órdenes
  const clearAllOrders = useCallback(() => {
    try {
      localStorage.removeItem(ORDERS_STORAGE_KEY);
      setOrders([]);
    } catch (error) {
      console.error('Error clearing orders:', error);
      throw error;
    }
  }, []);

  return {
    orders,
    isLoading,
    addOrder,
    getOrder,
    deleteOrder,
    clearAllOrders,
  };
}
