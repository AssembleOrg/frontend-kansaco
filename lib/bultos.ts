// Bultos de venta: la cantidad siempre es en UNIDADES; el bulto es una
// equivalencia para mostrar y sugerir. Mismo algoritmo que el backend
// (backend-kansaco/src/bulto/bulto.util.ts).

export interface BultoInfo {
  id?: number;
  nombre: string;
  unidades: number;
}

/** productId -> presentación -> bultos (de mayor a menor). */
export type BultosPorProducto = Record<number, Record<string, BultoInfo[]>>;

/**
 * describirBultos(72, [Pallet x 48, Caja x 24]) → "1 × Pallet x 48 + 1 × Caja x 24"
 * describirBultos(12, [Caja x 8])               → "1 × Caja x 8 + 4 u. sueltas"
 * Sin bultos → "".
 * ponytail: greedy mayor→menor; con tamaños no múltiplos (24/36) puede dejar resto
 * aunque exista combinación exacta.
 */
export function describirBultos(quantity: number, bultos?: BultoInfo[] | null): string {
  if (!bultos?.length || !(quantity > 0)) return '';
  const partes: string[] = [];
  let resto = quantity;
  for (const b of [...bultos].sort((a, c) => c.unidades - a.unidades)) {
    const n = Math.floor(resto / b.unidades);
    if (n > 0) {
      partes.push(`${n} × ${b.nombre}`);
      resto -= n * b.unidades;
    }
  }
  if (resto > 0) partes.push(`${resto} u. sueltas`);
  return partes.join(' + ');
}

/** ¿La cantidad deja unidades sueltas respecto al bulto más chico? */
export function tieneSueltas(quantity: number, bultos?: BultoInfo[] | null): boolean {
  return describirBultos(quantity, bultos).includes('sueltas');
}

/** Bulto más chico: paso del +/- y cantidad inicial. 1 si no hay bultos. */
export function pasoBulto(bultos?: BultoInfo[] | null): number {
  return bultos?.length ? Math.min(...bultos.map((b) => b.unidades)) : 1;
}

/** Opciones de presentación: mismo split/trim que el backend, sin repetidas. */
export function splitPresentations(presentation?: string | null): string[] {
  return [
    ...new Set(
      (presentation ?? '')
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    ),
  ];
}

/**
 * Heurística para la lista de "pendientes": presentación que parece < 20 L
 * (cc/ml, gramos, litros < 20, kg < 18). "GRADO 2" u otros textos → false.
 */
export function pareceMenor20L(presentation: string): boolean {
  const t = presentation.toLowerCase().replace(',', '.');
  const m = t.match(/(\d+(?:\.\d+)?)\s*(cc|ml|grs?|gramos|g\b|kg|kilos?|l\b|lts?|litros?)/);
  if (!m) return false;
  const n = parseFloat(m[1]);
  const u = m[2];
  if (u === 'cc' || u === 'ml' || u.startsWith('gr') || u === 'g') return true;
  if (u.startsWith('k')) return n < 18;
  return n < 20;
}

const ENVASES: [string, RegExp][] = [
  ['Tambor', /tambor/],
  ['Balde', /balde/],
  ['Bidón', /bid[oó]n/],
  ['Botella', /botella/],
  ['Pomo', /pomo/],
  ['Pote', /pote/],
  ['Aerosol', /aerosol|aereosol/],
];

/** Tipo de envase a partir del texto libre ("Bidon de 4 litros" → "Bidón"). null si no se reconoce ("4L", "GRADO 2"). */
export function tipoEnvase(presentation: string): string | null {
  const t = presentation.toLowerCase();
  return ENVASES.find(([, re]) => re.test(t))?.[0] ?? null;
}
