'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Filter } from 'lucide-react';
import { useCart } from '@/features/cart/hooks/useCart';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export interface Faceta {
  value: string;
  count: number;
  label?: string;
}

interface Seccion {
  key: string;
  titulo: string;
  opciones: Faceta[];
}

interface ProductFiltersProps {
  secciones: Seccion[];
  activos: Record<string, string | null>;
  onChange: (key: string, value: string | null) => void;
  onClear: () => void;
  activeCount: number;
}

export default function ProductFilters({
  secciones,
  activos,
  onChange,
  onClear,
  activeCount,
}: ProductFiltersProps) {
  const { cart, itemCount, openCart } = useCart();

  const FilterContent = () => (
    <div className="space-y-3">
      {secciones
        .filter((s) => s.opciones.length > 0 || activos[s.key])
        .map((s) => (
          <div key={s.key}>
            <label htmlFor={`filtro-${s.key}`} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              {s.titulo}
            </label>
            <select
              id={`filtro-${s.key}`}
              value={activos[s.key] ?? ''}
              onChange={(e) => onChange(s.key, e.target.value || null)}
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                activos[s.key] ? 'border-green-500 bg-green-50 font-medium text-green-800' : 'border-gray-300 bg-white text-gray-700'
              }`}
            >
              <option value="">Todos</option>
              {s.opciones.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label ?? o.value} ({o.count})
                </option>
              ))}
            </select>
          </div>
        ))}
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClear} className="w-full text-xs text-gray-500 hover:text-gray-700">
          Limpiar filtros ({activeCount})
        </Button>
      )}
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
              {activeCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeCount} activos
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] overflow-y-auto sm:w-[400px]">
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
          {itemCount > 0 && <Badge variant="secondary">{itemCount} u.</Badge>}
        </div>

        {cart && cart.items.length > 0 ? (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              {cart.items.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-md border bg-gray-50 p-2">
                  <p className="line-clamp-1 text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-gray-500">
                    x {item.quantity}
                    {item.presentation && ` · ${item.presentation}`}
                  </p>
                </div>
              ))}
              {cart.items.length > 3 && (
                <p className="text-center text-xs text-gray-500">y {cart.items.length - 3} más</p>
              )}
            </div>
            <div className="space-y-2">
              <Button onClick={openCart} className="w-full" variant="outline">
                Ver Carrito
              </Button>
              <Link href="/checkout" className="block w-full">
                <Button className="w-full">Finalizar pedido</Button>
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
