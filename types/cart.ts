// /types/cart.ts
import { CartItem } from './cartItem';

export interface Cart {
  id: number;
  createdAt: string;
  updateAt: string;
  userId: string;
  items: CartItem[];
}
