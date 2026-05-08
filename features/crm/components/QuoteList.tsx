'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Download, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  changeQuoteEstado,
  deleteQuote,
  downloadQuotePdf,
  getQuotesByDeal,
} from '@/lib/crmApi';
import type { Quote, QuoteEstado } from '@/types/crm';
import { formatCurrency, formatDate } from '@/features/crm/utils';
import { QuoteFormDialog } from './QuoteFormDialog';
import { cn } from '@/lib/utils';

const ESTADO_LABEL: Record<QuoteEstado, string> = {
  BORRADOR: 'Borrador',
  ENVIADO: 'Enviado',
  ACEPTADO: 'Aceptado',
  RECHAZADO: 'Rechazado',
};

const ESTADO_CLASS: Record<QuoteEstado, string> = {
  BORRADOR: 'bg-gray-100 text-gray-700',
  ENVIADO: 'bg-blue-100 text-blue-700',
  ACEPTADO: 'bg-green-100 text-green-700',
  RECHAZADO: 'bg-red-100 text-red-700',
};

interface QuoteListProps {
  dealId: number;
  onMutate: () => void;
}

export function QuoteList({ dealId, onMutate }: QuoteListProps) {
  const { token } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Quote | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await getQuotesByDeal(token, dealId);
      setQuotes(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error cargando presupuestos');
    } finally {
      setIsLoading(false);
    }
  }, [token, dealId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleEstado(q: Quote, estado: QuoteEstado) {
    if (!token) return;
    try {
      await changeQuoteEstado(token, q.id, estado);
      toast.success('Estado actualizado');
      void refresh();
      onMutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error cambiando estado');
    }
  }

  async function handleDelete(q: Quote) {
    if (!token) return;
    if (!confirm(`¿Eliminar el presupuesto ${q.numero}?`)) return;
    try {
      await deleteQuote(token, q.id);
      toast.success('Presupuesto eliminado');
      void refresh();
      onMutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error eliminando');
    }
  }

  async function handleDownload(q: Quote) {
    if (!token) return;
    try {
      const blob = await downloadQuotePdf(token, q.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${q.numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error descargando PDF');
    }
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Presupuestos</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Nuevo
        </Button>
      </div>

      {isLoading ? (
        <p className="text-xs text-gray-400">Cargando…</p>
      ) : quotes.length === 0 ? (
        <p className="text-xs text-gray-400">Sin presupuestos</p>
      ) : (
        <ul className="space-y-2">
          {quotes.map((q) => (
            <li
              key={q.id}
              className="rounded border border-gray-200 bg-white p-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {q.numero}
                    </span>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[10px] font-medium uppercase',
                        ESTADO_CLASS[q.estado],
                      )}
                    >
                      {ESTADO_LABEL[q.estado]}
                    </span>
                    {q.titulo && (
                      <span className="text-xs text-gray-500">
                        {q.titulo}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span>Total: {formatCurrency(q.total)}</span>
                    <span>Items: {q.items.length}</span>
                    <span>Creado: {formatDate(q.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Descargar PDF"
                    onClick={() => handleDownload(q)}
                    className="rounded p-1 text-blue-600 hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title={q.estado === 'ACEPTADO' ? 'Ver' : 'Editar'}
                    onClick={() => {
                      setEditing(q);
                      setDialogOpen(true);
                    }}
                    className="rounded p-1 text-gray-500 hover:bg-gray-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {q.estado !== 'ACEPTADO' && (
                    <button
                      type="button"
                      title="Eliminar"
                      onClick={() => handleDelete(q)}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
                {q.estado === 'BORRADOR' && (
                  <button
                    type="button"
                    onClick={() => handleEstado(q, 'ENVIADO')}
                    className="rounded bg-blue-50 px-2 py-0.5 text-blue-700 hover:bg-blue-100"
                  >
                    Marcar enviado
                  </button>
                )}
                {(q.estado === 'BORRADOR' || q.estado === 'ENVIADO') && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleEstado(q, 'ACEPTADO')}
                      className="rounded bg-green-50 px-2 py-0.5 text-green-700 hover:bg-green-100"
                    >
                      Marcar aceptado
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEstado(q, 'RECHAZADO')}
                      className="rounded bg-red-50 px-2 py-0.5 text-red-700 hover:bg-red-100"
                    >
                      Marcar rechazado
                    </button>
                  </>
                )}
                {q.estado === 'RECHAZADO' && (
                  <button
                    type="button"
                    onClick={() => handleEstado(q, 'BORRADOR')}
                    className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 hover:bg-gray-200"
                  >
                    Reabrir
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <QuoteFormDialog
        open={dialogOpen}
        dealId={dealId}
        initial={editing}
        onOpenChange={setDialogOpen}
        onSaved={() => {
          void refresh();
          onMutate();
        }}
      />
    </section>
  );
}
