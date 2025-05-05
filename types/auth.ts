// /types/auth.ts
import { User } from './user';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ActualLoginApiResponse {
  status: string;
  data: {
    user: User;
    token: string;
  };
}
// // Api response si 200
// export interface LoginResponse {
//   user: User;
//   token: string; // JWT
// }

// Estructura del estado de autenticación en Zustand
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<boolean>;
  logout: () => void;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface RegisterResponse {
  status: string;
}
