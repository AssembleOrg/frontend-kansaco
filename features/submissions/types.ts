/** Tipos compartidos entre los formularios públicos y el panel de admin. */

export type SubmissionType = 'MAYORISTA' | 'TRABAJO' | 'LUBRI_EXPERTO';

/** Solicitud tal como la devuelven los endpoints de admin. */
export interface Submission {
  id: number;
  tipo: SubmissionType;
  nombre: string;
  email: string;
  telefono: string | null;
  mensaje: string | null;
  payload: Record<string, string>;
  leida: boolean;
  leidaAt: string | null;
  notaInterna: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Cuerpo que espera `POST /api/public/submission`. */
export interface PublicSubmissionInput {
  tipo: SubmissionType;
  nombre: string;
  email: string;
  telefono?: string;
  mensaje?: string;
  payload?: Record<string, string>;
  /** Honeypot: siempre vacío en un envío legítimo. */
  website?: string;
}

export interface SubmissionFilters {
  search?: string;
  tipo?: SubmissionType;
  leida?: boolean;
}

export const AFIP_OPTIONS = [
  'No inscripto',
  'Monotributista',
  'Responsable Inscripto',
  'Persona Jurídica',
] as const;

export const PUESTO_OPTIONS = [
  'Ventas',
  'Almacén / Depósito',
  'Administración',
  'Reparto / Logística',
  'Producción',
  'Otro',
] as const;
