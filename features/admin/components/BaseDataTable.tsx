'use client';

import React from 'react';
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
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface BaseDataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
}

/**
 * Componente base headless para tablas con TanStack Table
 * Proporciona:
 * - Sorting por columnas (click en encabezado)
 * - Indicadores visuales de sorting
 * - Rendering flexible sin UI prescrita
 * - Fácil de extender para casos específicos
 */
export const BaseDataTable = React.forwardRef<
  any,
  BaseDataTableProps<any>
>(
  (
    { columns, data, isLoading = false, emptyMessage = 'No hay datos disponibles' },
    ref
  ) => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [pagination, setPagination] = React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

    const table = useReactTable({
      data,
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
          <p className="text-gray-500">Cargando datos...</p>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div
        className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
        ref={ref}
      >
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
                        onClick={
                          isSortable ? header.column.getToggleSortingHandler() : undefined
                        }
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

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-600">
              Página {table.getState().pagination.pageIndex + 1} de{' '}
              {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Productos por página:</label>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none"
            >
              {[10, 20, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }
);

BaseDataTable.displayName = 'BaseDataTable';

export default BaseDataTable;
