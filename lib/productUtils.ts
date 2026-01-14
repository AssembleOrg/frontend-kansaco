// /lib/productUtils.ts
import { Product } from '@/types/product';

/**
 * Obtiene los nombres de categorías de un producto.
 * Prefiere usar el campo `categories` si está disponible, 
 * sino usa el campo legacy `category`.
 */
export function getProductCategoryNames(product: Product): string[] {
  if (product.categories && product.categories.length > 0) {
    return product.categories.map((cat) => cat.name);
  }
  return product.category || [];
}

/**
 * Obtiene los nombres de categorías únicas de un producto.
 * Filtra duplicados y prefiere usar `categories` si está disponible.
 */
export function getUniqueProductCategoryNames(product: Product): string[] {
  const categoryNames = getProductCategoryNames(product);
  return [...new Set(categoryNames)];
}
