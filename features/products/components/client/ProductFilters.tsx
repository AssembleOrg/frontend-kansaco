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

interface ProductFiltersProps {
  availableCategories: string[];
  currentCategory?: string;
}

// Función para formatear precio en pesos argentinos
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

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

  const cartTotal = 99999; // Simulación de total del carrito
  const percentageToMinimum = Math.min(
    (cartTotal / MINIMUM_PURCHASE) * 100,
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
        <div className="mt-4 mb-4">
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
          <Badge className="ml-2 bg-green-600 text-white">2</Badge>
        </h3>

        <div className="mb-3 max-h-60 space-y-3 overflow-y-auto">
          <div className="flex items-center justify-between rounded-md border bg-gray-50 p-2">
            <div className="flex-1">
              <p className="text-sm font-medium">SAVIA K 5W 40 SINTETICO</p>
              <p className="text-xs text-gray-500">{formatPrice(49999)} x 2</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border bg-gray-50 p-2">
            <div className="flex-1">
              <p className="text-sm font-medium">SAVIA J 10W 40 SINTETICO</p>
              <p className="text-xs text-gray-500">{formatPrice(49999)} x 3</p>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-md bg-gray-50 p-3">
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-medium">Total:</span>
            <span className="text-sm font-bold text-green-600">
              {formatPrice(cartTotal)}
            </span>
          </div>

          <div className="mb-2">
            <Progress value={percentageToMinimum} className="h-2" />
          </div>

          {cartTotal < MINIMUM_PURCHASE ? (
            <div className="flex items-start rounded-md bg-amber-50 p-2 text-xs text-amber-600">
              <AlertCircle className="mt-0.5 mr-1 h-4 w-4 flex-shrink-0" />
              <span>
                Te faltan {formatPrice(MINIMUM_PURCHASE - cartTotal)} para
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

        <Button className="mt-3 w-full bg-green-600 text-white hover:bg-green-700">
          Proceder al Pago (Codear carrito)
        </Button>
      </div>
    </div>
  );
}
