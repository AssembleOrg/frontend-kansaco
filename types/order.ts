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

// Tipos para envío de email de pedido
export interface BusinessInfo {
  cuit: string;
  razonSocial?: string;
  situacionAfip: string;
  codigoPostal?: string;
}

export type CustomerType = 'CLIENTE_MINORISTA' | 'CLIENTE_MAYORISTA';

export interface SendOrderEmailData {
  customerType: CustomerType;
  contactInfo: OrderContactInfo;
  businessInfo?: BusinessInfo;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice?: number;
  }>;
  totalAmount?: number;
  notes?: string;
}

export interface OrderEmailResponse {
  message: string;
}
