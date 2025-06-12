// app/(shop)/productos/page.tsx
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/features/products/components/ProductCard';
import ProductFilters from '@/features/products/components/client/ProductFilters';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackToHomeButton from '@/components/ui/BackToHomeButton';

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const currentCategoryFilter = searchParams.get('category');

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Productos no requieren token - son públicos
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

  const filteredProducts = useMemo(() => {
    let result = products;
    if (currentCategoryFilter) {
      result = result.filter((p) =>
        p.category?.includes(currentCategoryFilter)
      );
    }
    return result;
  }, [products, currentCategoryFilter]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Cargando productos...</p>
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
          <Suspense fallback={<div>Cargando filtros...</div>}>
            <ProductFilters
              availableCategories={uniqueCategories}
              currentCategory={currentCategoryFilter ?? undefined}
            />
          </Suspense>
        </aside>
        <main className="md:col-span-3">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
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
              Cargando página de productos...
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
