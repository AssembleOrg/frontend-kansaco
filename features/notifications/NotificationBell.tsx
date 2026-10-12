'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useVisiblePolling } from '@/hooks/useVisiblePolling';
import { AppNotification, getNotifications, markNotificationsRead } from '@/lib/api';
import { formatDateForDisplay } from '@/lib/dateUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Campanita del cliente: avisos de sus pedidos (cambio de estado, productos
 * editados por el staff). Mismo patrón que usePendientes: carga al montar y
 * revalida cada 60 s con la pestaña visible.
 */
export function NotificationBell() {
  const { token } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getNotifications(token);
      setItems(data.items);
      setNoLeidas(data.noLeidas);
    } catch {
      // Silencioso: es un indicador accesorio, no debe romper el sitio.
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);
  useVisiblePolling(() => void refresh(), 60_000, !!token);

  /** Marca uno (o todos, sin id) como leído; optimista, y revalida si falla. */
  const markRead = async (id?: number) => {
    if (!token) return;
    const leidaAt = new Date().toISOString();
    setItems((prev) => prev.map((n) => (!id || n.id === id ? { ...n, leidaAt: n.leidaAt ?? leidaAt } : n)));
    setNoLeidas((n) => (id ? Math.max(0, n - 1) : 0));
    try {
      await markNotificationsRead(token, id);
    } catch {
      void refresh();
    }
  };

  const open = (n: AppNotification) => {
    if (!n.leidaAt) void markRead(n.id);
    if (n.orderId) router.push('/mis-pedidos');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={noLeidas ? `Avisos (${noLeidas} sin leer)` : 'Avisos'}
          className="relative p-2 text-white transition-colors duration-200 hover:text-[#16a245]"
        >
          <Bell className="h-5 w-5" />
          {noLeidas > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#16a245] text-xs font-bold text-white">
              {noLeidas > 9 ? '9+' : noLeidas}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-96 w-80 max-w-[calc(100vw-2rem)] overflow-y-auto border-gray-800/50 bg-black/95 shadow-xl backdrop-blur-md"
      >
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-semibold text-white">Avisos</span>
          {noLeidas > 0 && (
            <button
              onClick={() => void markRead()}
              className="text-xs text-[#16a245] hover:underline"
            >
              Marcar todos como leídos
            </button>
          )}
        </div>
        {items.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-gray-400">No hay avisos todavía</p>
        ) : (
          items.map((n) => (
            <DropdownMenuItem
              key={n.id}
              onClick={() => open(n)}
              className="cursor-pointer flex-col items-start gap-0.5 text-gray-300 hover:bg-[#16a245]/10 focus:bg-[#16a245]/10 focus:text-gray-300"
            >
              <span className="flex w-full items-center gap-2 text-sm font-medium text-white">
                {!n.leidaAt && <span className="h-2 w-2 shrink-0 rounded-full bg-[#16a245]" />}
                {n.titulo}
              </span>
              <span className="whitespace-pre-line text-xs">{n.mensaje}</span>
              <span className="text-[11px] text-gray-500">
                {formatDateForDisplay(n.createdAt, 'datetime')}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
