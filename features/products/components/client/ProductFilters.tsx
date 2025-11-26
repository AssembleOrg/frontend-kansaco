'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Filter, X } from 'lucide-react';
import { useCart } from '@/features/cart/hooks/useCart';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { ALLOWED_PRODUCT_CATEGORIES } from '@/lib/constants';

interface ProductFiltersProps {
  availableCategories: string[];
  currentCategory?: string;
  minPrice?: number;
  maxPrice?: number;
}

const PRICE_RANGES = [
  { label: 'Hasta $10.000', min: 0, max: 10000 },
  { label: '$10.000 a $30.000', min: 10000, max: 30000 },
  { label: 'Más de $30.000', min: 30000, max: undefined },
];

export default function ProductFilters({
  availableCategories,
  currentCategory,
  minPrice: initialMinPrice,
  maxPrice: initialMaxPrice,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cart, itemCount, subtotal, formatPrice, openCart, getProductPrice } =
    useCart();

  const [customMinPrice, setCustomMinPrice] = useState<string>('');
  const [customMaxPrice, setCustomMaxPrice] = useState<string>('');

  useEffect(() => {
    setCustomMinPrice(initialMinPrice?.toString() ?? '');
    setCustomMaxPrice(initialMaxPrice?.toString() ?? '');
  }, [initialMinPrice, initialMaxPrice]);

  const handleCategoryChange = (categoryName: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (categoryName) {
      current.set('category', categoryName);
    } else {
      current.delete('category');
    }
    current.delete('page');
    current.delete('openCart'); // Eliminar openCart al cambiar filtros

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
  };

  const handlePriceRangeSelect = (min: number, max: number | undefined) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    // Limpiar filtros de precio existentes
    current.delete('minPrice');
    current.delete('maxPrice');

    // Aplicar nuevos filtros
    if (min !== undefined) {
      current.set('minPrice', min.toString());
    }
    if (max !== undefined) {
      current.set('maxPrice', max.toString());
    }

    current.delete('page');
    current.delete('openCart'); // Eliminar openCart al cambiar filtros

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
  };

  const applyCustomPriceFilter = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    // Limpiar filtros de precio existentes
    current.delete('minPrice');
    current.delete('maxPrice');

    // Aplicar nuevos filtros solo si tienen valor
    const minPriceValue = customMinPrice.trim();
    const maxPriceValue = customMaxPrice.trim();

    if (minPriceValue) {
      current.set('minPrice', minPriceValue);
    }
    if (maxPriceValue) {
      current.set('maxPrice', maxPriceValue);
    }

    current.delete('page');
    current.delete('openCart'); // Eliminar openCart al cambiar filtros

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
  };

  const clearFilters = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete('category');
    current.delete('minPrice');
    current.delete('maxPrice');
    current.delete('page');
    current.delete('openCart'); // Eliminar openCart al limpiar filtros

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
  };

  // Filtrar y ordenar solo las categorías permitidas que estén disponibles
  const sortedCategories = [...availableCategories]
    .filter((cat): cat is (typeof ALLOWED_PRODUCT_CATEGORIES)[number] =>
      ALLOWED_PRODUCT_CATEGORIES.includes(
        cat as (typeof ALLOWED_PRODUCT_CATEGORIES)[number]
      )
    )
    .sort((a, b) => {
      // Ordenar según el orden de ALLOWED_PRODUCT_CATEGORIES
      const indexA = ALLOWED_PRODUCT_CATEGORIES.indexOf(a);
      const indexB = ALLOWED_PRODUCT_CATEGORIES.indexOf(b);
      return indexA - indexB;
    });

  const hasActiveFilters =
    currentCategory || initialMinPrice || initialMaxPrice;

  const isPriceRangeActive = (min: number, max: number | undefined) => {
    if (max === undefined) {
      return initialMinPrice === min && !initialMaxPrice;
    }
    return initialMinPrice === min && initialMaxPrice === max;
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Categorías</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
        <div className="space-y-2">
          <Button
            variant={!currentCategory ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => handleCategoryChange(null)}
          >
            Todas
          </Button>
          {sortedCategories.map((category) => (
            <Button
              key={category}
              variant={currentCategory === category ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* <div>
        <h3 className="mb-2 text-sm font-medium text-gray-900">Precio</h3>
        <div className="space-y-3">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Filtros de precio temporalmente deshabilitados
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    hay que corregir la base de datos. Faltan Precios, Imagenes y ver como handlear las aplicaciones de cada producto (500ml, 3L, 20L barril, etc.)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Filtros Móviles */}
      <div className="flex items-center justify-between md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {currentCategory || 'Filtros activos'}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Filtros Desktop */}
      <div className="hidden md:block">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <FilterContent />
        </div>
      </div>

      {/* Carrito Resumen */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Carrito</h3>
          {itemCount > 0 && (
            <Badge variant="secondary">{itemCount} items</Badge>
          )}
        </div>

        {cart && cart.items.length > 0 ? (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              {cart.items.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md border bg-gray-50 p-2"
                >
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm font-medium">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatPrice(getProductPrice(item.product))} x{' '}
                      {item.quantity}
                    </p>
                    {item.presentation && (
                      <p className="mt-0.5 text-xs font-medium text-gray-600">
                        {item.presentation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* <div className="border-t pt-4">
              <div className="mb-2 flex justify-between text-sm">
                <span>Total:</span>
                <span className="font-medium text-green-600">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </div> */}

            <div className="space-y-2">
              <Button onClick={openCart} className="w-full" variant="outline">
                Ver Carrito
              </Button>
              <Link href="/checkout" className="block w-full">
                <Button className="w-full">Proceder al Pago</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center justify-center py-6 text-center">
            <ShoppingCart className="mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">Carrito vacío</p>
          </div>
        )}
      </div>
    </div>
  );
}
