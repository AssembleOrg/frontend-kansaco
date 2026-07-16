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
  telefono: string;
  rol: UserRole;
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
