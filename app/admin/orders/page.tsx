'use client';

import { useState, useMemo } from 'react';
import { useOrders } from '@/features/admin/hooks/useOrders';
import OrderDetailModal from '@/features/admin/components/OrderDetailModal';
import { PDFDownloadButton } from '@/features/admin/components/PDFPresupuesto';
import { MOCK_ORDERS, MockOrder } from '@/features/admin/utils/mockOrders';
import { Order } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Eye, Search, ArrowUpDown } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

// Tipo unificado para órdenes (real y mock)
type UnifiedOrder = Order | MockOrder;

export default function OrdersPage() {
  const { orders, isLoading, deleteOrder } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedMockOrder, setSelectedMockOrder] = useState<MockOrder | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  // Combinar órdenes reales (del checkout) con mock orders
  const allOrders = useMemo(() => [...MOCK_ORDERS, ...orders], [orders]);

  // Filtrar órdenes por búsqueda
  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const searchLower = searchTerm.toLowerCase();
      const clientName =
        'clientName' in order ? order.clientName : order.contactInfo.fullName;
      const clientEmail =
        'clientEmail' in order ? order.clientEmail : order.contactInfo.email;
      const clientPhone =
        'clientPhone' in order ? order.clientPhone : order.contactInfo.phone;
      const orderId = order.id;

      return (
        clientName.toLowerCase().includes(searchLower) ||
        clientEmail.toLowerCase().includes(searchLower) ||
        clientPhone.includes(searchTerm) ||
        orderId.toLowerCase().includes(searchLower)
      );
    });
  }, [allOrders, searchTerm]);

  const handleDelete = (orderId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta orden?')) {
      deleteOrder(orderId);
    }
  };

  // Definir columnas para TanStack
  const columns = useMemo<ColumnDef<UnifiedOrder>[]>(
    () => [
      {
        id: 'cliente',
        header: 'Cliente',
        accessorFn: (order) =>
          'clientName' in order ? order.clientName : order.contactInfo.fullName,
        cell: ({ row }) => {
          const order = row.original;
          const isMockOrder = 'clientName' in order;
          const clientName = isMockOrder
            ? order.clientName
            : order.contactInfo.fullName;
          return (
            <div>
              {clientName}
              {isMockOrder && (
                <span className="ml-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                  Mock
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: 'email',
        header: 'Email',
        accessorFn: (order) =>
          'clientEmail' in order ? order.clientEmail : order.contactInfo.email,
        cell: ({ row }) => {
          const order = row.original;
          const clientEmail =
            'clientEmail' in order
              ? order.clientEmail
              : order.contactInfo.email;
          return (
            <a
              href={`mailto:${clientEmail}`}
              className="text-sm text-green-600 hover:underline"
            >
              {clientEmail}
            </a>
          );
        },
      },
      {
        id: 'phone',
        header: 'Teléfono',
        accessorFn: (order) =>
          'clientPhone' in order ? order.clientPhone : order.contactInfo.phone,
        cell: ({ row }) => {
          const order = row.original;
          const clientPhone =
            'clientPhone' in order
              ? order.clientPhone
              : order.contactInfo.phone;
          return (
            <a
              href={`tel:${clientPhone}`}
              className="text-sm text-green-600 hover:underline"
            >
              {clientPhone}
            </a>
          );
        },
      },
      {
        id: 'items',
        header: 'Items',
        accessorFn: (order) => order.items.length,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.items.length}</span>
        ),
      },
      {
        id: 'total',
        header: 'Total',
        accessorFn: (order) => {
          const isMockOrder = 'total' in order;
          return isMockOrder ? order.total : order.totalAmount;
        },
        cell: ({ row }) => {
          const order = row.original;
          const total = 'total' in order ? order.total : order.totalAmount;
          return (
            <span className="text-right text-sm font-semibold text-green-600">
              {formatPrice(total)}
            </span>
          );
        },
      },
      {
        id: 'fecha',
        header: 'Fecha',
        accessorFn: (order) => new Date(order.orderDate).getTime(),
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {new Date(row.original.orderDate).toLocaleDateString('es-AR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const order = row.original;
          const isMockOrder = 'clientName' in order;
          return (
            <div className="flex items-center justify-center gap-2">
              {isMockOrder ? (
                <>
                  <Button
                    onClick={() => setSelectedMockOrder(order as MockOrder)}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    Ver
                  </Button>
                  <PDFDownloadButton order={order as MockOrder} />
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setSelectedOrder(order as Order)}
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
                </>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [handleDelete]
  );

  // TanStack Table instance
  const table = useReactTable({
    data: filteredOrders,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Cargando órdenes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestionar Órdenes</h1>
        <p className="mt-2 text-gray-600">
          Aquí verás todos los pedidos que los clientes han completado en el
          checkout.
        </p>
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

      {/* Tabla de Órdenes - Desktop / Cards Mobile */}
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
          {/* Tabla Desktop - TanStack Table */}
          <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm xl:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        const isSortable =
                          header.column.columnDef.enableSorting !== false;
                        return (
                          <th
                            key={header.id}
                            onClick={
                              isSortable
                                ? header.column.getToggleSortingHandler()
                                : undefined
                            }
                            className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 ${
                              isSortable
                                ? 'cursor-pointer hover:bg-gray-100'
                                : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
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
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
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
              const isMockOrder = 'clientName' in order;
              const clientName = isMockOrder
                ? order.clientName
                : order.contactInfo.fullName;
              const clientEmail = isMockOrder
                ? order.clientEmail
                : order.contactInfo.email;
              const clientPhone = isMockOrder
                ? order.clientPhone
                : order.contactInfo.phone;
              const items = isMockOrder ? order.items : order.items;
              const total = isMockOrder ? order.total : order.totalAmount;
              const orderDate = isMockOrder ? order.orderDate : order.orderDate;

              return (
                <div
                  key={order.id}
                  className="space-y-3 rounded-lg border border-gray-200 bg-white p-4"
                >
                  {/* Cliente */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-gray-900">
                        {clientName}
                      </h3>
                      {isMockOrder && (
                        <span className="ml-0 mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                          Mock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Detalles */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="truncate font-medium text-green-600">
                        <a href={`mailto:${clientEmail}`} title={clientEmail}>
                          {clientEmail.split('@')[0]}...
                        </a>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Teléfono</p>
                      <p className="font-medium text-gray-900">
                        <a href={`tel:${clientPhone}`}>{clientPhone}</a>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Items</p>
                      <p className="font-medium text-gray-900">
                        {items.length} producto{items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fecha</p>
                      <p className="font-medium text-gray-900">
                        {new Date(orderDate).toLocaleDateString('es-AR', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Total destacado */}
                  <div className="rounded-lg border border-green-200 bg-green-50 p-2">
                    <p className="text-xs font-medium text-green-600">Total</p>
                    <p className="text-lg font-bold text-green-700">
                      {formatPrice(total)}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-2">
                    {isMockOrder ? (
                      <>
                        <Button
                          onClick={() =>
                            setSelectedMockOrder(order as MockOrder)
                          }
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </Button>
                        <PDFDownloadButton order={order as MockOrder} />
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => setSelectedOrder(order as Order)}
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
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal - Orden Real */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Modal - Orden Mock */}
      {selectedMockOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">
                Detalle de Presupuesto
              </h2>
              <button
                onClick={() => setSelectedMockOrder(null)}
                className="rounded-lg p-1 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6 p-6">
              {/* Información del Cliente */}
              <div>
                <h3 className="text-sm font-semibold uppercase text-gray-500">
                  Información del Cliente
                </h3>
                <div className="mt-4 space-y-2">
                  <p>
                    <span className="font-medium text-gray-700">Nombre:</span>{' '}
                    {selectedMockOrder.clientName}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Email:</span>{' '}
                    <a
                      href={`mailto:${selectedMockOrder.clientEmail}`}
                      className="text-green-600 hover:underline"
                    >
                      {selectedMockOrder.clientEmail}
                    </a>
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Teléfono:</span>{' '}
                    <a
                      href={`tel:${selectedMockOrder.clientPhone}`}
                      className="text-green-600 hover:underline"
                    >
                      {selectedMockOrder.clientPhone}
                    </a>
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">
                      Dirección:
                    </span>{' '}
                    {selectedMockOrder.clientAddress}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">
                      Localidad:
                    </span>{' '}
                    {selectedMockOrder.clientCity}
                  </p>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Productos */}
              <div>
                <h3 className="text-sm font-semibold uppercase text-gray-500">
                  Productos
                </h3>
                <div className="mt-4 space-y-3">
                  {selectedMockOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.productName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} x {item.presentation} @{' '}
                          {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.totalPrice)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Resumen */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium">
                    {formatPrice(selectedMockOrder.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">IVA (21%):</span>
                  <span className="font-medium">
                    {formatPrice(selectedMockOrder.iva)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(selectedMockOrder.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Condiciones */}
              <hr className="border-gray-200" />
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Forma de Pago:</span>{' '}
                  {selectedMockOrder.paymentMethod}
                </p>
                <p>
                  <span className="font-medium">Validez:</span> 15 días
                </p>
                {selectedMockOrder.notes && (
                  <p>
                    <span className="font-medium">Notas:</span>{' '}
                    {selectedMockOrder.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex gap-3">
                <Button
                  onClick={() => setSelectedMockOrder(null)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Cerrar
                </Button>
                <PDFDownloadButton order={selectedMockOrder} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
