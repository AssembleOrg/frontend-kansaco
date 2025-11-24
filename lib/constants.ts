// Categorías permitidas para filtros de productos
export const ALLOWED_PRODUCT_CATEGORIES = [
  'Agro',
  'Derivados Y Aditivos',
  'Grasas',
  'Industrial',
  'Motos',
  'Vehículos',
] as const;

export type AllowedCategory = typeof ALLOWED_PRODUCT_CATEGORIES[number];

