import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateConsistentPrice = (productId: number): number => {
  const seed = productId || 1000; // Use fixed fallback instead of random
  return 5000 + ((seed * 937) % 45000);
};

export const formatPrice = (value: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(value);
};
