// app/(shop)/productos/page.tsx
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts, getProductsPaginated } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/features/products/components/ProductCard';
import ProductFilters from '@/features/products/components/client/ProductFilters';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackToHomeButton from '@/components/ui/BackToHomeButton';
import { useCart } from '@/features/cart/hooks/useCart';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ALLOWED_PRODUCT_CATEGORIES } from '@/lib/constants';
// import { ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
  const { openCart } = useCart();
  
  const currentPage = Number(searchParams.get('page')) || 1;
  const currentCategoryFilter = searchParams.get('category');
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;

  // Usar categorías permitidas directamente (no necesitamos cargar del backend)
  const uniqueCategories = [...ALLOWED_PRODUCT_CATEGORIES];

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
        } = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          isVisible: true, // Solo productos visibles para usuarios comunes
        };

        // Aplicar filtro de categoría si existe
        if (currentCategoryFilter) {
          filters.category = [currentCategoryFilter];
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
          console.warn('Error using paginated endpoint, falling back to all products:', paginatedError);
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
  }, [currentPage, currentCategoryFilter, token]);

  const openCartParam = searchParams.get('openCart');
  
  useEffect(() => {
    const shouldOpenCart = openCartParam === 'true';
    
    if (shouldOpenCart) {
      openCart();
      
      // Limpiar el parámetro openCart de la URL después de usarlo
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('openCart');
      const newUrl = newSearchParams.toString() ? `?${newSearchParams.toString()}` : '/productos';
      router.replace(newUrl, { scroll: false });
    }
  }, [openCartParam, openCart, router, searchParams]);

  // Filtrar por precio (filtro local ya que el backend no lo soporta directamente)
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filtrar por precio (solo si hay filtros de precio)
    if (minPrice !== undefined || maxPrice !== undefined) {
      result = result.filter((p) => {
        const price = typeof p.price === 'string' ? parseFloat(p.price) : (p.price ?? 0);
        
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
          variant={currentPage === pageNum ? "default" : "outline"}
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
                <div className="mt-8">
                  {renderPagination()}
                </div>
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
