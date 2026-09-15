import { z } from 'zod';
import { AFIP_OPTIONS, PUESTO_OPTIONS } from './types';
import { toE164 } from '@/lib/phone';

/**
 * Esquemas de los formularios públicos.
 *
 * Los límites replican `SubmissionCreateDto` y `payload-schemas.ts` del backend.
 * Si cambia uno, hay que cambiar el otro: acá sólo se gana feedback inmediato,
 * la validación que manda sigue siendo la del servidor.
 */

const nombre = z
  .string()
  .trim()
  .min(1, 'Ingresá tu nombre')
  .max(180, 'Máximo 180 caracteres');

const email = z
  .string()
  .trim()
  .min(1, 'Ingresá tu email')
  .max(180, 'Máximo 180 caracteres')
  .email('Revisá el email, no parece válido');

/**
 * Teléfono opcional, siempre en E.164 (`+541123456789`), que es lo que
 * `wa.me/` necesita para que el link del panel abra la conversación.
 *
 * `PhoneField` ya entrega el valor normalizado, así que el `transform` es una
 * red de seguridad: cubre un pegado raro o un valor viejo. Vacío es válido —
 * el campo es opcional en los tres formularios.
 */
const telefonoOpcional = z
  .string()
  .trim()
  .max(40, 'Máximo 40 caracteres')
  .transform((value) => (value ? (toE164(value) ?? value) : ''))
  .refine((value) => !value || value.startsWith('+'), {
    message: 'Revisá el teléfono, no parece válido',
  })
  .optional()
  .or(z.literal(''));

const textoCorto = (max = 300) =>
  z.string().trim().max(max, `Máximo ${max} caracteres`).optional().or(z.literal(''));

/** El honeypot nunca debe bloquear el envío: se manda tal cual al backend. */
const website = z.string().optional();

export const mayoristaSchema = z.object({
  nombre,
  email,
  telefono: telefonoOpcional,
  cuit: textoCorto(),
  domicilio: textoCorto(),
  codigoPostal: textoCorto(),
  zonaDistribucion: textoCorto(),
  afip: z.enum(AFIP_OPTIONS, {
    message: 'Elegí tu situación ante AFIP',
  }),
  mensaje: z
    .string()
    .trim()
    .max(4000, 'Máximo 4000 caracteres')
    .optional()
    .or(z.literal('')),
  website,
});

export const trabajoSchema = z.object({
  nombre,
  email,
  telefono: telefonoOpcional,
  puesto: z.enum(PUESTO_OPTIONS, {
    message: 'Elegí el puesto que te interesa',
  }),
  mensaje: z
    .string()
    .trim()
    .min(1, 'Contanos brevemente sobre vos')
    .max(4000, 'Máximo 4000 caracteres'),
  website,
});

export const lubriExpertoSchema = z.object({
  nombre,
  email,
  vehiculo: textoCorto(),
  mensaje: z
    .string()
    .trim()
    .min(1, 'Escribí tu consulta')
    .max(4000, 'Máximo 4000 caracteres'),
  website,
});

export type MayoristaFormValues = z.infer<typeof mayoristaSchema>;
export type TrabajoFormValues = z.infer<typeof trabajoSchema>;
export type LubriExpertoFormValues = z.infer<typeof lubriExpertoSchema>;
