import { CartItem } from './cartItem';

export interface OrderItem {
  productId: number;
  productSlug: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalItemPrice: number;
}

export interface OrderContactInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  contactInfo: OrderContactInfo;
  items: OrderItem[];
  totalAmount: number;
  notes: string;
  orderDate: string;
  paymentMethodSuggestion: string;
  createdAt: string;
}
