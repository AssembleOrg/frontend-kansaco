// types/auth.ts

export type UserRole =
  | 'ADMIN'
  | 'CLIENTE_MINORISTA'
  | 'CLIENTE_MAYORISTA'
  | 'ASISTENTE'
  | 'SUBMAYORISTA'
  | 'REVENDEDOR'
  | 'TALLER';

// Categorías comerciales B2B que operan (ven precios y pueden comprar).
// CLIENTE_MINORISTA = usuario creado/pendiente sin categoría (Kansaco no vende minorista).
export const B2B_ROLES: readonly UserRole[] = [
  'CLIENTE_MAYORISTA',
  'SUBMAYORISTA',
  'REVENDEDOR',
  'TALLER',
];

export const esCategoriaB2B = (rol: UserRole | null | undefined): boolean =>
  !!rol && B2B_ROLES.includes(rol);

// Quién puede comprar / ver precios: las categorías B2B más el staff
// (ADMIN/ASISTENTE) que arma pedidos en nombre de los clientes.
// Distinto de esCategoriaB2B, que solo marca clientes comerciales habilitados.
export const puedeComprar = (rol: UserRole | null | undefined): boolean =>
  esCategoriaB2B(rol) || rol === 'ADMIN' || rol === 'ASISTENTE';

// Staff del panel: ADMIN y ASISTENTE. Qué secciones ve cada uno lo decide
// `features/admin/access.ts`, espejo de los @Roles del backend.
export const esStaff = (rol: UserRole | null | undefined): boolean =>
  rol === 'ADMIN' || rol === 'ASISTENTE';

/** Motivo por el que una cuenta está frenada. Espejo de `UserBloqueo` del backend. */
export type UserBloqueo = 'COBRANZAS' | 'VENTAS';

/** Texto que ve el cliente frenado. Mismo texto que devuelve el backend en el checkout. */
export const MENSAJE_BLOQUEO: Record<UserBloqueo, string> = {
  COBRANZAS: 'Su cuenta está frenada. Comuníquese con el área de cobranzas.',
  VENTAS: 'Su cuenta está frenada. Comuníquese con ventas.',
};

/** Cuenta frenada: conserva su categoría pero no puede comprar. */
export const estaFrenado = (
  user: Pick<User, 'bloqueo'> | null | undefined,
): boolean => !!user?.bloqueo;

export interface Discount {
  id: number;
  porcentaje: number;
}

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
  codigoPostal?: string;
  telefono: string;
  rol: UserRole;
  /** Opcional: las cookies de sesiones viejas no lo traen. */
  bloqueo?: UserBloqueo | null;
  descuentosAplicados: Discount[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginApiResponse {
  status: string;
  data: {
    token: string;
    user: User;
  };
}

export interface RegisterPayload {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
  codigoPostal?: string;
  telefono: string;
  rol?: UserRole;
}

export interface RegisterApiResponse {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  direccion?: string;
  telefono: string;
  rol: UserRole;
  descuentosAplicados: Discount[];
}
