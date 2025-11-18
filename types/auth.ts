// types/auth.ts

export type UserRole = 'ADMIN' | 'CLIENTE_MINORISTA' | 'CLIENTE_MAYORISTA' | 'ASISTENTE';

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
