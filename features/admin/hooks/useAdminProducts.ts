import { useState, useCallback, useEffect } from 'react';
import { Product } from '@/types/product';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/lib/api';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'KANSACO Sintético 5W-30',
    sku: 'KAN-SIN-5W30-4L',
    slug: 'kansaco-sintetico-5w30',
    category: ['Sintéticos', 'Aceites para Motor'],
    description: 'Aceite sintético de alta performance para motores modernos',
    presentation: '4L',
    aplication: 'Motores de gasolina modernos, turbo',
    imageUrl: '/landing/kansaco-logo.png',
    wholeSaler: 'KANSACO',
    stock: 50,
    isVisible: true,
    price: 8500,
  },
  {
    id: 2,
    name: 'KANSACO Mineral 15W-40',
    sku: 'KAN-MIN-15W40-20L',
    slug: 'kansaco-mineral-15w40',
    category: ['Minerales', 'Aceites para Motor'],
    description: 'Aceite mineral para motores diesel',
    presentation: '20L',
    aplication: 'Motores diesel',
    imageUrl: '/landing/kansaco-logo.png',
    wholeSaler: 'KANSACO',
    stock: 25,
    isVisible: true,
    price: 12000,
  },
  {
    id: 3,
    name: 'KANSACO Industrial EP 220',
    sku: 'KAN-IND-220-50L',
    slug: 'kansaco-industrial-ep220',
    category: ['Industriales', 'Aceites'],
    description: 'Aceite industrial para sistemas hidráulicos',
    presentation: '50L',
    aplication: 'Sistemas hidráulicos industriales',
    imageUrl: '/landing/kansaco-logo.png',
    wholeSaler: 'KANSACO',
    stock: 10,
    isVisible: true,
    price: 18000,
  },
  // Motos - 2 productos
  {
    id: 4,
    name: 'KANSACO Moto 2T Premium',
    sku: 'KAN-MOTO-2T-1L',
    slug: 'kansaco-moto-2t-premium',
    category: ['Motos'],
    description: 'Aceite 2T para motocicletas de competencia',
    presentation: '1L',
    aplication: 'Motocicletas 2T',
    imageUrl: '/landing/kansaco-logo.png',
    wholeSaler: 'KANSACO',
    stock: 40,
    isVisible: true,
    price: 6500,
  },
  {
    id: 5,
    name: 'KANSACO Moto 4T Synthetic',
    sku: 'KAN-MOTO-4T-1L',
    slug: 'kansaco-moto-4t-synthetic',
    category: ['Motos'],
    description: 'Aceite sintético 4T para motocicletas de alto rendimiento',
    presentation: '1L',
    aplication: 'Motocicletas 4T turbo',
    imageUrl: '/landing/kansaco-logo.png',
    wholeSaler: 'KANSACO',
    stock: 35,
    isVisible: true,
    price: 7800,
  },
  // Industrial - 2 productos
  {
    id: 6,
    name: 'KANSACO Industrial ISO 32',
    sku: 'KAN-IND-ISO32-20L',
    slug: 'kansaco-industrial-iso32',
    category: ['Industrial'],
    description: 'Aceite industrial ISO 32 para máquinas',
    presentation: '20L',
    aplication: 'Máquinas industriales y compresores',
    imageUrl: '/landing/kansaco-logo.png',
    wholeSaler: 'KANSACO',
    stock: 20,
    isVisible: true,
    price: 14500,
  },
  {
    id: 7,
    name: 'KANSACO Industrial ISO 46',
    sku: 'KAN-IND-ISO46-20L',
    slug: 'kansaco-industrial-iso46',
    category: ['Industrial'],
    description: 'Aceite industrial ISO 46 con anti-desgaste',
    presentation: '20L',
    aplication: 'Sistemas hidráulicos pesados',
    imageUrl: '/landing/kansaco-logo.png',
    wholeSaler: 'KANSACO',
    stock: 15,
    isVisible: true,
    price: 15500,
  },
  // Grasas - 2 productos
  {
    id: 8,
    name: 'KANSACO Grasa Multipropósito',
    sku: 'KAN-GRASA-MP-1KG',
    slug: 'kansaco-grasa-multiproposito',
    category: ['Grasas'],
    description: 'Grasa multipropósito de altas prestaciones',
    presentation: '1KG',
    aplication: 'Rodamientos, engranajes y cojinetes',
    imageUrl: '/landing/kansaco-logo.png',
    wholeSaler: 'KANSACO',
    stock: 60,
    isVisible: true,
    price: 4200,
  },
  {
    id: 9,
    name: 'KANSACO Grasa Extreme Temperature',
    sku: 'KAN-GRASA-XT-500G',
    slug: 'kansaco-grasa-extreme-temp',
    category: ['Grasas'],
    description: 'Grasa para temperaturas extremas',
    presentation: '500G',
    aplication: 'Aplicaciones de alta temperatura',
    imageUrl: '/landing/kansaco-logo.png',
    wholeSaler: 'KANSACO',
    stock: 30,
    isVisible: true,
    price: 5800,
  },
  // Derivados y Aditivos - 2 productos
  {
    id: 10,
    name: 'KANSACO Aditivo Potenciador',
    sku: 'KAN-ADIT-POT-500ML',
    slug: 'kansaco-aditivo-potenciador',
    category: ['Derivados y Aditivos'],
    description: 'Aditivo potenciador de performance para aceites',
    presentation: '500ML',
    aplication: 'Mejora de performance en aceites de motor',
    imageUrl: '/landing/kansaco-logo.png',
    wholeSaler: 'KANSACO',
    stock: 45,
    isVisible: true,
    price: 3500,
  },
  {
    id: 11,
    name: 'KANSACO Derivado Limpiador',
    sku: 'KAN-DERIV-LIMP-1L',
    slug: 'kansaco-derivado-limpiador',
    category: ['Derivados y Aditivos'],
    description: 'Derivado de petróleo para limpieza industrial',
    presentation: '1L',
    aplication: 'Limpieza de máquinas y componentes',
    imageUrl: '/landing/kansaco-logo.png',
    wholeSaler: 'KANSACO',
    stock: 25,
    isVisible: true,
    price: 2800,
  },
];

