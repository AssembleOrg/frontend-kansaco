// /types/product.ts

//
export interface Product {
  id: number;
  name: string;
  sku: string;
  slug: string;
  category: string[];
  description: string;
  presentation: string;
  aplication: string;
  imageUrl: string | null;
  wholeSaler: string;
  stock: number;
  isVisible: boolean;
  isFeatured: boolean;
  price: number | null;
}
