'use client';

import { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { format, parse } from 'date-fns';
import { useOrders } from '@/features/admin/hooks/useOrders';
import { Order, OrderFilters, OrderStatus } from '@/types/order';
import { B2B_ROLES, CATEGORIA_LABEL, UserRole } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Eye, Search, RefreshCw, ChevronLeft, ChevronRight, FileText, FileSpreadsheet, X, SlidersHorizontal } from 'lucide-react';
import { formatDateForDisplay } from '@/lib/dateUtils';
import { downloadOrderPDF, downloadOrdersExport } from '@/lib/api';
import { AR_PROVINCES } from '@/lib/constants/provinces';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { OrderDetailsModal } from '@/features/orders/components/OrderDetailsModal';
import { OrderNoteModal } from '@/features/orders/components/OrderNoteModal';
import { toast } from 'sonner';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
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

const STATUSES = Object.keys(statusConfig) as OrderStatus[];

// Categorías que se pueden filtrar: las comerciales + cuentas pendientes.
const CATEGORIAS: UserRole[] = [...B2B_ROLES, 'CLIENTE_MINORISTA'];

// Para la frase-resumen: "12 pedidos completados".
const STATUS_PLURAL: Record<OrderStatus, string> = {
  PENDIENTE: 'pendientes',
  PROCESANDO: 'en proceso',
  ENVIADO: 'enviados',
  COMPLETADO: 'completados',
  CANCELADO: 'cancelados',
};

const ddmm = (s: string) => s.split('-').reverse().join('/');

/** Frase que explica qué se está viendo, p. ej. "42 pedidos completados entre el 01/08/2026 y el 31/08/2026". */
function describeView(total: number, f: OrderFilters): string {
  const estados = f.status?.length
    ? ' ' + f.status.map((s) => STATUS_PLURAL[s]).join(' o ')
    : '';
  const hechos = f.status?.length ? 'que pasaron a ese estado' : 'hechos';
  const fechas =
    f.from && f.to
      ? f.from === f.to
        ? ` ${hechos} el ${ddmm(f.from)}`
        : ` ${hechos} entre el ${ddmm(f.from)} y el ${ddmm(f.to)}`
      : f.from
        ? ` ${hechos} desde el ${ddmm(f.from)}`
        : '';
  const donde = f.provincia ? ` en ${f.provincia}` : '';
  const quien = f.categoria ? ` de cuentas ${CATEGORIA_LABEL[f.categoria]}` : '';
  return `${total} ${total === 1 ? 'pedido' : 'pedidos'}${estados}${fechas}${donde}${quien}`;
}

// 'yyyy-MM-dd' <-> Date local (día calendario; el backend lo interpreta en hora AR).
const toYmd = (d?: Date) => (d ? format(d, 'yyyy-MM-dd') : undefined);
const fromYmd = (s?: string) => {
  if (!s) return undefined;
  const d = parse(s, 'yyyy-MM-dd', new Date());
  return isNaN(d.getTime()) ? undefined : d;
};

export default function OrdersPage() {
  // useSearchParams exige un Suspense boundary en el build de Next.
  return (
    <Suspense fallback={<p className="py-12 text-center text-gray-500">Cargando órdenes...</p>}>
      <OrdersPageContent />
    </Suspense>
  );
}

