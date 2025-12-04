// app/(shop)/productos/page.tsx
'use client';

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  useRef,
} from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  getProducts,
  getProductsPaginated,
  validateOrderForEdit,
} from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/features/products/components/ProductCard';
import ProductFilters from '@/features/products/components/client/ProductFilters';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackToHomeButton from '@/components/ui/BackToHomeButton';
import { useCart } from '@/features/cart/hooks/useCart';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ALLOWED_PRODUCT_CATEGORIES } from '@/lib/constants';
import { X, Info } from 'lucide-react';
import { toast } from 'sonner';
// import { ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }>({
    total: 0,
    page: 1,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const { addToCart, openCart, clearCart, itemCount } = useCart();

  // Estados para modo edición
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  const currentPage = Number(searchParams.get('page')) || 1;
  const currentCategoryFilter = searchParams.get('category');
  const minPrice = searchParams.get('minPrice')
    ? Number(searchParams.get('minPrice'))
    : undefined;
  const maxPrice = searchParams.get('maxPrice')
    ? Number(searchParams.get('maxPrice'))
    : undefined;
  const searchQuery = searchParams.get('search') ?? undefined;

  // Usar categorías permitidas directamente (no necesitamos cargar del backend)
  const uniqueCategories = [...ALLOWED_PRODUCT_CATEGORIES];

  // Sync searchTerm with URL parameter
  useEffect(() => {
    setSearchTerm(searchQuery ?? '');
  }, [searchQuery]);

  // Search handlers with debouncing
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.trim() === '') {
      applySearch('');
      return;
    }

    if (value.length < 3) {
      return;
    }

    debounceTimer.current = setTimeout(() => {
      applySearch(value.trim());
    }, 500);
  };

  const applySearch = (searchValue: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (searchValue) {
      current.set('search', searchValue);
    } else {
      current.delete('search');
    }

    current.delete('page');
    current.delete('openCart');

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${window.location.pathname}${query}`);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    applySearch('');
  };

  // Cargar productos con paginación y filtros del servidor
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Usar endpoint paginado (intenta con o sin token)
        const filters: {
          page: number;
          limit: number;
          category?: string[];
          isVisible?: boolean;
          name?: string;
        } = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          isVisible: true, // Solo productos visibles para usuarios comunes
        };

        // Aplicar filtro de categoría si existe
        if (currentCategoryFilter) {
          filters.category = [currentCategoryFilter];
        }

        // Aplicar filtro de búsqueda si existe
        if (searchQuery) {
          filters.name = searchQuery;
        }

        try {
          const result = await getProductsPaginated(token, filters);
          setProducts(result.data);
          setPagination({
            total: result.total,
            page: result.page,
            totalPages: result.totalPages,
            hasNext: result.hasNext,
            hasPrev: result.hasPrev,
          });
        } catch (paginatedError) {
          // Si falla el endpoint paginado (puede requerir auth), usar fallback
          console.warn(
            'Error using paginated endpoint, falling back to all products:',
            paginatedError
          );
          const fetchedProducts = await getProducts(null);
          // Filtrar localmente por visibilidad y categoría
          let filtered = fetchedProducts.filter((p) => p.isVisible);

          if (currentCategoryFilter) {
            filtered = filtered.filter((p) =>
              p.category?.includes(currentCategoryFilter)
            );
          }

          // Paginación local
          const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
          const endIndex = startIndex + ITEMS_PER_PAGE;
          const paginated = filtered.slice(startIndex, endIndex);

          setProducts(paginated);
          setPagination({
            total: filtered.length,
            page: currentPage,
            totalPages: Math.ceil(filtered.length / ITEMS_PER_PAGE),
            hasNext: endIndex < filtered.length,
            hasPrev: currentPage > 1,
          });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al cargar productos.'
        );
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, currentCategoryFilter, searchQuery, token]);

  const openCartParam = searchParams.get('openCart');

  useEffect(() => {
    const shouldOpenCart = openCartParam === 'true';

    if (shouldOpenCart) {
      openCart();

      // Limpiar el parámetro openCart de la URL después de usarlo
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('openCart');
      const newUrl = newSearchParams.toString()
        ? `?${newSearchParams.toString()}`
        : '/productos';
      router.replace(newUrl, { scroll: false });
    }
  }, [openCartParam, openCart, router, searchParams]);

  // Detectar modo edición y pre-cargar items al carrito
  useEffect(() => {
    const validateAndLoadEditMode = async () => {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🛒 [ProductosPage] DETECTANDO MODO EDICIÓN');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      const editMode = localStorage.getItem('editMode');
      const orderId = localStorage.getItem('editingOrderId');
      const orderItemsJson = localStorage.getItem('editingOrderItems');

      console.log('📖 LocalStorage READ:', {
        editMode,
        orderId: orderId
          ? {
              value: orderId,
              type: typeof orderId,
              length: orderId.length,
              preview: `${orderId.slice(0, 8)}...${orderId.slice(-8)}`,
            }
          : null,
        itemsPresent: !!orderItemsJson,
        tokenPresent: !!token,
      });

      if (editMode === 'true' && orderId && orderItemsJson && token) {
        console.log('✅ Condiciones cumplidas, validando orden...');

        // ✅ VALIDAR que la orden existe y está PENDIENTE
        const validation = await validateOrderForEdit(token, orderId);

        console.log('🔍 VALIDACIÓN RESULTADO:', {
          valid: validation.valid,
          reason: validation.reason,
          orderStatus: validation.order?.status,
          orderExists: !!validation.order,
        });

        if (!validation.valid) {
          // ❌ Orden no válida → Limpiar localStorage y mostrar toast
          console.warn('⚠️ Order validation failed:', validation.reason);
          console.log('🧹 Limpiando localStorage...');
          localStorage.removeItem('editMode');
          localStorage.removeItem('editingOrderId');
          localStorage.removeItem('editingOrderItems');

          toast.error(
            validation.reason?.includes('not found')
              ? 'La orden que intentabas editar ya no existe'
              : 'Esta orden no puede ser editada (estado: ' +
                  validation.order?.status +
                  ')'
          );

          setIsEditMode(false);
          setEditingOrderId(null);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          return;
        }

        // ✅ Orden válida → Proceder con modo edición
        console.log('✅ Order validated for edit:', orderId);
        setIsEditMode(true);
        setEditingOrderId(orderId);

        // Pre-cargar items de la orden al carrito
        try {
          const items = JSON.parse(orderItemsJson);
          console.log('📦 Pre-cargando items al carrito:', items.length);

          // Limpiar carrito actual primero
          clearCart();

          // Agregar cada item de la orden al carrito
          items.forEach(
            (
              item: {
                productId: number;
                productName: string;
                unitPrice: number;
                quantity: number;
                presentation?: string;
              },
              index: number
            ) => {
              console.log(
                `  [${index + 1}] ${item.productName} x${item.quantity}`
              );
              // Construir objeto Product mínimo desde OrderItem
              const product: Product = {
                id: item.productId,
                name: item.productName,
                price: parseFloat(item.unitPrice?.toString() || '0'),
                sku: '',
                slug: '',
                category: [],
                description: '',
                presentation: item.presentation || '',
                aplication: '',
                imageUrl: null,
                wholeSaler: '',
                stock: 0,
                isVisible: true,
                isFeatured: false,
              };

              addToCart(product, item.quantity, item.presentation);
            }
          );

          console.log(
            `✅ Pre-loaded ${items.length} items to cart for editing`
          );
          toast.success(
            `${items.length} producto${items.length !== 1 ? 's' : ''} cargado${items.length !== 1 ? 's' : ''} al carrito`
          );
        } catch (error) {
          console.error('❌ Error parsing stored items:', error);
          toast.error('Error al cargar los productos de la orden');
        }
      } else {
        console.log('❌ Condiciones NO cumplidas para modo edición:', {
          hasEditMode: editMode === 'true',
          hasOrderId: !!orderId,
          hasItems: !!orderItemsJson,
          hasToken: !!token,
        });
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    };

    validateAndLoadEditMode();
  }, [token, addToCart, clearCart]);

  const handleCancelEdit = useCallback(() => {
    // Limpiar localStorage
    localStorage.removeItem('editMode');
    localStorage.removeItem('editingOrderId');
    localStorage.removeItem('editingOrderItems');

    // Limpiar carrito
    clearCart();

    // Resetear estados
    setIsEditMode(false);
    setEditingOrderId(null);

    // Redirigir a mis pedidos
    toast.info('Edición cancelada');
    router.push('/mis-pedidos');
  }, [clearCart, router]);

  // Protección contra navegación accidental en edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Solo advertir si hay items en el carrito
      if (itemCount > 0) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requiere esto
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isEditMode, itemCount]);

  // Filtrar por precio (filtro local ya que el backend no lo soporta directamente)
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filtrar por precio (solo si hay filtros de precio)
    if (minPrice !== undefined || maxPrice !== undefined) {
      result = result.filter((p) => {
        const price =
          typeof p.price === 'string' ? parseFloat(p.price) : (p.price ?? 0);

        // Si hay precio mínimo y máximo
        if (minPrice !== undefined && maxPrice !== undefined) {
          return price >= minPrice && price <= maxPrice;
        }

        // Si solo hay precio mínimo
        if (minPrice !== undefined) {
          return price >= minPrice;
        }

        // Si solo hay precio máximo
        if (maxPrice !== undefined) {
          return price <= maxPrice;
        }

        return true;
      });
    }

    return result;
  }, [products, minPrice, maxPrice]);

  // Los productos ya vienen paginados del servidor, solo aplicar filtro de precio si existe
  const currentProducts = filteredProducts;
  const totalPages = pagination.totalPages;

  const handlePageChange = (page: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('page', page.toString());
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${window.location.pathname}${query}`);
  };

  const renderPagination = () => {
    const pages: React.ReactElement[] = [];
    const maxVisiblePages = 4; // Número máximo de páginas visibles
    const halfVisible = Math.floor(maxVisiblePages / 2);

    // Función para agregar un número de página
    const addPage = (pageNum: number) => {
      pages.push(
        <Button
          key={pageNum}
          variant={currentPage === pageNum ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(pageNum)}
          className="min-w-[2rem]"
        >
          {pageNum}
        </Button>
      );
    };

    // Función para agregar puntos suspensivos
    const addEllipsis = (key: string) => {
      pages.push(
        <span key={key} className="px-2 text-gray-500">
          ...
        </span>
      );
    };

    // Lógica para mostrar las páginas
    if (totalPages <= maxVisiblePages) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        addPage(i);
      }
    } else {
      // Siempre mostrar primera página
      addPage(1);

      // Calcular rango de páginas a mostrar alrededor de la página actual
      let startPage = Math.max(2, currentPage - halfVisible);
      let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

      // Ajustar el rango si estamos cerca de los extremos
      if (currentPage <= halfVisible + 1) {
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - halfVisible) {
        startPage = totalPages - maxVisiblePages + 1;
      }

      // Agregar puntos suspensivos y páginas
      if (startPage > 2) {
        addEllipsis('start');
      }

      for (let i = startPage; i <= endPage; i++) {
        addPage(i);
      }

      if (endPage < totalPages - 1) {
        addEllipsis('end');
      }

      // Siempre mostrar última página
      addPage(totalPages);
    }

    return (
      <div className="flex items-center justify-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!pagination.hasPrev || currentPage === 1}
          className="min-w-[2rem]"
        >
          &lt;
        </Button>
        {pages}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!pagination.hasNext || currentPage === totalPages}
          className="min-w-[2rem]"
        >
          &gt;
        </Button>
      </div>
    );
  };

  // Componente Skeleton para productos
  const ProductSkeleton = () => (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="aspect-square w-full animate-pulse bg-gray-100"></div>
      <div className="flex flex-grow flex-col bg-white p-4">
        {/* Badges skeleton */}
        <div className="mb-2 flex gap-1">
          <div className="h-5 w-16 animate-pulse rounded bg-gray-200"></div>
          <div className="h-5 w-20 animate-pulse rounded bg-gray-200"></div>
        </div>
        {/* Nombre skeleton */}
        <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>
        {/* SKU skeleton */}
        <div className="mb-1 h-3 w-1/2 animate-pulse rounded bg-gray-200"></div>
        {/* Aplicación skeleton */}
        <div className="mb-3 space-y-1">
          <div className="h-3 w-full animate-pulse rounded bg-gray-200"></div>
          <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200"></div>
        </div>
        {/* Botones skeleton */}
        <div className="mt-auto space-y-2">
          <div className="h-10 w-full animate-pulse rounded bg-gray-200"></div>
          <div className="h-10 w-full animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">
        Nuestros Productos
      </h1>

      {/* Banner de modo edición */}
      {isEditMode && (
        <Alert className="mb-6 border-2 border-green-300 bg-green-50">
          <Info className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-900">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="mb-1 font-semibold">
                  Editando orden #{editingOrderId?.slice(0, 8)}
                </p>
                <p className="text-sm">
                  Modifica los productos en el carrito y haz clic en{' '}
                  <strong>&quot;Actualizar Orden&quot;</strong> para guardar los
                  cambios.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                Cancelar edición
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="mx-auto max-w-xl">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar productos por nombre..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-12 pr-10 text-base"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {searchTerm.length > 0 && searchTerm.length < 3 && (
            <p className="mt-2 text-center text-sm text-gray-500">
              Ingresa al menos 3 caracteres para buscar
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <aside className="md:col-span-1">
          <ProductFilters
            availableCategories={uniqueCategories}
            currentCategory={currentCategoryFilter ?? undefined}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </aside>
        <main className="md:col-span-3">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600">
              Error: {error}
            </div>
          ) : isLoading ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            </>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-8">{renderPagination()}</div>
              )}
            </>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
              <p className="text-center text-gray-500">
                No se encontraron productos disponibles.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductosPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="bg-white pt-20">
        <Suspense
          fallback={
            <div className="container mx-auto p-8 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <span>Cargando página de productos...</span>
              </div>
            </div>
          }
        >
          <ProductsContent />
        </Suspense>
      </main>
      <Footer />
      <BackToHomeButton />
    </div>
  );
}