export function useAdminProducts(token: string | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar productos
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Si no hay token, usar mock data
      if (!token) {
        setProducts(MOCK_PRODUCTS);
        return;
      }

      const data = await getProducts(token);
      setProducts(data);
    } catch (err) {
      // Si falla la carga, mostrar mock data como fallback
      console.warn('Error loading products, using mock data:', err);
      setProducts(MOCK_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Crear producto
  const createNewProduct = useCallback(
    async (productData: Omit<Product, 'id'>) => {
      setError(null);
      try {
        if (!token) {
          throw new Error('Requiere autenticación para crear productos');
        }
        const newProduct = await createProduct(token, productData);
        setProducts((prev) => [newProduct, ...prev]);
        return newProduct;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error creating product';
        setError(errorMessage);
        console.error('Error creating product:', err);
        throw err;
      }
    },
    [token]
  );

  // Editar producto
  const editProduct = useCallback(
    async (productId: number, productData: Partial<Product>) => {
      setError(null);
      try {
        if (!token) {
          throw new Error('Requiere autenticación para editar productos');
        }
        const updatedProduct = await updateProduct(token, productId, productData);
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? updatedProduct : p))
        );
        return updatedProduct;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error updating product';
        setError(errorMessage);
        console.error('Error updating product:', err);
        throw err;
      }
    },
    [token]
  );

  // Eliminar producto
  const removeProduct = useCallback(
    async (productId: number) => {
      setError(null);
      try {
        if (!token) {
          throw new Error('Requiere autenticación para eliminar productos');
        }
        await deleteProduct(token, productId);
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error deleting product';
        setError(errorMessage);
        console.error('Error deleting product:', err);
        throw err;
      }
    },
    [token]
  );

  // Actualizar precios en masa
  const bulkUpdatePrices = useCallback(
    async (
      productIds: number[],
      updateType: 'percentage' | 'fixed',
      operator: 'increase' | 'decrease',
      value: number
    ) => {
      setError(null);
      try {
        // Validar que el valor sea positivo
        if (value <= 0) {
          throw new Error('El valor debe ser mayor a 0');
        }

        // Actualizar localmente (sin backend, usamos mock)
        setProducts((prev) =>
          prev.map((product) => {
            if (!productIds.includes(product.id)) {
              return product;
            }

            const currentPrice = product.price ?? 0;
            let newPrice = currentPrice;

            if (updateType === 'percentage') {
              const change = (currentPrice * value) / 100;
              newPrice = operator === 'increase' ? currentPrice + change : currentPrice - change;
            } else {
              const change = value;
              newPrice = operator === 'increase' ? currentPrice + change : currentPrice - change;
            }

            // No permitir precios negativos
            newPrice = Math.max(0, newPrice);

            return {
              ...product,
              price: newPrice,
            };
          })
        );

        // En el futuro, aquí iría la llamada al backend
        // await bulkUpdateProductPrices(token, productIds, updateType, operator, value);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error updating prices';
        setError(errorMessage);
        console.error('Error bulk updating prices:', err);
        throw err;
      }
    },
    []
  );

  return {
    products,
    isLoading,
    error,
    loadProducts,
    createNewProduct,
    editProduct,
    removeProduct,
    bulkUpdatePrices,
  };
}
