// app/(shop)/productos/page.tsx
'use client';

import { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts, getProductsPaginated } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/features/products/components/ProductCard';
import ProductFilters, { Faceta } from '@/features/products/components/client/ProductFilters';
import Footer from '@/components/landing/Footer';
import BackToHomeButton from '@/components/ui/BackToHomeButton';
import { useCart } from '@/features/cart/hooks/useCart';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useBultos } from '@/features/cart/hooks/useBultos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { pareceMenor20L, splitPresentations, tipoEnvase } from '@/lib/bultos';
import { Search, X } from 'lucide-react';

const ITEMS_PER_PAGE = 24;

type Filtro = 'category' | 'envase' | 'tamano';
type Orden = 'destacados' | 'az' | 'za';

const TAMANOS = { chico: 'Menos de 20 L (por bulto)', grande: '20 L o más' } as const;

const categoriasDe = (p: Product) =>
  p.categories && p.categories.length > 0 ? p.categories.map((c) => c.name) : p.category || [];

const envasesDe = (p: Product) =>
  [...new Set(splitPresentations(p.presentation).map(tipoEnvase).filter((e): e is string => !!e))];

const tamanosDe = (p: Product) => {
  const pres = splitPresentations(p.presentation);
  const t = new Set<keyof typeof TAMANOS>();
  for (const x of pres) t.add(pareceMenor20L(x) ? 'chico' : 'grande');
  return [...t];
};

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const { openCart } = useCart();

  const currentPage = Number(searchParams.get('page')) || 1;
  const filtros: Record<Filtro, string | null> = {
    category: searchParams.get('category'),
    envase: searchParams.get('envase'),
    tamano: searchParams.get('tamano'),
  };
  const searchQuery = searchParams.get('search') ?? '';
  const orden = (searchParams.get('orden') as Orden) || 'destacados';

  const setParams = (changes: Record<string, string | null>, keepPage = false) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    for (const [k, v] of Object.entries(changes)) {
      if (v) current.set(k, v);
      else current.delete(k);
    }
    if (!keepPage) current.delete('page');
    current.delete('openCart');
    const qs = current.toString();
    router.push(`${window.location.pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  // Sync searchTerm with URL parameter
  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  // Búsqueda instantánea (filtra en el navegador): solo se debouncea la URL.
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setParams({ search: value.trim() || null }), 300);
  };

  // ponytail: trae todo el catálogo visible (~150) y filtra en el navegador;
  // pasar a filtros del servidor si el catálogo supera ~1000 productos.
  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let all: Product[] = [];
        try {
          for (let page = 1; ; page++) {
            const res = await getProductsPaginated(token, { page, limit: 100, isVisible: true });
            all.push(...res.data);
            if (!res.hasNext) break;
          }
        } catch {
          // Fallback: endpoint sin paginar (con token para el precio del rol).
          all = (await getProducts(token)).filter((p) => p.isVisible);
        }
        if (!cancelled) setProducts(all);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar productos.');
          setProducts([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const bultos = useBultos(products.map((p) => p.id), products.length > 0);

  const openCartParam = searchParams.get('openCart');
  useEffect(() => {
    if (openCartParam === 'true') {
      openCart();
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('openCart');
      const newUrl = newSearchParams.toString() ? `?${newSearchParams.toString()}` : '/productos';
      router.replace(newUrl, { scroll: false });
    }
  }, [openCartParam, openCart, router, searchParams]);

  // ─── Filtrado ────────────────────────────────────────────────────

  const qn = searchTerm.trim().toLowerCase();
  const pasaBusqueda = (p: Product) =>
    !qn ||
    [p.name, p.sku, p.aplication, p.presentation, ...categoriasDe(p)]
      .filter(Boolean)
      .some((t) => String(t).toLowerCase().includes(qn));

  const valoresDe: Record<Filtro, (p: Product) => string[]> = {
    category: categoriasDe,
    envase: envasesDe,
    tamano: tamanosDe,
  };

  /** Pasa todos los filtros menos `excepto` (para contar opciones de esa faceta). */
  const pasa = (p: Product, excepto?: Filtro) =>
    pasaBusqueda(p) &&
    (Object.keys(filtros) as Filtro[]).every(
      (f) => f === excepto || !filtros[f] || valoresDe[f](p).includes(filtros[f]!)
    );

  const faceta = (f: Filtro, orden?: string[]): Faceta[] => {
    const counts = new Map<string, number>();
    for (const p of products) {
      if (!pasa(p, f)) continue;
      for (const v of valoresDe[f](p)) counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    const list = [...counts].map(([value, count]) => ({ value, count }));
    return orden
      ? list.sort((a, b) => orden.indexOf(a.value) - orden.indexOf(b.value))
      : list.sort((a, b) => a.value.localeCompare(b.value, 'es', { sensitivity: 'base' }));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filtered = useMemo(() => products.filter((p) => pasa(p)), [products, qn, filtros.category, filtros.envase, filtros.tamano]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) =>
        orden === 'za'
          ? b.name.localeCompare(a.name, 'es')
          : orden === 'az'
            ? a.name.localeCompare(b.name, 'es')
            : Number(b.isFeatured) - Number(a.isFeatured) || a.name.localeCompare(b.name, 'es')
      ),
    [filtered, orden]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const currentProducts = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handlePageChange = (n: number) => {
    setParams({ page: String(n) }, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const chipsActivos = [
    ...(searchQuery ? [{ key: 'search', label: `"${searchQuery}"` }] : []),
    ...(filtros.category ? [{ key: 'category', label: filtros.category }] : []),
    ...(filtros.envase ? [{ key: 'envase', label: filtros.envase }] : []),
    ...(filtros.tamano
      ? [{ key: 'tamano', label: TAMANOS[filtros.tamano as keyof typeof TAMANOS] ?? filtros.tamano }]
      : []),
  ];
  const limpiarTodo = () => {
    setSearchTerm('');
    setParams({ search: null, category: null, envase: null, tamano: null });
  };

  const renderPagination = () => {
    const pages: React.ReactElement[] = [];
    const maxVisiblePages = 4;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    const addPage = (n: number) =>
      pages.push(
        <Button
          key={n}
          variant={page === n ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(n)}
          className="min-w-[2rem]"
          aria-current={page === n ? 'page' : undefined}
        >
          {n}
        </Button>
      );
    const addEllipsis = (key: string) =>
      pages.push(
        <span key={key} className="px-2 text-gray-500">
          ...
        </span>
      );

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) addPage(i);
    } else {
      addPage(1);
      let startPage = Math.max(2, page - halfVisible);
      let endPage = Math.min(totalPages - 1, page + halfVisible);
      if (page <= halfVisible + 1) endPage = maxVisiblePages;
      else if (page >= totalPages - halfVisible) startPage = totalPages - maxVisiblePages + 1;
      if (startPage > 2) addEllipsis('start');
      for (let i = startPage; i <= endPage; i++) addPage(i);
      if (endPage < totalPages - 1) addEllipsis('end');
      addPage(totalPages);
    }

    return (
      <nav className="flex items-center justify-center gap-1" aria-label="Paginación">
        <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="min-w-[2rem]" aria-label="Anterior">
          &lt;
        </Button>
        {pages}
        <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="min-w-[2rem]" aria-label="Siguiente">
          &gt;
        </Button>
      </nav>
    );
  };

  const ProductSkeleton = () => (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="aspect-square w-full animate-pulse bg-gray-100"></div>
      <div className="flex flex-grow flex-col bg-white p-4">
        <div className="mb-2 flex gap-1">
          <div className="h-5 w-16 animate-pulse rounded bg-gray-200"></div>
          <div className="h-5 w-20 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>
        <div className="mb-1 h-3 w-1/2 animate-pulse rounded bg-gray-200"></div>
        <div className="mb-3 space-y-1">
          <div className="h-3 w-full animate-pulse rounded bg-gray-200"></div>
          <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="mt-auto space-y-2">
          <div className="h-10 w-full animate-pulse rounded bg-gray-200"></div>
          <div className="h-10 w-full animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">Nuestros Productos</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative mx-auto max-w-xl">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar por nombre, SKU, aplicación o envase…"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-12 pl-10 pr-10 text-base"
            aria-label="Buscar productos"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <aside className="md:col-span-1">
          <ProductFilters
            secciones={[
              { key: 'category', titulo: 'Categorías', opciones: faceta('category') },
              { key: 'envase', titulo: 'Tipo de envase', opciones: faceta('envase') },
              {
                key: 'tamano',
                titulo: 'Tamaño',
                opciones: faceta('tamano', Object.keys(TAMANOS)).map((o) => ({
                  ...o,
                  label: TAMANOS[o.value as keyof typeof TAMANOS],
                })),
              },
            ]}
            activos={filtros}
            onChange={(key, value) => setParams({ [key]: value })}
            onClear={limpiarTodo}
            activeCount={chipsActivos.length}
          />
        </aside>
        <main className="md:col-span-3">
          {/* Barra de resultados */}
          {!isLoading && !error && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <p className="mr-auto text-sm text-gray-600" aria-live="polite">
                <span className="font-semibold text-gray-900">{sorted.length}</span>{' '}
                {sorted.length === 1 ? 'producto' : 'productos'}
              </p>
              {chipsActivos.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => {
                    if (c.key === 'search') setSearchTerm('');
                    setParams({ [c.key]: null });
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-800 ring-1 ring-green-200 hover:bg-green-100"
                  aria-label={`Quitar filtro ${c.label}`}
                >
                  {c.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
              <select
                aria-label="Ordenar"
                value={orden}
                onChange={(e) => setParams({ orden: e.target.value === 'destacados' ? null : e.target.value }, true)}
                className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
              >
                <option value="destacados">Destacados primero</option>
                <option value="az">Nombre A–Z</option>
                <option value="za">Nombre Z–A</option>
              </select>
            </div>
          )}

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600">Error: {error}</div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          ) : currentProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} bultos={bultos[product.id]} />
                ))}
              </div>
              {totalPages > 1 && <div className="mt-8">{renderPagination()}</div>}
            </>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg bg-gray-50">
              <p className="text-center text-gray-500">No encontramos productos con esos filtros.</p>
              {chipsActivos.length > 0 && (
                <Button variant="outline" size="sm" onClick={limpiarTodo}>
                  Limpiar filtros
                </Button>
              )}
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
