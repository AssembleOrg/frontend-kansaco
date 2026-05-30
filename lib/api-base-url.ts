/**
 * Base URL para llamadas al backend.
 *
 * - Browser: usa `/api` (relativo) → entra al route handler
 *   `app/api/[...path]/route.ts`, que forwardea al backend (privado o
 *   público según env). Esto permite usar private domain de Railway
 *   sin que el browser sufra (no puede resolver `*.railway.internal`).
 *
 * - Server-side (SSR / RSC / route handlers): usa `API_URL` (env
 *   server-only que sí puede ser private domain) → cae a
 *   `NEXT_PUBLIC_API_URL` (visible en el bundle) → cae a localhost.
 *
 * Centralizá las llamadas al backend usando esta función. Evita repetir
 * `process.env.NEXT_PUBLIC_API_URL` por la app.
 */
export function getApiBaseUrl(): string {
  if (typeof globalThis.window === 'undefined') {
    return (
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3001/api'
    );
  }
  return '/api';
}
