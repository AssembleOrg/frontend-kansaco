export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice?: number;
  presentation?: string;
  /** Copia de los bultos al momento del pedido (la calcula el backend). */
  bultos?: { nombre: string; unidades: number }[];
}

export interface OrderContactInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  localidad?: string;
  provincia?: string;
  codigoPostal?: string;
}

// ---- Logística de envío (MÓDULO 3) ----
export type ModalidadEnvio = 'RETIRO' | 'FLETE' | 'EXPRESO';

/** Dirección estructurada (evita typos de provincia; calle/localidad libres). */
export interface Direccion {
  calle: string; // calle + número
  localidad?: string;
  provincia?: string;
  codigoPostal?: string;
}

/**
 * Modalidad logística elegida en el checkout.
 * - RETIRO: sin direcciones (planta única).
 * - FLETE: `entrega` obligatoria.
 * - EXPRESO: `despacho` (depósito del expreso) + `entrega` (destino final), y
 *   `transporte` (empresa) obligatorios.
 */
export interface OrderShippingInfo {
  modalidad: ModalidadEnvio;
  entrega?: Direccion;
  despacho?: Direccion;
  transporte?: string;
}

/** Planta única de retiro. Si en el futuro hay más, esto pasa a una lista. */
export const PLANTA_RETIRO =
  'Kansaco Petroquímica S.A. — Magallanes 2031, Florencio Varela, Buenos Aires';

/** Etiqueta legible de cada modalidad (CRM, PDF, mails). */
export const MODALIDAD_LABEL: Record<ModalidadEnvio, string> = {
  RETIRO: 'Retiro en planta',
  FLETE: 'Flete / Transporte local',
  EXPRESO: 'Expreso / Larga distancia',
};

// Estados de orden
export type OrderStatus = 'PENDIENTE' | 'PROCESANDO' | 'ENVIADO' | 'COMPLETADO' | 'CANCELADO';

export interface Order {
  id: string;
  userId: string;
  customerType: CustomerType;
  status: OrderStatus;
  contactInfo?: OrderContactInfo; // Opcional para compatibilidad con respuestas del backend
  businessInfo?: BusinessInfo;
  shippingInfo?: OrderShippingInfo; // Opcional: órdenes previas al MÓDULO 3 no lo traen
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
  shippingInfo?: OrderShippingInfo;
  items: OrderItem[];
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

export interface UpdateOrderDto {
  contactInfo?: OrderContactInfo;
  businessInfo?: BusinessInfo;
  shippingInfo?: OrderShippingInfo;
  items?: OrderItem[];
  notes?: string;
}
