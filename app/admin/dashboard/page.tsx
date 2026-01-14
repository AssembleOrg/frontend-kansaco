'use client';

import Link from 'next/link';
import { ShoppingCart, Package, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Panel de Control</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Gestiona tu negocio desde aquí
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card: Órdenes */}
        <Link href="/admin/orders">
          <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-green-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="inline-flex rounded-lg bg-green-50 p-3">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">
                  Gestionar Órdenes
                </h2>
                <p className="mt-2 text-gray-600">
                  Ver y gestionar los pedidos de los clientes. Aquí aparecerán los carritos finalizados por los usuarios.
                </p>
                <Button
                  asChild
                  className="mt-4 bg-green-600 hover:bg-green-700"
                >
                  <span>Ir a Órdenes →</span>
                </Button>
              </div>
              <div className="absolute right-0 top-0 h-32 w-32 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShoppingCart className="h-full w-full" />
              </div>
            </div>
          </div>
        </Link>

        {/* Card: Productos */}
        <Link href="/admin/products">
          <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-green-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="inline-flex rounded-lg bg-green-50 p-3">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">
                  Gestionar Productos
                </h2>
                <p className="mt-2 text-gray-600">
                  Crea, edita y elimina productos. Actualiza precios en masa mediante archivos CSV/XLSX.
                </p>
                <Button
                  asChild
                  className="mt-4 bg-green-600 hover:bg-green-700"
                >
                  <span>Ir a Productos →</span>
                </Button>
              </div>
              <div className="absolute right-0 top-0 h-32 w-32 opacity-5 group-hover:opacity-10 transition-opacity">
                <Package className="h-full w-full" />
              </div>
            </div>
          </div>
        </Link>

        {/* Card: Categorías */}
        <Link href="/admin/categories">
          <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-green-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="inline-flex rounded-lg bg-green-50 p-3">
                  <Tag className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">
                  Gestionar Categorías
                </h2>
                <p className="mt-2 text-gray-600">
                  Crea, edita y elimina categorías de productos. Organiza tu catálogo de manera eficiente.
                </p>
                <Button
                  asChild
                  className="mt-4 bg-green-600 hover:bg-green-700"
                >
                  <span>Ir a Categorías →</span>
                </Button>
              </div>
              <div className="absolute right-0 top-0 h-32 w-32 opacity-5 group-hover:opacity-10 transition-opacity">
                <Tag className="h-full w-full" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
} 