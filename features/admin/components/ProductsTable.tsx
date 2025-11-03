'use client';

import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Edit, Search, Plus, Percent, ArrowUpDown } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
  onCreate: () => void;
  onSelectionChange?: (selectedIds: number[]) => void;
  onBulkUpdateClick?: () => void;
  onCategoryChange?: (category: string) => void;
}

export default function ProductsTable({
  products,
  isLoading,
  onEdit,
  onDelete,
  onCreate,
  onSelectionChange,
  onBulkUpdateClick,
  onCategoryChange,
}: ProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.slug.toLowerCase().includes(searchLower);

      const matchesCategory =
        selectedCategory === 'all' ||
        product.category.includes(selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleDelete = (productId: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      onDelete(productId);
    }
  };

  const handleSelectProduct = (productId: number) => {
    const updated = selectedProducts.includes(productId)
      ? selectedProducts.filter((id) => id !== productId)
      : [...selectedProducts, productId];
    setSelectedProducts(updated);
    onSelectionChange?.(updated);
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
      onSelectionChange?.([]);
    } else {
      const allIds = filteredProducts.map((p) => p.id);
      setSelectedProducts(allIds);
      onSelectionChange?.(allIds);
    }
  };

  // Definir columnas para TanStack
  const columns = useMemo<ColumnDef<Product>[]>(() => [
    {
      id: 'select',
      header: () => (
        <Checkbox
          checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
          onCheckedChange={handleSelectAll}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedProducts.includes(row.original.id)}
          onCheckedChange={() => handleSelectProduct(row.original.id)}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'imageUrl',
      header: 'Imagen',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
          {row.original.imageUrl ? (
            <Image
              src={row.original.imageUrl}
              alt={row.original.name}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              -
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Nombre',
      enableSorting: true,
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {row.original.name}
          </p>
          <p className="text-xs text-gray-500">{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      enableSorting: true,
      cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.sku}</span>,
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs sm:text-sm">
          <span
            className={
              row.original.stock < 10
                ? 'font-medium text-red-600'
                : 'text-gray-700'
            }
          >
            {row.original.stock}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Precio',
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-right text-sm font-semibold text-green-600">
          {formatPrice(row.original.price ?? 0)}
        </span>
      ),
    },
    {
      accessorKey: 'isVisible',
      header: 'Visible',
      enableSorting: true,
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            row.original.isVisible
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.original.isVisible ? 'Sí' : 'No'}
        </span>
      ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            onClick={() => onEdit(row.original)}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          <Button
            onClick={() => handleDelete(row.original.id)}
            variant="outline"
            size="sm"
            className="gap-1 border-red-200 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], [selectedProducts, filteredProducts]);

  // TanStack Table instance
  const table = useReactTable({
    data: filteredProducts,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Helper para generar texto de selección con categoría
  const getSelectionText = (count: number) => {
    const productText = count === 1 ? 'producto seleccionado' : 'productos seleccionados';
    const categoryText = selectedCategory !== 'all' ? ` de ${selectedCategory}` : '';
    return `${count} ${productText}${categoryText}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Búsqueda, Categoría y Acciones */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, SKU o slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            onCategoryChange?.(e.target.value);
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none"
        >
          <option value="all">Todas las categorías</option>
          <option value="Motos">Motos</option>
          <option value="Industrial">Industrial</option>
          <option value="Grasas">Grasas</option>
          <option value="Derivados y Aditivos">Derivados y Aditivos</option>
        </select>
        <Button
          onClick={onCreate}
          className="bg-green-600 hover:bg-green-700 gap-2 whitespace-nowrap text-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Crear nuevo...</span>
        </Button>
      </div>

      {/* Selection Toolbar - Mobile Select All */}
      <div className="xl:hidden space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="flex-1 text-xs"
          >
            {selectedProducts.length === filteredProducts.length && filteredProducts.length > 0
              ? 'Desseleccionar todos'
              : 'Seleccionar todos'}
          </Button>
          {selectedProducts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedProducts([]);
                onSelectionChange?.([]);
              }}
              className="text-xs"
            >
              Limpiar
            </Button>
          )}
        </div>

        {/* Bulk Update Toolbar - Mobile Only */}
        {selectedProducts.length > 0 && (
          <div className="rounded-lg bg-orange-50 border border-orange-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">
                {getSelectionText(selectedProducts.length)}
              </span>
            </div>
            <button
              onClick={onBulkUpdateClick}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap w-full sm:w-auto text-center"
            >
              Actualizar Precios
            </button>
          </div>
        )}
      </div>

      {/* Selection Toolbar */}
      {selectedProducts.length > 0 && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {getSelectionText(selectedProducts.length)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedProducts([]);
              onSelectionChange?.([]);
            }}
          >
            Limpiar
          </Button>
        </div>
      )}

      {/* Contenido - Tabla Desktop / Cards Mobile */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 sm:p-12 text-center">
          <p className="text-sm sm:text-base text-gray-500">
            {products.length === 0
              ? 'No hay productos. Crea el primero.'
              : 'No se encontraron productos.'}
          </p>
        </div>
      ) : (
        <>
          {/* Tabla Desktop - TanStack Table */}
          <div className="hidden xl:block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        const isSortable = header.column.columnDef.enableSorting !== false;
                        return (
                          <th
                            key={header.id}
                            onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                            className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 ${
                              isSortable ? 'cursor-pointer hover:bg-gray-100' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {isSortable && header.column.getCanSort() && (
                                <div className="flex items-center">
                                  {header.column.getIsSorted() === 'asc' && (
                                    <ArrowUpDown className="h-4 w-4 rotate-180 text-orange-600" />
                                  )}
                                  {header.column.getIsSorted() === 'desc' && (
                                    <ArrowUpDown className="h-4 w-4 text-orange-600" />
                                  )}
                                  {!header.column.getIsSorted() && (
                                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards Mobile */}
          <div className="xl:hidden space-y-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-lg border border-gray-200 bg-white p-4 space-y-3"
              >
                {/* Encabezado con checkbox */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => handleSelectProduct(product.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500">{product.slug}</p>
                  </div>
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        -
                      </div>
                    )}
                  </div>
                </div>

                {/* Detalles */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">SKU</p>
                    <p className="font-medium text-gray-900">{product.sku}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Stock</p>
                    <p
                      className={`font-medium ${
                        product.stock < 10 ? 'text-red-600' : 'text-gray-900'
                      }`}
                    >
                      {product.stock}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Precio</p>
                    <p className="font-medium text-green-600">
                      {formatPrice(product.price ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Visible</p>
                    <p className="font-medium text-gray-900">
                      {product.isVisible ? '✓ Sí' : '✗ No'}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => onEdit(product)}
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(product.id)}
                    variant="outline"
                    size="sm"
                    className="gap-1 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