function OrdersPageContent() {
  const { token, user } = useAuth();
  const isStaff = user?.rol === 'ADMIN' || user?.rol === 'ASISTENTE';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filtros en la URL: se pueden compartir ("completados de agosto") y sobreviven un F5.
  const filters = useMemo<OrderFilters>(() => {
    const get = (k: string) => searchParams.get(k) || undefined;
    const categoria = get('categoria') as UserRole | undefined;
    return {
      status: get('status')?.split(',').filter((s): s is OrderStatus => STATUSES.includes(s as OrderStatus)),
      from: get('from'),
      to: get('to'),
      provincia: get('provincia'),
      categoria: categoria && CATEGORIAS.includes(categoria) ? categoria : undefined,
      q: get('q'),
      orden: get('orden') === 'asc' ? 'asc' : undefined,
    };
  }, [searchParams]);
  const hasFilters = Boolean(
    filters.status?.length || filters.from || filters.to || filters.provincia || filters.categoria || filters.q
  );

  const setFilters = useCallback((patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, router, pathname]);

  const toggleStatus = (status: OrderStatus) => {
    const current = filters.status ?? [];
    const next = current.includes(status) ? current.filter((s) => s !== status) : [...current, status];
    setFilters({ status: next.join(',') || undefined });
  };

  // Búsqueda con debounce: el input es local, la URL se actualiza a los 300 ms.
  const [searchTerm, setSearchTerm] = useState(filters.q ?? '');
  useEffect(() => {
    const q = searchTerm.trim() || undefined;
    if (q === filters.q) return;
    const t = setTimeout(() => setFilters({ q }), 300);
    return () => clearTimeout(t);
  }, [searchTerm, filters.q, setFilters]);

  const { orders, isLoading, error, pagination, countsByStatus, updateStatus, updateNotes, refresh, goToPage } = useOrders(filters);
  const totalAllStatuses = countsByStatus
    ? Object.values(countsByStatus).reduce((a, b) => a + b, 0)
    : undefined;

  // Filtros que viven en el panel (en celular, dentro del botón "Filtros").
  const panelFilterCount = [filters.from, filters.provincia, filters.categoria].filter(Boolean).length;
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [exporting, setExporting] = useState<'xlsx' | 'pdf' | null>(null);
  const handleExport = async (fmt: 'xlsx' | 'pdf') => {
    if (!token) return;
    setExporting(fmt);
    try {
      await downloadOrdersExport(token, fmt, filters);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al exportar');
    } finally {
      setExporting(null);
    }
  };
  // Guardamos solo el id; el pedido se deriva de la lista en cada render, así el
  // modal siempre ve los datos frescos tras editar (sin sync ni cerrar/reabrir).
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrder = selectedOrderId
    ? orders.find((o) => o.id === selectedOrderId) ?? null
    : null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  // Orden pendiente de cancelar (abre el modal que pide el motivo).
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleStatusChange = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    // Al cancelar, pedir el motivo antes de aplicar el cambio.
    if (newStatus === 'CANCELADO') {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setOrderToCancel(order);
        return;
      }
    }

    try {
      await updateStatus(orderId, newStatus);
      toast.success('Estado actualizado correctamente');
      refresh();
    } catch {
      toast.error('Error al actualizar el estado');
    }
  }, [orders, updateStatus, refresh]);

  // Confirma la cancelación: cambia el estado y guarda el motivo en las notas.
  const handleConfirmCancel = useCallback(async (finalNotes: string) => {
    if (!orderToCancel) return;
    setIsCancelling(true);
    try {
      await updateStatus(orderToCancel.id, 'CANCELADO');
      await updateNotes(orderToCancel.id, finalNotes);
      toast.success('Orden cancelada y motivo registrado');
      setOrderToCancel(null);
      refresh();
    } catch {
      toast.error('Error al cancelar la orden');
    } finally {
      setIsCancelling(false);
    }
  }, [orderToCancel, updateStatus, updateNotes, refresh]);

  const handleDownloadPDF = useCallback(async (order: Order) => {
    if (!token) return;

    setDownloadingOrderId(order.id);
    try {
      // Primero promovemos a PROCESANDO (solo si está PENDIENTE) para que el
      // estado ya actualizado salga impreso en el PDF que genera el backend.
      const promoted = order.status === 'PENDIENTE';
      if (promoted) {
        await updateStatus(order.id, 'PROCESANDO');
      }
      await downloadOrderPDF(token, order.id);
      toast.success(
        promoted
          ? 'Pedido marcado como Procesando y PDF descargado'
          : 'PDF descargado correctamente'
      );
      if (promoted) refresh();
    } catch (err) {
      console.error('Error downloading PDF:', err);
      toast.error('Error al descargar el PDF');
    } finally {
      setDownloadingOrderId(null);
    }
  }, [token, updateStatus, refresh]);

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
        header: 'Creado',
        accessorFn: (order) => new Date(order.createdAt).getTime(),
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {formatDateForDisplay(row.original.createdAt, 'short')}
          </span>
        ),
      },
      {
        id: 'estadoDesde',
        header: 'Estado desde',
        accessorFn: (order) => new Date(order.statusChangedAt ?? order.createdAt).getTime(),
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {formatDateForDisplay(row.original.statusChangedAt ?? row.original.createdAt, 'short')}
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
              {order.notes && (
                <span title="Esta orden tiene notas">
                  <FileText className="h-4 w-4 text-amber-500" />
                </span>
              )}
              <Button
                onClick={() => {
                  setSelectedOrderId(order.id);
                  setIsModalOpen(true);
                }}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <Eye className="h-4 w-4" />
                Ver
              </Button>
              <Button
                onClick={() => handleDownloadPDF(order)}
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={downloadingOrderId === order.id}
              >
                {downloadingOrderId === order.id ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>
          );
        },
      },
    ],
    [handleStatusChange, handleDownloadPDF, downloadingOrderId]
  );

  // TanStack Table instance (sin paginación del frontend, usamos la del backend)
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

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

      {/* Filtros (server-side) */}
      <div className="space-y-3 rounded-lg border border-green-100 border-t-4 border-t-green-600 bg-white p-3 shadow-sm sm:p-4">
        {/* Estados con conteo. En celular: una sola fila con scroll horizontal. */}
        <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilters({ status: undefined })}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              !filters.status?.length ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-green-50'
            }`}
          >
            Todos{totalAllStatuses !== undefined && ` (${totalAllStatuses})`}
          </button>
          {STATUSES.map((s) => {
            const active = filters.status?.includes(s);
            const cfg = statusConfig[s];
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => toggleStatus(s)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  active ? `${cfg.bg} ${cfg.color} border-current` : 'border-gray-300 text-gray-700 hover:bg-green-50'
                }`}
              >
                {cfg.label}
                {countsByStatus && ` (${countsByStatus[s] ?? 0})`}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 lg:gap-3">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar cliente, CUIT, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Desktop: filtros a la vista */}
          <DateRangePicker
            className="hidden w-64 lg:block"
            align="end"
            value={{ from: fromYmd(filters.from), to: fromYmd(filters.to) }}
            onChange={({ from, to }) => setFilters({ from: toYmd(from), to: toYmd(to) })}
            placeholder="Todas las fechas"
          />
          <select
            value={filters.provincia ?? ''}
            onChange={(e) => setFilters({ provincia: e.target.value || undefined })}
            aria-label="Provincia"
            className={`hidden lg:block lg:w-48 h-10 rounded-md border px-3 text-sm ${filters.provincia ? 'border-green-500 bg-green-50 font-medium text-green-800' : 'border-gray-300 bg-white text-gray-700'} focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500`}
          >
            <option value="">Todas las provincias</option>
            {AR_PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={filters.categoria ?? ''}
            onChange={(e) => setFilters({ categoria: e.target.value || undefined })}
            aria-label="Categoría de la cuenta"
            className={`hidden lg:block lg:w-44 h-10 rounded-md border px-3 text-sm ${filters.categoria ? 'border-green-500 bg-green-50 font-medium text-green-800' : 'border-gray-300 bg-white text-gray-700'} focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500`}
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>{CATEGORIA_LABEL[c]}</option>
            ))}
          </select>

          {/* Celular/tablet: todo lo demás dentro de un botón */}
          <Button
            type="button"
            variant="outline"
            className={`h-10 shrink-0 gap-2 lg:hidden ${panelFilterCount > 0 ? 'border-green-500 bg-green-50 text-green-800' : ''}`}
            onClick={() => setFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {panelFilterCount > 0 && (
              <span className="rounded-full bg-green-600 px-1.5 text-xs text-white">{panelFilterCount}</span>
            )}
          </Button>
        </div>

        {/* Qué estoy viendo + exportar */}
        <div className="flex flex-wrap items-center gap-2">
          <p className="mr-auto text-sm text-gray-700">
            {isLoading && !countsByStatus ? 'Cargando…' : (() => {
              const [n, ...rest] = describeView(pagination.total, filters).split(' ');
              return (
                <>
                  <span className="font-semibold text-green-700">{n}</span> {rest.join(' ')}
                </>
              );
            })()}
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  router.replace(pathname, { scroll: false });
                }}
                className="ml-2 inline-flex items-center text-sm text-gray-500 underline-offset-2 hover:text-red-600 hover:underline"
              >
                <X className="mr-0.5 h-3.5 w-3.5" />
                Limpiar
              </button>
            )}
          </p>
          <select
            value={filters.orden ?? 'desc'}
            onChange={(e) => setFilters({ orden: e.target.value === 'asc' ? 'asc' : undefined })}
            aria-label="Orden de la lista"
            className={`h-8 rounded-md border px-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 ${
              filters.orden ? 'border-green-500 bg-green-50 font-medium text-green-800' : 'border-gray-300 bg-white text-gray-700'
            }`}
          >
            <option value="desc">Más nuevos primero</option>
            <option value="asc">Más viejos primero</option>
          </select>
          <Button
            onClick={() => handleExport('xlsx')}
            size="sm"
            className="bg-green-600 text-white hover:bg-green-700"
            disabled={!!exporting || pagination.total === 0}
            title="Descargar estos pedidos en Excel (sin precios)"
          >
            {exporting === 'xlsx' ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />}
            Excel
          </Button>
          <Button
            onClick={() => handleExport('pdf')}
            variant="outline"
            size="sm"
            className="border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800"
            disabled={!!exporting || pagination.total === 0}
            title="Descargar un resumen en PDF (sin precios)"
          >
            {exporting === 'pdf' ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            PDF
          </Button>
        </div>
      </div>

      {/* Panel de filtros (celular/tablet) */}
      <ResponsiveDialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <ResponsiveDialogContent className="sm:max-w-md">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Filtros</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-900">Fechas</p>
              <DateRangePicker
                inline
                value={{ from: fromYmd(filters.from), to: fromYmd(filters.to) }}
                onChange={({ from, to }) => setFilters({ from: toYmd(from), to: toYmd(to) })}
              />
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-900">Provincia</span>
              <select
                value={filters.provincia ?? ''}
                onChange={(e) => setFilters({ provincia: e.target.value || undefined })}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">Todas las provincias</option>
                {AR_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-900">Categoría de la cuenta</span>
              <select
                value={filters.categoria ?? ''}
                onChange={(e) => setFilters({ categoria: e.target.value || undefined })}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">Todas las categorías</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{CATEGORIA_LABEL[c]}</option>
                ))}
              </select>
            </label>
            <Button className="w-full bg-green-600 text-white hover:bg-green-700" onClick={() => setFiltersOpen(false)}>
              {isLoading ? 'Buscando…' : `Ver ${pagination.total} ${pagination.total === 1 ? 'pedido' : 'pedidos'}`}
            </Button>
          </div>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      {/* Tabla de Órdenes */}
      {error ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-gray-200 bg-white py-12">
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      ) : isLoading && orders.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Cargando órdenes...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center sm:p-12">
          <p className="text-sm text-gray-500 sm:text-base">
            {hasFilters
              ? 'No hay pedidos que coincidan con los filtros.'
              : 'No hay órdenes aún. Cuando los clientes completen su compra aparecerán aquí.'}
          </p>
        </div>
      ) : (
        <div className={isLoading ? 'opacity-60 transition-opacity' : undefined}>
          {/* Tabla Desktop */}
          <div className="hidden xl:block w-full max-w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
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
          <div className="xl:hidden w-full max-w-full space-y-3">
            {orders.map((order) => {
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
                      <p className="text-gray-500">Creado</p>
                      <p className="font-medium text-gray-900">
                        {formatDateForDisplay(order.createdAt, 'short')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Estado desde</p>
                      <p className="font-medium text-gray-900">
                        {formatDateForDisplay(order.statusChangedAt ?? order.createdAt, 'short')}
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
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setIsModalOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </Button>
                    <Button
                      onClick={() => handleDownloadPDF(order)}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      disabled={downloadingOrderId === order.id}
                    >
                      {downloadingOrderId === order.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Controles de Paginación */}
      {pagination.totalPages > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4 rounded-b-lg">
          <div className="text-sm text-gray-700">
            Página{' '}
            <span className="font-medium">{pagination.page}</span>{' '}
            de{' '}
            <span className="font-medium">{pagination.totalPages}</span>{' '}
            •{' '}
            <span className="font-medium">{pagination.total}</span> pedidos en total
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={!pagination.hasPrev || isLoading}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={!pagination.hasNext || isLoading}
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
      <OrderDetailsModal
        order={selectedOrder}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        allowNotes
        isStaff={isStaff}
        onOrderUpdated={refresh}
      />

      {/* Modal - Motivo de cancelación */}
      <OrderNoteModal
        open={!!orderToCancel}
        onOpenChange={(open) => {
          if (!open) setOrderToCancel(null);
        }}
        mode="cancel"
        initialNotes={orderToCancel?.notes}
        isSubmitting={isCancelling}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
