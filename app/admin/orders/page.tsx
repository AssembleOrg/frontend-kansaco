'use client';

import { useState, useMemo, useCallback } from 'react';
import { useOrders } from '@/features/admin/hooks/useOrders';
import { Order, OrderStatus } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Eye, Search, ArrowUpDown, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
// import { formatPrice } from '@/lib/utils';
import { formatDateForDisplay } from '@/lib/dateUtils';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  PaginationState,
  useReactTable,
} from '@tanstack/react-table';

// Colores y labels para estados
const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  PENDIENTE: { label: 'Pendiente', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  PROCESANDO: { label: 'Procesando', color: 'text-blue-700', bg: 'bg-blue-100' },
  ENVIADO: { label: 'Enviado', color: 'text-purple-700', bg: 'bg-purple-100' },
  COMPLETADO: { label: 'Completado', color: 'text-green-700', bg: 'bg-green-100' },
  CANCELADO: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-100' },
};

export default function OrdersPage() {
  const { orders, isLoading, error, deleteOrder, updateStatus, refresh } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  // Filtrar órdenes por búsqueda
  const filteredOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    return orders.filter((order) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.contactInfo?.fullName?.toLowerCase().includes(searchLower) ||
        order.contactInfo?.email?.toLowerCase().includes(searchLower) ||
        order.contactInfo?.phone?.includes(searchTerm) ||
        order.id.toLowerCase().includes(searchLower)
      );
    });
  }, [orders, searchTerm]);

  const handleDelete = useCallback(async (orderId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta orden?')) {
      try {
        await deleteOrder(orderId);
      } catch {
        alert('Error al eliminar la orden');
      }
    }
  }, [deleteOrder]);

  const handleStatusChange = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateStatus(orderId, newStatus);
    } catch {
      alert('Error al actualizar el estado');
    }
  }, [updateStatus]);

  // Definir columnas para TanStack
  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        id: 'cliente',
        header: 'Cliente',
        accessorFn: (order) => order.contactInfo?.fullName || 'N/A',
        cell: ({ row }) => {
          const order = row.original;
          const isMayorista = order.customerType === 'CLIENTE_MAYORISTA';
          return (
            <div>
              {order.contactInfo?.fullName || 'N/A'}
              {isMayorista && (
                <span className="ml-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                  Mayorista
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: 'email',
        header: 'Email',
        accessorFn: (order) => order.contactInfo?.email || 'N/A',
        cell: ({ row }) => {
          const email = row.original.contactInfo?.email;
          if (!email) return <span className="text-sm text-gray-400">N/A</span>;
          return (
            <a
              href={`mailto:${email}`}
              className="text-sm text-green-600 hover:underline"
            >
              {email}
            </a>
          );
        },
      },
      {
        id: 'phone',
        header: 'Teléfono',
        accessorFn: (order) => order.contactInfo?.phone || 'N/A',
        cell: ({ row }) => {
          const phone = row.original.contactInfo?.phone;
          if (!phone) return <span className="text-sm text-gray-400">N/A</span>;
          return (
            <a
              href={`tel:${phone}`}
              className="text-sm text-green-600 hover:underline"
            >
              {phone}
            </a>
          );
        },
      },
      {
        id: 'items',
        header: 'Items',
        accessorFn: (order) => order.items?.length || 0,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.items?.length || 0}</span>
        ),
      },
      /*
      {
        id: 'total',
        header: 'Total',
        accessorFn: (order) => order.totalAmount || 0,
        cell: ({ row }) => {
          const totalAmount = row.original.totalAmount;
          if (!totalAmount) return <span className="text-right text-sm font-semibold text-green-600">Consultar</span>;
          const numAmount = typeof totalAmount === 'string' ? parseFloat(totalAmount) : totalAmount;
          return (
            <span className="text-right text-sm font-semibold text-green-600">
              {formatPrice(isNaN(numAmount) ? 0 : numAmount)}
            </span>
          );
        },
      },
      */
      {
        id: 'status',
        header: 'Estado',
        accessorFn: (order) => order.status,
        cell: ({ row }) => {
          const order = row.original;
          const config = statusConfig[order.status];
          return (
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
              className={`rounded-full px-2 py-1 text-xs font-medium ${config.bg} ${config.color} border-0 cursor-pointer`}
            >
              {Object.entries(statusConfig).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          );
        },
      },
      {
        id: 'fecha',
        header: 'Fecha',
        accessorFn: (order) => new Date(order.createdAt).getTime(),
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {formatDateForDisplay(row.original.createdAt, 'short')}
          </span>
        ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={() => setSelectedOrder(order)}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <Eye className="h-4 w-4" />
                Ver
              </Button>
              <Button
                onClick={() => handleDelete(order.id)}
                variant="outline"
                size="sm"
                className="gap-1 border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [handleDelete, handleStatusChange]
  );

  // TanStack Table instance
  const table = useReactTable({
    data: filteredOrders,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Cargando órdenes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestionar Órdenes</h1>
          <p className="mt-2 text-gray-600">
            Aquí verás todos los pedidos que los clientes han completado en el checkout.
          </p>
        </div>
        <Button onClick={refresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar por nombre, email, teléfono o ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabla de Órdenes */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center sm:p-12">
          <p className="text-sm text-gray-500 sm:text-base">
            {orders.length === 0
              ? 'No hay órdenes aún. Cuando los clientes completen su compra aparecerán aquí.'
              : 'No se encontraron órdenes que coincidan con tu búsqueda.'}
          </p>
        </div>
      ) : (
        <>
          {/* Tabla Desktop */}
          <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm xl:block">
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
                            className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 ${
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
                        <td key={cell.id} className="px-6 py-4">
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
          <div className="space-y-3 xl:hidden">
            {filteredOrders.map((order) => {
              const isMayorista = order.customerType === 'CLIENTE_MAYORISTA';
              const config = statusConfig[order.status];

              return (
                <div
                  key={order.id}
                  className="space-y-3 rounded-lg border border-gray-200 bg-white p-4"
                >
                  {/* Cliente */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-gray-900">
                        {order.contactInfo?.fullName || 'N/A'}
                      </h3>
                      {isMayorista && (
                        <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          Mayorista
                        </span>
                      )}
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>

                  {/* Detalles */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="truncate font-medium text-green-600">
                        {order.contactInfo?.email ? (
                          <a href={`mailto:${order.contactInfo.email}`}>
                            {order.contactInfo.email.split('@')[0]}...
                          </a>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Teléfono</p>
                      <p className="font-medium text-gray-900">
                        {order.contactInfo?.phone ? (
                          <a href={`tel:${order.contactInfo.phone}`}>{order.contactInfo.phone}</a>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Items</p>
                      <p className="font-medium text-gray-900">
                        {order.items?.length || 0} producto{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fecha</p>
                      <p className="font-medium text-gray-900">
                        {formatDateForDisplay(order.createdAt, 'short')}
                      </p>
                    </div>
                  </div>

                  {/* Total */}
                  {/*
                  {order.totalAmount && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-2">
                      <p className="text-xs font-medium text-green-600">Total</p>
                      <p className="text-lg font-bold text-green-700">
                        {order.totalAmount ? (() => {
                          const numAmount = typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount;
                          return formatPrice(isNaN(numAmount) ? 0 : numAmount);
                        })() : 'Consultar'}
                      </p>
                    </div>
                  )}
                  */}

                  {/* Cambiar estado */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cambiar estado:</p>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    >
                      {Object.entries(statusConfig).map(([value, { label }]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => setSelectedOrder(order)}
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </Button>
                    <Button
                      onClick={() => handleDelete(order.id)}
                      variant="outline"
                      size="sm"
                      className="gap-1 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Controles de Paginación */}
      {filteredOrders.length > 20 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4 rounded-b-lg">
          <div className="text-sm text-gray-700">
            Mostrando{' '}
            <span className="font-medium">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>{' '}
            a{' '}
            <span className="font-medium">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                filteredOrders.length
              )}
            </span>{' '}
            de{' '}
            <span className="font-medium">{filteredOrders.length}</span> pedidos
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              variant="outline"
              size="sm"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal - Detalle de Orden */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Detalle de Orden</h2>
                <p className="text-sm text-gray-500">ID: {selectedOrder.id.slice(0, 8)}...</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6 p-6">
              {/* Estado */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Estado:</span>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusConfig[selectedOrder.status].bg} ${statusConfig[selectedOrder.status].color}`}>
                  {statusConfig[selectedOrder.status].label}
                </span>
              </div>

              {/* Tipo de cliente */}
              <div className={`p-3 rounded-lg ${
                selectedOrder.customerType === 'CLIENTE_MAYORISTA'
                  ? 'bg-amber-50 border border-amber-200'
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <span className={`text-sm font-medium ${
                  selectedOrder.customerType === 'CLIENTE_MAYORISTA'
                    ? 'text-amber-800'
                    : 'text-blue-800'
                }`}>
                  {selectedOrder.customerType === 'CLIENTE_MAYORISTA' ? 'Cliente Mayorista' : 'Cliente Minorista'}
                </span>
              </div>

              {/* Información del Cliente */}
              <div>
                <h3 className="text-sm font-semibold uppercase text-gray-500">
                  Información del Cliente
                </h3>
                <div className="mt-4 space-y-2">
                  <p><span className="font-medium text-gray-700">Nombre:</span> {selectedOrder.contactInfo?.fullName || 'N/A'}</p>
                  <p>
                    <span className="font-medium text-gray-700">Email:</span>{' '}
                    {selectedOrder.contactInfo?.email ? (
                      <a href={`mailto:${selectedOrder.contactInfo.email}`} className="text-green-600 hover:underline">
                        {selectedOrder.contactInfo.email}
                      </a>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Teléfono:</span>{' '}
                    {selectedOrder.contactInfo?.phone ? (
                      <a href={`tel:${selectedOrder.contactInfo.phone}`} className="text-green-600 hover:underline">
                        {selectedOrder.contactInfo.phone}
                      </a>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </p>
                  <p><span className="font-medium text-gray-700">Dirección:</span> {selectedOrder.contactInfo?.address || 'N/A'}</p>
                </div>
              </div>

              {/* Datos fiscales (mayoristas) */}
              {selectedOrder.businessInfo && (
                <>
                  <hr className="border-gray-200" />
                  <div>
                    <h3 className="text-sm font-semibold uppercase text-gray-500">
                      Datos Fiscales
                    </h3>
                    <div className="mt-4 space-y-2">
                      <p><span className="font-medium text-gray-700">CUIT:</span> {selectedOrder.businessInfo.cuit}</p>
                      <p><span className="font-medium text-gray-700">Situación AFIP:</span> {selectedOrder.businessInfo.situacionAfip}</p>
                      {selectedOrder.businessInfo.razonSocial && (
                        <p><span className="font-medium text-gray-700">Razón Social:</span> {selectedOrder.businessInfo.razonSocial}</p>
                      )}
                      {selectedOrder.businessInfo.codigoPostal && (
                        <p><span className="font-medium text-gray-700">Código Postal:</span> {selectedOrder.businessInfo.codigoPostal}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              <hr className="border-gray-200" />

              {/* Productos */}
              <div>
                <h3 className="text-sm font-semibold uppercase text-gray-500">
                  Productos
                </h3>
                <div className="mt-4 space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          Cantidad: {item.quantity}
                          {/* {item.unitPrice && ` @ ${formatPrice(item.unitPrice)}`} */}
                        </p>
                      </div>
                      {/*
                      {item.unitPrice && (
                        <p className="font-semibold text-gray-900">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </p>
                      )}
                      */}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notas */}
              {selectedOrder.notes && (
                <>
                  <hr className="border-gray-200" />
                  <div>
                    <h3 className="text-sm font-semibold uppercase text-gray-500">Notas</h3>
                    <p className="mt-2 text-sm text-gray-600">{selectedOrder.notes}</p>
                  </div>
                </>
              )}

              {/* Total y fechas */}
              <hr className="border-gray-200" />
              <div className="space-y-2">
                {/*
                {selectedOrder.totalAmount && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-green-600">
                      {(() => {
                        const numAmount = typeof selectedOrder.totalAmount === 'string'
                          ? parseFloat(selectedOrder.totalAmount)
                          : selectedOrder.totalAmount;
                        return formatPrice(isNaN(numAmount) ? 0 : numAmount);
                      })()}
                    </span>
                  </div>
                )}
                */}
                <div className="text-sm text-gray-500">
                  <p>Creada: {formatDateForDisplay(selectedOrder.createdAt, 'datetime')}</p>
                  <p>Actualizada: {formatDateForDisplay(selectedOrder.updatedAt, 'datetime')}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <Button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
