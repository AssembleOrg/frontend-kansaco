'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts } from '@/lib/api';
import { Product } from '@/types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/features/auth/store/authStore';
import ProductCard from '@/features/products/components/ProductCard';
import ProductFilters from '@/features/products/components/client/ProductFilters';
// import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);

  const storeToken = useAuthStore((state) => state.token);
  const { token: hookToken } = useAuth();

  const searchParams = useSearchParams();
  const currentCategoryFilter = searchParams.get('category');

  // Efecto para esperar la hidratación del store
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      console.log('Auth store already hydrated on mount');
      setIsAuthReady(true);
      return;
    }

    // onFinishHydration
    const unsubscribeFinish = useAuthStore.persist.onFinishHydration(() => {
      console.log('Zustand Initial Hydration finished (onFinishHydration).');
      setIsAuthReady(true);
    });

    // timeout de seguridad
    const timeoutId = setTimeout(() => {
      if (!isAuthReady) {
        console.log('Hydration timeout reached, forcing auth ready');
        setIsAuthReady(true);
      }
    }, 2000); //

    // Limpieza al desmontar
    return () => {
      unsubscribeFinish();
      clearTimeout(timeoutId);
    };
  }, [isAuthReady]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!isAuthReady) {
        console.log('Waiting for auth store to be ready...');
        return;
      }

      console.log('Auth state:', {
        storeToken: storeToken ? 'present' : 'null',
        hookToken: hookToken ? 'present' : 'null',
        isAuthReady,
      });

      const tokenToUse = storeToken || hookToken;

      if (!tokenToUse) {
        console.log('Auth ready, but No token found. Setting error.');
        setError('Necesitas iniciar sesión para ver los productos.');
        setProducts([]);
        setUniqueCategories([]);
        setIsLoading(false);
        return;
      }

      console.log('Auth ready and token found, fetching products...');
      setIsLoading(true);
      setError(null);

      try {
        console.log('Attempting to fetch products with token:', tokenToUse);
        const fetchedProducts = await getProducts(tokenToUse);
        console.log('Fetched products inside useEffect:', fetchedProducts);
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
        console.log('Setting isLoading to false after fetch attempt.');
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [isAuthReady, storeToken, hookToken]);

  // Filtrado
  const filteredProducts = useMemo(() => {
    let result = products;
    if (currentCategoryFilter) {
      result = result.filter((p) =>
        p.category?.includes(currentCategoryFilter)
      );
    }
    // return result.filter((p) => p.isVisible);
    return result; // Muestra todos por ahora
  }, [products, currentCategoryFilter]);

  if (!isAuthReady || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Cargando productos...</p>
        {/* Información de depuración - REMOVER*/}
        <div className="mt-4 text-sm text-gray-500">
          <p>Estado: {isAuthReady ? 'Auth listo' : 'Esperando hidratación'}</p>
          <p>Store Token: {storeToken ? 'Disponible' : 'No disponible'}</p>
          <p>Hook Token: {hookToken ? 'Disponible' : 'No disponible'}</p>
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
          <ProductFilters
            availableCategories={uniqueCategories}
            currentCategory={currentCategoryFilter ?? undefined}
          />
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
