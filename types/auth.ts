// types/auth.ts

export interface User {
  id: string;
  email: string;
  fullName?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface ActualLoginApiResponse {
  status: string;
  access_token: string;
  user: User;
  message?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface RegisterResponse {
  status: string;
  message: string;
}
