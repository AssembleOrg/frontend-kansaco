/**
 * "Volver al catálogo" sin ensuciar la URL de la ficha.
 *
 * Antes la tarjeta enlazaba /productos/<slug>?page=..&category=.. y Google
 * indexaba esas variantes como duplicadas de la ficha. Ahora el enlace es
 * siempre la URL canónica y el filtro del listado viaja en sessionStorage,
 * atado al slug que se abrió (si se entra a otra ficha, no se usa).
 */
const KEY = 'kansaco:volver-productos';

export function productoCanonicalHref(slug: string): string {
  return `/productos/${encodeURIComponent(slug)}/`;
}

/** Guarda page/category del listado actual al abrir una ficha. */
export function recordarListado(
  slug: string,
  searchParams: { get(name: string): string | null } | null,
): void {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams();
    const page = searchParams?.get('page');
    const category = searchParams?.get('category');
    if (page) params.set('page', page);
    if (category) params.set('category', category);
    const qs = params.toString();
    if (qs) window.sessionStorage.setItem(KEY, JSON.stringify({ slug, qs }));
    else window.sessionStorage.removeItem(KEY);
  } catch {
    /* sessionStorage bloqueado: se vuelve a /productos */
  }
}

/** Query del listado para la ficha `slug` (o '' si no corresponde). */
export function listadoGuardado(slug: string): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return '';
    const data = JSON.parse(raw) as { slug?: string; qs?: string };
    return data.slug === slug && typeof data.qs === 'string' ? data.qs : '';
  } catch {
    return '';
  }
}
