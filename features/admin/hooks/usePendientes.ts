'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getOrderStats } from '@/lib/api';
import { useVisiblePolling } from '@/hooks/useVisiblePolling';
import { ORDERS_CHANGED } from './useOrders';

/**
 * Cantidad de pedidos PENDIENTE, para el badge de Órdenes del sidebar.
 * Mismo patrón que useNoLeidas (revalida al navegar), más un chequeo cada
 * 60 s con la pestaña visible y cuando la página de órdenes cambia un estado.
 */
export function usePendientes(): number {
  const { token, user } = useAuth();
  const pathname = usePathname();
  const [pendientes, setPendientes] = useState(0);
  const puedeConsultar = !!token && (user?.rol === 'ADMIN' || user?.rol === 'ASISTENTE');

  const refresh = useCallback(async () => {
    if (!puedeConsultar || !token) return;
    try {
      const { countsByStatus } = await getOrderStats(token);
      setPendientes(countsByStatus.PENDIENTE ?? 0);
    } catch {
      // Silencioso: es un indicador accesorio, no debe romper el panel.
    }
  }, [token, puedeConsultar]);

  useEffect(() => {
    void refresh();
  }, [refresh, pathname]);

  useEffect(() => {
    const onChange = () => void refresh();
    window.addEventListener(ORDERS_CHANGED, onChange);
    return () => window.removeEventListener(ORDERS_CHANGED, onChange);
  }, [refresh]);

  useVisiblePolling(() => void refresh(), 60_000, puedeConsultar);

  return pendientes;
}
