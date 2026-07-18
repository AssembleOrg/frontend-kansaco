// Normalización de texto para datos de zona (localidad, dirección).
// El eje del analytics es la provincia (select cerrado, valor canónico);
// esto es solo para dejar consistentes los campos de texto libre.

/**
 * trim + colapsa espacios múltiples + Title Case.
 * Ej: "  san   MARTÍN " -> "San Martín".
 */
export function normalizeText(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/(^|\s)\p{L}/gu, (m) => m.toUpperCase());
}
