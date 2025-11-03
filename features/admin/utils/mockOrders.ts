export interface MockOrderItem {
  productId: number;
  productName: string;
  presentation: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface MockOrder {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientCity: string;
  items: MockOrderItem[];
  subtotal: number;
  iva: number;
  total: number;
  orderDate: string;
  paymentMethod: string;
  notes: string;
  orderNumber: string;
}

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'mock-001',
    orderNumber: '2025-001',
    clientName: 'Juan Pérez',
    clientEmail: 'juan.perez@distrisur.com',
    clientPhone: '+54 11 4567-8901',
    clientAddress: 'Av. Libertador 1234, Piso 5',
    clientCity: 'CABA, Buenos Aires',
    items: [
      {
        productId: 1,
        productName: 'KANSACO Sintético 5W-30',
        presentation: '4L',
        quantity: 10,
        unitPrice: 8500,
        totalPrice: 85000,
      },
      {
        productId: 2,
        productName: 'KANSACO Mineral 15W-40',
        presentation: '20L',
        quantity: 5,
        unitPrice: 12000,
        totalPrice: 60000,
      },
    ],
    subtotal: 145000,
    iva: 30450,
    total: 175450,
    orderDate: '2025-11-02',
    paymentMethod: 'Transferencia Bancaria',
    notes: 'Entrega urgente. Coordinar horario de entrega.',
  },
  {
    id: 'mock-002',
    orderNumber: '2025-002',
    clientName: 'María Rodríguez',
    clientEmail: 'maria.r@autoservice.com.ar',
    clientPhone: '+54 221 456-7890',
    clientAddress: 'Calle 50 N° 567, Depto 3B',
    clientCity: 'La Plata, Buenos Aires',
    items: [
      {
        productId: 3,
        productName: 'KANSACO Industrial EP 220',
        presentation: '50L',
        quantity: 2,
        unitPrice: 18000,
        totalPrice: 36000,
      },
      {
        productId: 1,
        productName: 'KANSACO Sintético 5W-30',
        presentation: '4L',
        quantity: 20,
        unitPrice: 8500,
        totalPrice: 170000,
      },
    ],
    subtotal: 206000,
    iva: 43260,
    total: 249260,
    orderDate: '2025-11-03',
    paymentMethod: 'Efectivo',
    notes: 'Factura a nombre de AutoService La Plata SA',
  },
];
