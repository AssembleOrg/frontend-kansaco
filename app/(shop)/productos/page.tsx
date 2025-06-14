// app/(shop)/productos/page.tsx
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/features/products/components/ProductCard';
import ProductFilters from '@/features/products/components/client/ProductFilters';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackToHomeButton from '@/components/ui/BackToHomeButton';
import { useCart } from '@/features/cart/hooks/useCart';
import { Button } from '@/components/ui/button';
// import { ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentPage = Number(searchParams.get('page')) || 1;
  const currentCategoryFilter = searchParams.get('category');
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const { openCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedProducts = await getProducts(null);
        setProducts(fetchedProducts);

        const categories = Array.from(
          new Set(fetchedProducts.flatMap((p) => p.category ?? []))
        ).sort();
        setUniqueCategories(categories);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al cargar productos.'
        );
        setProducts([]);
        setUniqueCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  const filteredProducts = useMemo(() => {
    let result = products;
    
    // Filtrar por categoría
    if (currentCategoryFilter) {
      result = result.filter((p) =>
        p.category?.includes(currentCategoryFilter)
      );
    }

    // Filtrar por precio
    if (minPrice !== undefined || maxPrice !== undefined) {
      result = result.filter((p) => {
        const price = p.price ?? 0;
        
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
  }, [products, currentCategoryFilter, minPrice, maxPrice]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

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
          disabled={currentPage === 1}
          className="min-w-[2rem]"
        >
          &lt;
        </Button>
        {pages}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="min-w-[2rem]"
        >
          &gt;
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span>Cargando productos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">
        Nuestros Productos
      </h1>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <aside className="md:col-span-1">
          <Suspense fallback={
            <div className="flex items-center justify-center space-x-2 p-4">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <span>Cargando filtros...</span>
            </div>
          }>
            <ProductFilters
              availableCategories={uniqueCategories}
              currentCategory={currentCategoryFilter ?? undefined}
              minPrice={minPrice}
              maxPrice={maxPrice}
            />
          </Suspense>
        </aside>
        <main className="md:col-span-3">
          {filteredProducts.length > 0 ? (
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
