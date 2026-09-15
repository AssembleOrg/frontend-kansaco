import { getApiBaseUrl } from './api-base-url';
import type {
  Submission,
  SubmissionFilters,
} from '@/features/submissions/types';

/**
 * Cliente de los endpoints de administración de solicitudes.
 *
 * Sigue el mismo patrón que `lib/crmApi.ts` (envelope `{ status, data }`,
 * bearer token, `cache: 'no-store'`).
 */

const API_BASE_URL = getApiBaseUrl();

interface BackendValidationErrorItem {
  property: string;
  constraints?: { [key: string]: string };
}

interface BackendErrorResponse {
  statusCode?: number;
  message?: string | string[] | BackendValidationErrorItem[];
  error?: string;
}

function ensureBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }
  return API_BASE_URL;
}

function buildHeaders(token: string): HeadersInit {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function unwrapEnvelope<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'status' in payload &&
    'data' in payload
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) return undefined as unknown as T;
    try {
      return unwrapEnvelope<T>(await response.json());
    } catch {
      return undefined as unknown as T;
    }
  }

  let message = `Error ${response.status}`;
  try {
    const data = unwrapEnvelope<BackendErrorResponse>(await response.json());
    if (Array.isArray(data?.message)) {
      message = data.message
        .map((item) =>
          typeof item === 'string'
            ? item
            : item.constraints
              ? Object.values(item.constraints).join('. ')
              : JSON.stringify(item),
        )
        .join('; ');
    } else if (typeof data?.message === 'string') {
      message = data.message;
    } else if (data?.error) {
      message = data.error;
    }
  } catch {
    /* respuesta sin JSON */
  }
  throw new Error(message);
}

async function jsonFetch<T>(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${ensureBaseUrl()}${path}`, {
    ...init,
    headers: { ...buildHeaders(token), ...(init?.headers ?? {}) },
    cache: 'no-store',
  });
  return handleResponse<T>(response);
}

export function getSubmissions(
  token: string,
  filters: SubmissionFilters = {},
): Promise<Submission[]> {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.tipo) params.append('tipo', filters.tipo);
  if (filters.leida !== undefined) params.append('leida', String(filters.leida));

  const qs = params.toString();
  return jsonFetch<Submission[]>(
    token,
    `/admin/submission${qs ? `?${qs}` : ''}`,
  );
}

export function getSubmission(
  token: string,
  id: number,
): Promise<Submission> {
  return jsonFetch<Submission>(token, `/admin/submission/${id}`);
}

export function updateSubmission(
  token: string,
  id: number,
  input: { leida?: boolean; notaInterna?: string },
): Promise<Submission> {
  return jsonFetch<Submission>(token, `/admin/submission/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function getSubmissionStats(
  token: string,
): Promise<{ noLeidas: number }> {
  return jsonFetch<{ noLeidas: number }>(token, '/admin/submission/stats');
}

export function deleteSubmission(
  token: string,
  id: number,
): Promise<{ message: string }> {
  return jsonFetch<{ message: string }>(token, `/admin/submission/${id}`, {
    method: 'DELETE',
  });
}
