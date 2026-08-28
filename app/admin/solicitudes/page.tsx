'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Inbox, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getSubmissions } from '@/lib/submissionsApi';
import { PageHeader } from '@/features/crm/components/mobile/PageHeader';
import { FilterSheet } from '@/features/crm/components/mobile/FilterSheet';
import { formatDateTime, buildWhatsAppLink } from '@/features/crm/utils';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import type { Submission, SubmissionType } from '@/features/submissions/types';
import {
  relativeTime,
  submissionTypeBadgeClass,
  submissionTypeLabel,
} from '@/features/submissions/utils';
import { SubmissionCardMobile } from '@/features/submissions/components/SubmissionCardMobile';
import { SubmissionDetailSheet } from '@/features/submissions/components/SubmissionDetailSheet';
import { cn } from '@/lib/utils';

type LeidaFilter = '' | 'true' | 'false';

/**
 * Espeja las clases del `Input` de shadcn (`components/ui/input.tsx`) para que
 * los `<select>` nativos queden a la misma altura y con el mismo foco. Sin
 * esto, el buscador y los desplegables quedan desalineados: `Input` usa `h-9`
 * y los select quedaban con `py-2`, que da otra altura.
 */
const selectClass =
  'border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';

export default function SolicitudesPage() {
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tipo, setTipo] = useState<SubmissionType | ''>('');
  const [leida, setLeida] = useState<LeidaFilter>('');
  const [selected, setSelected] = useState<Submission | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Debounce del buscador: el texto tipeado (`search`) alimenta el input sin
  // latencia; sólo `debouncedSearch` dispara el fetch, así no se pega al backend
  // en cada tecla.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const refresh = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!token) return;
      try {
        // En modo silencioso (recarga tras una acción del detalle) no ponemos el
        // spinner para que no parpadee toda la lista.
        if (!silent) setIsLoading(true);
        const data = await getSubmissions(token, {
          search: debouncedSearch || undefined,
          tipo: tipo || undefined,
          leida: leida === '' ? undefined : leida === 'true',
        });
        setSubmissions(data);

        // Mantiene el detalle abierto sincronizado tras marcar leída o guardar nota.
        setSelected((current) =>
          current ? (data.find((s) => s.id === current.id) ?? null) : null,
        );
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Error cargando solicitudes',
        );
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [token, debouncedSearch, tipo, leida],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function openDetail(submission: Submission) {
    setSelected(submission);
    setDetailOpen(true);
  }

  const activeFiltersCount = useMemo(
    () => (search ? 1 : 0) + (tipo ? 1 : 0) + (leida ? 1 : 0),
    [search, tipo, leida],
  );

  const noLeidas = useMemo(
    () => submissions.filter((s) => !s.leida).length,
    [submissions],
  );

  const isEmpty = !isLoading && submissions.length === 0;

  return (
    <div className="space-y-3 sm:space-y-4">
      <PageHeader
        title="Solicitudes"
        description={
          noLeidas > 0
            ? `${noLeidas} sin leer de ${submissions.length}`
            : 'Formularios enviados desde la web'
        }
      />

      <FilterSheet
        activeCount={activeFiltersCount}
        onClear={
          activeFiltersCount > 0
            ? () => {
                setSearch('');
                setTipo('');
                setLeida('');
              }
            : undefined
        }
        desktopWrapperClassName="lg:!grid-cols-3"
      >
        <div className="space-y-1.5">
          <Label htmlFor="search" className="text-xs">
            Buscar
          </Label>
          <Input
            id="search"
            placeholder="Nombre o email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tipo" className="text-xs">
            Tipo
          </Label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as SubmissionType | '')}
            className={selectClass}
          >
            <option value="">Todos</option>
            <option value="MAYORISTA">Mayorista</option>
            <option value="TRABAJO">Trabajá con nosotros</option>
            <option value="LUBRI_EXPERTO">Lubri Experto</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="leida" className="text-xs">
            Estado
          </Label>
          <select
            id="leida"
            value={leida}
            onChange={(e) => setLeida(e.target.value as LeidaFilter)}
            className={selectClass}
          >
            <option value="">Todas</option>
            <option value="false">Sin leer</option>
            <option value="true">Atendidas</option>
          </select>
        </div>
      </FilterSheet>

      {/* Mobile: cards */}
      <div className="overflow-hidden rounded-xl border border-neutral-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:hidden">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : isEmpty ? (
          <EmptyState hasFilters={activeFiltersCount > 0} />
        ) : (
          submissions.map((submission) => (
            <SubmissionCardMobile
              key={submission.id}
              submission={submission}
              onOpen={openDetail}
            />
          ))
        )}
      </div>

      {/* Desktop: tabla */}
      <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white lg:block">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : isEmpty ? (
          <EmptyState hasFilters={activeFiltersCount > 0} />
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="w-8 px-4 py-2" />
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Teléfono</th>
                <th className="px-4 py-2">Recibida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {submissions.map((submission) => (
                <tr
                  key={submission.id}
                  onClick={() => openDetail(submission)}
                  className={cn(
                    'cursor-pointer transition-colors hover:bg-gray-50',
                    !submission.leida && 'bg-emerald-50/40',
                  )}
                >
                  <td className="px-4 py-2">
                    <span
                      aria-label={submission.leida ? 'Atendida' : 'Sin leer'}
                      className={cn(
                        'block h-2 w-2 rounded-full',
                        submission.leida ? 'bg-transparent' : 'bg-emerald-500',
                      )}
                    />
                  </td>
                  <td
                    className={cn(
                      'px-4 py-2 text-gray-900',
                      submission.leida ? 'font-normal' : 'font-semibold',
                    )}
                  >
                    {submission.nombre}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide',
                        submissionTypeBadgeClass(submission.tipo),
                      )}
                    >
                      {submissionTypeLabel(submission.tipo)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{submission.email}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {buildWhatsAppLink(submission.telefono) ? (
                      <a
                        href={buildWhatsAppLink(submission.telefono)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title={`WhatsApp ${submission.telefono}`}
                        className="inline-flex items-center gap-1.5 text-emerald-600 hover:underline"
                      >
                        <WhatsAppIcon className="h-4 w-4" />
                        {submission.telefono}
                      </a>
                    ) : (
                      (submission.telefono ?? '—')
                    )}
                  </td>
                  <td
                    className="px-4 py-2 text-gray-500"
                    title={formatDateTime(submission.createdAt)}
                  >
                    {relativeTime(submission.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <SubmissionDetailSheet
        submission={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onChanged={() => void refresh({ silent: true })}
      />
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <Inbox className="mb-3 h-8 w-8 text-neutral-300" aria-hidden="true" />
      <p className="text-sm font-medium text-neutral-600">
        {hasFilters ? 'No hay resultados' : 'Todavía no llegaron solicitudes'}
      </p>
      <p className="mt-1 text-xs text-neutral-400">
        {hasFilters
          ? 'Probá quitando algún filtro.'
          : 'Acá vas a ver lo que se envíe desde los formularios de la web.'}
      </p>
    </div>
  );
}
