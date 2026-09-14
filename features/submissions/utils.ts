import { formatDateTime } from '@/features/crm/utils';
import type { Submission, SubmissionType } from './types';

/**
 * Presentación de las solicitudes en el panel.
 *
 * `formatDate`, `formatDateTime` y `buildWhatsAppLink` se reutilizan desde
 * `features/crm/utils` en vez de duplicarse acá.
 */

const TYPE_LABELS: Record<SubmissionType, string> = {
  MAYORISTA: 'Mayorista',
  TRABAJO: 'Trabajá con nosotros',
  LUBRI_EXPERTO: 'Lubri Experto',
};

const TYPE_BADGES: Record<SubmissionType, string> = {
  MAYORISTA: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  TRABAJO: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  LUBRI_EXPERTO: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
};

export function submissionTypeLabel(tipo: SubmissionType): string {
  return TYPE_LABELS[tipo] ?? tipo;
}

export function submissionTypeBadgeClass(tipo: SubmissionType): string {
  return TYPE_BADGES[tipo] ?? 'bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200';
}

/** Etiquetas legibles para las claves del `payload`. */
const PAYLOAD_LABELS: Record<string, string> = {
  cuit: 'CUIT',
  domicilio: 'Domicilio',
  codigoPostal: 'Código Postal',
  zonaDistribucion: 'Zona de distribución',
  afip: 'Situación ante AFIP',
  puesto: 'Puesto de interés',
  vehiculo: 'Vehículo o equipo',
};

export function payloadFieldLabel(key: string): string {
  return PAYLOAD_LABELS[key] ?? key;
}

/**
 * Convierte el `payload` en pares label/valor listos para renderizar,
 * descartando los vacíos y respetando un orden estable por tipo.
 */
export function payloadEntries(
  tipo: SubmissionType,
  payload: Record<string, string> | null | undefined,
): Array<{ key: string; label: string; value: string }> {
  if (!payload) return [];

  const ORDER: Record<SubmissionType, string[]> = {
    MAYORISTA: ['cuit', 'afip', 'domicilio', 'codigoPostal', 'zonaDistribucion'],
    TRABAJO: ['puesto'],
    LUBRI_EXPERTO: ['vehiculo'],
  };

  const ordered = ORDER[tipo] ?? Object.keys(payload);
  const extras = Object.keys(payload).filter((k) => !ordered.includes(k));

  return [...ordered, ...extras]
    .map((key) => ({
      key,
      label: payloadFieldLabel(key),
      value: (payload[key] ?? '').trim(),
    }))
    .filter((entry) => entry.value.length > 0);
}

/**
 * Ficha en texto plano para compartirla por WhatsApp u otra app (p. ej.
 * pasársela a un vendedor). Sin formato de WhatsApp (asteriscos) para que se
 * lea bien en cualquier destino. No incluye la nota interna: es del equipo y
 * el destinatario puede ser cualquiera.
 */
export function buildSubmissionShareText(submission: Submission): string {
  const lines = [
    `Solicitud ${submissionTypeLabel(submission.tipo)} · web Kansaco`,
    `Recibida: ${formatDateTime(submission.createdAt)}`,
    '',
    `Nombre: ${submission.nombre}`,
    `Email: ${submission.email}`,
  ];
  if (submission.telefono) lines.push(`Teléfono: ${submission.telefono}`);
  for (const { label, value } of payloadEntries(submission.tipo, submission.payload)) {
    lines.push(`${label}: ${value}`);
  }
  const mensaje = submission.mensaje?.trim();
  if (mensaje) lines.push('', 'Mensaje:', mensaje);
  return lines.join('\n');
}

/** Tiempo relativo corto, para que se note de un vistazo qué recién entró. */
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return 'recién';
  if (minutes < 60) return `hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'ayer';
  if (days < 30) return `hace ${days} días`;

  const months = Math.floor(days / 30);
  return months === 1 ? 'hace 1 mes' : `hace ${months} meses`;
}
