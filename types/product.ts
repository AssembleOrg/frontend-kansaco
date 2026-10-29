// /types/product.ts

import { Category } from './category';

//
export interface Product {
  id: number;
  name: string;
  sku: string;
  slug: string;
  category: string[]; // Array legacy (siempre presente para compatibilidad)
  categories?: Category[]; // NUEVO: Categorías relacionadas con IDs
  description: string;
  presentation: string;
  aplication: string;
  imageUrl: string | null;
  wholeSaler: string;
  stock: number;
  isVisible: boolean;
  isFeatured: boolean;
  price: number | null;
  /** Ficha técnica (PDF). El archivo se pide con login a /product/:id/technical-sheet. */
  technicalSheet?: { name: string; size: number | null } | null;
}
