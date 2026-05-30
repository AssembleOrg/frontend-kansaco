import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy genérico hacia el backend (server-side).
 *
 * Por qué existe (en vez de pegarle directo desde el browser):
 *  - Permite usar el private domain de Railway (`*.railway.internal`)
 *    sin que el browser sufra: el browser pega a `/api/*` (mismo origen),
 *    Next hace el fetch al backend por la red privada.
 *  - Evita un hop público por request (browser → edge Railway → backend
 *    queda como browser → Next mismo container → backend internal).
 *  - Forwardea Set-Cookie correctamente (incluso múltiples).
 *  - Funciona con URLs con `:PORT` literal — un rewrite de Next con
 *    `:NNNN` en la destination explota con path-to-regexp v8.
 *
 * URL del backend (server-only):
 *  - `API_URL`              → la "buena": apunta a private domain Railway
 *  - `NEXT_PUBLIC_API_URL`  → fallback (también server-side acá, no se
 *                             bakea al cliente porque este archivo nunca
 *                             se sirve al browser)
 *  - `http://localhost:3001/api` → dev local
 */

const BACKEND_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001/api';

const HOP_BY_HOP_HEADERS = new Set([
  'host',
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'content-length',
  'accept-encoding',
]);

const RESPONSE_SKIP_HEADERS = new Set([
  'transfer-encoding',
  'content-encoding',
  'connection',
  'keep-alive',
]);

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const targetPath = path.join('/');
  const search = request.nextUrl.search;
  const url = `${BACKEND_URL.replace(/\/$/, '')}/${targetPath}${search}`;

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers[key] = value;
    }
  });

  let body: ArrayBuffer | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: request.method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      redirect: 'manual',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[api-proxy] fetch failed for ${request.method} ${url}:`, err);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'PROXY_ERROR',
          message: `No se pudo contactar al backend (${url}): ${message}`,
        },
      },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (
      !RESPONSE_SKIP_HEADERS.has(key.toLowerCase()) &&
      key.toLowerCase() !== 'set-cookie'
    ) {
      responseHeaders.set(key, value);
    }
  });
  const setCookies = upstream.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookies) {
    responseHeaders.append('set-cookie', cookie);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx);
}
export async function POST(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx);
}
export async function PUT(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx);
}
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx);
}
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx);
}
export async function HEAD(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx);
}
export async function OPTIONS(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx);
}
