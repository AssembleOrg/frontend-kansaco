import { getApiBaseUrl } from '@/lib/api-base-url';
import type { PublicSubmissionInput } from './types';

/**
 * Error de envío con el status HTTP, para que la UI distinga "demasiados
 * intentos" de "datos inválidos" o "no hay conexión".
 */
export class SubmissionError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'SubmissionError';
    this.status = status;
  }
}

/** `status: 0` indica que la request nunca llegó al servidor. */
const NETWORK_ERROR_STATUS = 0;

function messageForStatus(status: number, backendMessage?: string): string {
  if (status === 429) {
    return 'Recibimos varios envíos seguidos. Esperá un momento y probá de nuevo.';
  }
  if (status === NETWORK_ERROR_STATUS) {
    return 'No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.';
  }
  if (status >= 500) {
    return 'Tuvimos un problema al procesar tu solicitud. Intentá de nuevo en unos minutos.';
  }
  return backendMessage || 'No pudimos enviar tu solicitud. Revisá los datos e intentá de nuevo.';
}

async function extractBackendMessage(response: Response): Promise<string | undefined> {
  try {
    const raw = await response.json();
    const data =
      raw && typeof raw === 'object' && 'data' in raw
        ? (raw as { data: unknown }).data
        : raw;

    const message = (data as { message?: unknown })?.message;
    if (Array.isArray(message)) {
      return message.filter((m) => typeof m === 'string').join('. ');
    }
    if (typeof message === 'string') return message;
  } catch {
    /* respuesta sin JSON: se usa el mensaje por status */
  }
  return undefined;
}

/**
 * Envía una solicitud desde un formulario público.
 *
 * Resuelve sólo si el backend confirmó la recepción; en cualquier otro caso
 * lanza `SubmissionError`. Nunca simula éxito.
 */
export async function submitPublicForm(
  input: PublicSubmissionInput,
): Promise<void> {
  const url = `${getApiBaseUrl()}/public/submission`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
      cache: 'no-store',
    });
  } catch {
    throw new SubmissionError(
      messageForStatus(NETWORK_ERROR_STATUS),
      NETWORK_ERROR_STATUS,
    );
  }

  if (!response.ok) {
    const backendMessage = await extractBackendMessage(response);
    throw new SubmissionError(
      messageForStatus(response.status, backendMessage),
      response.status,
    );
  }
}
