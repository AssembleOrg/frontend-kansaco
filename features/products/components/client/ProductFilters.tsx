// Reemplazar por Zustand
'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, ShoppingCart, AlertCircle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCart } from '@/features/cart/hooks/useCart';
import Link from 'next/link';

interface ProductFiltersProps {
  availableCategories: string[];
  currentCategory?: string;
}

// Constante para el mínimo de compra
const MINIMUM_PURCHASE = 400000;

export default function ProductFilters({
  availableCategories,
  currentCategory,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [priceRange] = useState<[number, number]>([10000, 100000]);
  const [currentPriceRange, setCurrentPriceRange] = useState<[number, number]>([
    10000, 100000,
  ]);

  // Usar el hook de carrito en lugar de valores hardcodeados
  const { cart, itemCount, subtotal, formatPrice, openCart, getProductPrice } =
    useCart();

  const percentageToMinimum = Math.min(
    (subtotal / MINIMUM_PURCHASE) * 100,
    100
  );

  const handleCategoryChange = (categoryName: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (categoryName) {
      current.set('category', categoryName);
    } else {
      current.delete('category');
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
  };

  const handlePriceRangeChange = (values: number[]) => {
    setCurrentPriceRange([values[0], values[1]]);
  };

  const applyPriceFilter = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('minPrice', currentPriceRange[0].toString());
    current.set('maxPrice', currentPriceRange[1].toString());

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
  };

  const sortedCategories = [...availableCategories].sort((a, b) =>
    a.localeCompare(b)
  );

  const triggerText = currentCategory ? currentCategory : 'Todas';

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="mb-3 border-b pb-2 text-lg font-semibold text-gray-800">
        Categorías
      </h3>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between bg-white text-gray-800 hover:bg-gray-50"
          >
            {triggerText}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[14rem]">
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => handleCategoryChange(null)}
            disabled={!currentCategory}
          >
            Todas
          </DropdownMenuItem>
          {sortedCategories.map((category) => (
            <DropdownMenuItem
              key={category}
              onSelect={() => handleCategoryChange(category)}
              disabled={currentCategory === category}
            >
              {category}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="mt-6">
        <h3 className="mb-3 border-b pb-2 text-lg font-semibold text-gray-800">
          Rango de Precio
        </h3>
        <div className="mb-4 mt-4">
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>{formatPrice(currentPriceRange[0])}</span>
            <span>{formatPrice(currentPriceRange[1])}</span>
          </div>
          <div className="px-2">
            <Slider
              defaultValue={[priceRange[0], priceRange[1]]}
              min={priceRange[0]}
              max={priceRange[1]}
              step={(priceRange[1] - priceRange[0]) / 100}
              value={[currentPriceRange[0], currentPriceRange[1]]}
              onValueChange={handlePriceRangeChange}
              className="mt-2"
            />
          </div>
        </div>
        <Button
          onClick={applyPriceFilter}
          className="w-full bg-green-600 text-white hover:bg-green-700"
        >
          Aplicar Filtro
        </Button>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 flex items-center border-b pb-2 text-lg font-semibold text-gray-800">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Carrito
          {itemCount > 0 && (
            <Badge className="ml-2 bg-green-600 text-white">{itemCount}</Badge>
          )}
        </h3>

        {cart && cart.items.length > 0 ? (
          <>
            <div className="mb-3 max-h-60 space-y-3 overflow-y-auto">
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
                  </div>
                </div>
              ))}

              {cart.items.length > 3 && (
                <Button
                  variant="ghost"
                  className="w-full text-xs text-gray-500"
                  onClick={openCart}
                >
                  Ver {cart.items.length - 3} productos más...
                </Button>
              )}
            </div>

            <div className="mt-3 rounded-md bg-gray-50 p-3">
              <div className="mb-2 flex justify-between">
                <span className="text-sm font-medium">Total:</span>
                <span className="text-sm font-bold text-green-600">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="mb-2">
                <Progress value={percentageToMinimum} className="h-2" />
              </div>

              {subtotal < MINIMUM_PURCHASE ? (
                <div className="flex items-start rounded-md bg-amber-50 p-2 text-xs text-amber-600">
                  <AlertCircle className="mr-1 mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>
                    Te faltan {formatPrice(MINIMUM_PURCHASE - subtotal)} para
                    alcanzar el mínimo de compra mayorista de{' '}
                    {formatPrice(MINIMUM_PURCHASE)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center rounded-md bg-green-50 p-2 text-xs text-green-600">
                  <span>¡Has alcanzado el mínimo de compra mayorista!</span>
                </div>
              )}
            </div>

            <div className="mt-3 space-y-2">
              <Button
                onClick={openCart}
                className="w-full bg-green-600 text-white hover:bg-green-700"
              >
                Ver Carrito Completo
              </Button>
              <Link href="/checkout" className="block w-full">
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                  Proceder al Pago
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <ShoppingCart className="mb-2 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">Tu carrito está vacío</p>
            <p className="mt-1 text-xs text-gray-400">
              Añade productos para verlos aquí
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
