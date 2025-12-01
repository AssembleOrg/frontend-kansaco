export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice?: number;
  presentation?: string;
}

export interface OrderContactInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

// Estados de orden
export type OrderStatus = 'PENDIENTE' | 'PROCESANDO' | 'ENVIADO' | 'COMPLETADO' | 'CANCELADO';

export interface Order {
  id: string;
  userId: string;
  customerType: CustomerType;
  status: OrderStatus;
  contactInfo?: OrderContactInfo; // Opcional para compatibilidad con respuestas del backend
  businessInfo?: BusinessInfo;
  items?: OrderItem[]; // Opcional para compatibilidad con respuestas del backend
  totalAmount?: number | string; // Puede venir como string desde el backend
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
  orderId: string;
  presupuestoNumber?: string;
  pdfBase64?: string;
}

export interface PaginatedOrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
