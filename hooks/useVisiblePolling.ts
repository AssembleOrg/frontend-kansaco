'use client';

import { useEffect, useRef } from 'react';

/**
 * Llama a `fn` cada `ms` mientras la pestaña está visible, y apenas vuelve a serlo.
 * Con la pestaña oculta no hace ninguna request.
 * ponytail: polling simple; pasar a SSE/websocket solo si hace falta tiempo real.
 */
export function useVisiblePolling(fn: () => void, ms: number, enabled = true) {
  // Ref: el intervalo no se reinicia cada vez que cambia `fn`.
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!enabled) return;
    const tick = () => {
      if (document.visibilityState === 'visible') fnRef.current();
    };
    const id = setInterval(tick, ms);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [ms, enabled]);
}
