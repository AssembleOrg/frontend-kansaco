// /types/user.ts
import { Cart } from './cart';

export type UserRole =
  | 'USER'
  | 'ADMIN'
  | 'WHOLESALER_PENDING'
  | 'WHOLESALER_APPROVED'; // Preguntar.

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole; //todavia no esta
  cart: Cart;
}
