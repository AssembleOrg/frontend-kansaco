import { Product } from '@/types';

export const categoriasDe = (p: Product) =>
  p.categories && p.categories.length > 0 ? p.categories.map((c) => c.name) : p.category || [];

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const palabras = (s: string) => norm(s).split(/[^a-z0-9]+/).filter(Boolean);

// Todo el catálogo es lubricante: "lubricante moto" debe buscar "moto".
const GENERICAS = ['lubricante', 'lubricantes', 'aceite', 'aceites'];
const VACIAS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'para', 'con', 'y', 'en', 'un', 'una', 'p']);

export function tokens(q: string): string[] {
  const todas = palabras(q);
  const utiles = todas.filter((w) => !VACIAS.has(w) && !(w.length >= 4 && GENERICAS.some((g) => g.startsWith(w))));
  // Un número suelto se pega a su vecina: "dhl 3" → "dhl3", "15w 40" → "15w40", "2 tiempos" → "2tiempos".
  const out: string[] = [];
  for (const w of utiles.length ? utiles : todas) {
    const prev = out[out.length - 1] ?? '';
    if ((/^\d+$/.test(w) && /[a-z]$/.test(prev)) || /^\d+$/.test(prev)) out[out.length - 1] += w;
    else out.push(w);
  }
  return out;
}

/**
 * 0 = no coincide (todas las palabras deben aparecer en algún campo).
 * Más alto = más relevante: nombre/categoría pesan más, palabra entera (o plural) x2.
 * Se compara sin espacios ni guiones, así "15w40" encuentra "15W 40" y "15W-40".
 * ponytail: ranking heurístico; pasar a búsqueda del servidor (pg_trgm) si el catálogo crece.
 */
export function puntaje(p: Product, q: string): number {
  const ts = tokens(q);
  if (!ts.length) return 1;
  const campos = (
    [
      [p.name, 3],
      ...categoriasDe(p).map((c) => [c, 3]),
      [p.sku, 2],
      [p.aplication, 1],
      [p.presentation, 1],
    ] as [string | undefined | null, number][]
  )
    .filter(([t]) => t)
    .map(([t, peso]) => ({ ws: palabras(String(t)), junto: palabras(String(t)).join(''), peso }));

  let total = 0;
  for (const tk of ts) {
    let mejor = 0;
    for (const c of campos) {
      if (!c.junto.includes(tk)) continue;
      const entera = c.ws.some((w) => w === tk || w === `${tk}s` || w === `${tk}es`);
      mejor = Math.max(mejor, c.peso * (entera ? 2 : 1));
    }
    if (!mejor) return 0;
    total += mejor;
  }
  return total;
}
