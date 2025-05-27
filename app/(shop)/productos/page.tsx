// app/(shop)/productos/page.tsx
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts } from '@/lib/api';
import { Product } from '@/types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/features/auth/store/authStore';
import ProductCard from '@/features/products/components/ProductCard';
import ProductFilters from '@/features/products/components/client/ProductFilters';

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);

  const storeToken = useAuthStore((state) => state.token);
  const { token: hookToken } = useAuth();
  const searchParams = useSearchParams();
  const currentCategoryFilter = searchParams.get('category');

  // Efecto para esperar la hidratación del store de autenticación
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setIsAuthReady(true);
      return;
    }
    const unsubscribeFinish = useAuthStore.persist.onFinishHydration(() => {
      setIsAuthReady(true);
    });
    const timeoutId = setTimeout(() => {
      if (!useAuthStore.persist.hasHydrated()) {
        console.warn(
          'Auth store hydration timeout in ProductsContent. Forcing isAuthReady to true.'
        );
        setIsAuthReady(true);
      }
    }, 2000);
    return () => {
      unsubscribeFinish();
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!isAuthReady) {
        return;
      }
      const tokenToUse = storeToken || hookToken;

      setIsLoading(true);
      setError(null);

      try {
        const fetchedProducts = await getProducts(tokenToUse);
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
  }, [isAuthReady, storeToken, hookToken]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (currentCategoryFilter) {
      result = result.filter((p) =>
        p.category?.includes(currentCategoryFilter)
      );
    }
    return result;
  }, [products, currentCategoryFilter]);

  if (!isAuthReady || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Cargando productos...</p>
        <div className="mt-4 text-sm text-gray-500">
          <p>Estado: {isAuthReady ? 'Auth listo' : 'Esperando hidratación'}</p>
          <p>Token: {storeToken ? 'Disponible' : 'No disponible'}</p>
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
        {' '}
        Nuestros Productos{' '}
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
    <Suspense
      fallback={
        <div className="container mx-auto p-8 text-center">
          Cargando página de productos...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
