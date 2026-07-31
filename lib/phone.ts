import { parsePhoneNumber } from 'react-phone-number-input';

/**
 * Normalización de teléfonos.
 *
 * Se importa desde `react-phone-number-input` (que reexporta libphonenumber-js)
 * y no desde `libphonenumber-js` directamente: con pnpm esa dependencia es
 * transitiva y no se puede importar por su nombre.
 *
 * El objetivo es que los links de WhatsApp funcionen siempre. Sin normalizar,
 * un "11 2345-6789" produce `wa.me/1123456789` — sin el código de país, ese
 * link no abre ninguna conversación.
 */

const DEFAULT_COUNTRY = 'AR';

/**
 * Convierte un teléfono escrito a mano a formato E.164 (`+541123456789`).
 *
 * Devuelve `null` si el número no es válido, así que sirve como validación.
 * Resuelve las formas locales habituales: el `0` de larga distancia y el `15`
 * de celular se interpretan correctamente.
 */
export function toE164(
  input: string | null | undefined,
  country: 'AR' = DEFAULT_COUNTRY,
): string | null {
  if (!input) return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const parsed = parsePhoneNumber(trimmed, country);
    if (!parsed || !parsed.isValid()) return null;
    return parsed.number;
  } catch {
    // parsePhoneNumber lanza con entradas muy malformadas.
    return null;
  }
}

/** `true` si el valor se puede interpretar como un teléfono válido. */
export function isValidPhone(
  input: string | null | undefined,
  country: 'AR' = DEFAULT_COUNTRY,
): boolean {
  return toE164(input, country) !== null;
}

/**
 * Dígitos sin `+`, que es lo que espera `wa.me/`.
 *
 * Si el número se puede normalizar, usa el E.164; si no (por ejemplo un
 * registro viejo guardado como texto libre), cae a limpiar los no-dígitos para
 * no romper los links que hoy funcionan.
 */
export function toWhatsAppDigits(
  input: string | null | undefined,
): string | null {
  if (!input) return null;

  const e164 = toE164(input);
  const digits = (e164 ?? input).replace(/\D/g, '');

  return digits || null;
}
