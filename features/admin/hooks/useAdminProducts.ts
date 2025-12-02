import { useState, useCallback, useEffect } from 'react';
import { Product } from '@/types/product';
import {
  getProductsPaginated,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/lib/api';

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
    async (
      productId: number,
      productData: Partial<Product>,
      skipRefetch = false
    ) => {
      setError(null);
      try {
        if (!token) {
          throw new Error('Requiere autenticación para editar productos');
        }
        const updatedProduct = await updateProduct(
          token,
          productId,
          productData
        );
        // Recargar productos después de editar solo si no se omite el refetch
        if (!skipRefetch) {
          await loadProducts(pagination.page, searchQuery, selectedCategory);
        }
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
              newPrice =
                operator === 'increase'
                  ? currentPrice + change
                  : currentPrice - change;
            } else {
              const change = value;
              newPrice =
                operator === 'increase'
                  ? currentPrice + change
                  : currentPrice - change;
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
