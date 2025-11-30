import { useState, useCallback, useEffect } from 'react';
import { Product } from '@/types/product';
import {
  getProducts,
  getProductsPaginated,
  createProduct,
  updateProduct,
  deleteProduct,
  PaginatedProductsResponse,
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
    isFeatured: false,
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
    isFeatured: false,
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
    isFeatured: false,
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
    isFeatured: false,
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
    isFeatured: false,
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
    isFeatured: false,
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
    isFeatured: false,
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
    isFeatured: false,
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
    isFeatured: false,
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
    isFeatured: false,
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
    isFeatured: false,
    price: 2800,
  },
];

export function useAdminProducts(token: string | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Cargar productos con paginación y filtros
  const loadProducts = useCallback(
    async (page = 1, search = '', category = 'all') => {
      if (!token) {
        setIsLoading(false);
        setProducts([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const filters: {
          page: number;
          limit: number;
          name?: string;
          category?: string[];
        } = {
          page,
          limit: pagination.limit,
        };

        // Solo aplicar búsqueda si tiene 3 o más caracteres
        if (search && search.length >= 3) {
          filters.name = search;
        }

        // Aplicar filtro de categoría si no es 'all'
        if (category && category !== 'all') {
          filters.category = [category];
        }

        const result = await getProductsPaginated(token, filters);
        setProducts(result.data);
        setPagination({
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        });
    } catch (err) {
        console.error('Error loading products:', err);
        setError(err instanceof Error ? err.message : 'Error loading products');
        setProducts([]);
    } finally {
      setIsLoading(false);
    }
    },
    [token, pagination.limit]
  );

  // Cargar productos al montar o cuando cambia el token
  useEffect(() => {
    if (token) {
      loadProducts(1, '', 'all');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Solo cargar cuando cambia el token

  // Función para cambiar de página
  const goToPage = useCallback(
    (page: number) => {
      loadProducts(page, searchQuery, selectedCategory);
    },
    [loadProducts, searchQuery, selectedCategory]
  );

  // Función para buscar (con mínimo 3 caracteres)
  const search = useCallback(
    (query: string) => {
      setSearchQuery(query);
      // Si tiene menos de 3 caracteres, limpiar búsqueda y recargar
      if (query.length < 3) {
        loadProducts(1, '', selectedCategory);
      } else {
        loadProducts(1, query, selectedCategory);
      }
    },
    [loadProducts, selectedCategory]
  );

  // Función para cambiar categoría
  const filterByCategory = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      loadProducts(1, searchQuery, category);
    },
    [loadProducts, searchQuery]
  );

  // Crear producto
  const createNewProduct = useCallback(
    async (productData: Omit<Product, 'id' | 'slug'>) => {
      setError(null);
      try {
        if (!token) {
          throw new Error('Requiere autenticación para crear productos');
        }
        const newProduct = await createProduct(token, productData);
        // Recargar productos después de crear
        await loadProducts(pagination.page, searchQuery, selectedCategory);
        return newProduct;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error creating product';
        setError(errorMessage);
        console.error('Error creating product:', err);
        throw err;
      }
    },
    [token, loadProducts, pagination.page, searchQuery, selectedCategory]
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
        // Recargar productos después de editar
        await loadProducts(pagination.page, searchQuery, selectedCategory);
        return updatedProduct;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error updating product';
        setError(errorMessage);
        console.error('Error updating product:', err);
        throw err;
      }
    },
    [token, loadProducts, pagination.page, searchQuery, selectedCategory]
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
        // Recargar productos después de eliminar
        await loadProducts(pagination.page, searchQuery, selectedCategory);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error deleting product';
        setError(errorMessage);
        console.error('Error deleting product:', err);
        throw err;
      }
    },
    [token, loadProducts, pagination.page, searchQuery, selectedCategory]
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
    pagination,
    searchQuery,
    selectedCategory,
    loadProducts,
    goToPage,
    search,
    filterByCategory,
    createNewProduct,
    editProduct,
    removeProduct,
    bulkUpdatePrices,
  };
}
