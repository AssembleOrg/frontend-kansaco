'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getSubmissionStats } from '@/lib/submissionsApi';

/**
 * Cantidad de solicitudes sin leer, para el badge del sidebar.
 *
 * Revalida al cambiar de ruta dentro del panel en lugar de hacer polling:
 * alcanza para que el número esté fresco sin agregar tráfico constante.
 */
export function useNoLeidas(): { noLeidas: number; refresh: () => void } {
  const { token, user } = useAuth();
  const pathname = usePathname();
  const [noLeidas, setNoLeidas] = useState(0);
  // El endpoint de stats es sólo ADMIN: a la asistente no se lo pedimos.
  const puedeConsultar = !!token && user?.rol === 'ADMIN';

  const refresh = useCallback(async () => {
    if (!puedeConsultar || !token) return;
    try {
      const { noLeidas: count } = await getSubmissionStats(token);
      setNoLeidas(count ?? 0);
    } catch {
      // Silencioso: es un indicador accesorio, no debe romper el panel.
    }
  }, [token, puedeConsultar]);

  useEffect(() => {
    void refresh();
  }, [refresh, pathname]);

  return { noLeidas, refresh };
}
