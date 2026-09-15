'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getMyProfile } from '@/lib/api';
import { MENSAJE_BLOQUEO } from '@/types/auth';

/**
 * Aviso fijo para el cliente frenado (cobranzas / ventas).
 *
 * De paso refresca el perfil al entrar a la tienda: el usuario vive en una
 * cookie desde el login y, si lo frenaron (o le cambiaron la categoría)
 * después, no se enteraría hasta volver a loguearse. El backend igual rechaza
 * el checkout de una cuenta frenada; esto es para que el cliente sepa por qué.
 */
export function BloqueoBanner() {
  const token = useAuthStore((s) => s.token);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const bloqueo = useAuthStore((s) => s.user?.bloqueo ?? null);

  useEffect(() => {
    if (!isAuthReady || !token) return;
    let cancelled = false;

    getMyProfile(token)
      .then((fresh) => {
        if (cancelled) return;
        const { user, setUser } = useAuthStore.getState();
        if (!user) return;
        // Sólo reescribimos la cookie si cambió algo que afecta a la tienda.
        const bloqueoActual = user.bloqueo ?? null;
        if ((fresh.bloqueo ?? null) === bloqueoActual && fresh.rol === user.rol) {
          return;
        }
        setUser({
          ...user,
          ...fresh,
          descuentosAplicados: fresh.descuentosAplicados ?? user.descuentosAplicados ?? [],
        });
      })
      .catch(() => {
        // Silencioso: si falla, queda lo que hay en la cookie.
      });

    return () => {
      cancelled = true;
    };
  }, [token, isAuthReady]);

  if (!bloqueo) return null;

  return (
    <div
      role="alert"
      className="flex items-start justify-center gap-2 bg-red-600 px-4 py-3 text-center text-sm font-medium text-white"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{MENSAJE_BLOQUEO[bloqueo]}</span>
    </div>
  );
}
