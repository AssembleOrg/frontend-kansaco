// /types/category.ts

export interface Category {
  id: number;
  name: string;
  createdAt: string; // ISO string en GMT-3
  updatedAt: string; // ISO string en GMT-3
}

export interface CategoryCreateRequest {
  name: string; // Requerido, max 120 caracteres
}

export interface CategoryUpdateRequest {
  name?: string; // Opcional, max 120 caracteres
}
