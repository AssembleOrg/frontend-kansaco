import type { UserRole } from '@/types/auth';

/**
 * Secciones del panel que sólo ve ADMIN. Espejo de los `@Roles` del backend:
 * la asistente (ASISTENTE) puede con órdenes, productos, categorías, imágenes
 * y cuentas (sólo frenar/destrabar; la categoría la cambia el admin); a todo
 * lo demás el backend le responde 403, así que ni se lo mostramos. Si el
 * backend le abre una sección nueva, sacarla de acá.
 */
const ADMIN_ONLY_PATHS = [
  '/admin/analytics',
  '/admin/pricing',
  '/admin/solicitudes',
  '/admin/negocios',
  '/admin/leads',
  '/admin/vendedores',
  '/admin/configuracion',
];

/** ¿Este rol puede entrar a esta ruta del panel? */
export function canAccessAdminPath(
  rol: UserRole | null | undefined,
  path: string,
): boolean {
  if (rol === 'ADMIN') return true;
  if (rol !== 'ASISTENTE') return false;
  return !ADMIN_ONLY_PATHS.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
}
