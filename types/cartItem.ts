// /types/cartItem.ts
import { Product } from './product';

export interface CartItem {
  id: number;
  quantity: number;
  product: Product;
  presentation?: string; // Presentación seleccionada por el cliente
}
