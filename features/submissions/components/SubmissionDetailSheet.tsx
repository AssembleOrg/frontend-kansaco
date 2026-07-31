'use client';

import { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { deleteSubmission, updateSubmission } from '@/lib/submissionsApi';
import { formatDateTime, buildWhatsAppLink } from '@/features/crm/utils';
import type { Submission } from '../types';
import {
  payloadEntries,
  submissionTypeBadgeClass,
  submissionTypeLabel,
} from '../utils';
import { cn } from '@/lib/utils';

interface Props {
  submission: Submission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

export function SubmissionDetailSheet({
  submission,
  open,
  onOpenChange,
  onChanged,
}: Props) {
  const { token } = useAuth();
  const [nota, setNota] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingRead, setIsTogglingRead] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Al abrir otra solicitud hay que descartar la nota que estaba en pantalla.
  useEffect(() => {
    setNota(submission?.notaInterna ?? '');
  }, [submission?.id, submission?.notaInterna]);

  if (!submission) return null;

  const entries = payloadEntries(submission.tipo, submission.payload);
  const whatsapp = buildWhatsAppLink(submission.telefono);
  const notaCambiada = nota.trim() !== (submission.notaInterna ?? '').trim();

  async function copiar(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      toast.error('No se pudo copiar');
    }
  }

  async function guardarNota() {
    if (!token || !submission) return;
    try {
      setIsSaving(true);
      await updateSubmission(token, submission.id, { notaInterna: nota });
      toast.success('Nota guardada');
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error guardando la nota');
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleLeida() {
    if (!token || !submission) return;
    try {
      setIsTogglingRead(true);
      await updateSubmission(token, submission.id, { leida: !submission.leida });
      toast.success(
        submission.leida ? 'Marcada como sin leer' : 'Marcada como atendida',
      );
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error actualizando');
    } finally {
      setIsTogglingRead(false);
    }
  }

  async function eliminar() {
    if (!token || !submission) return;
    if (!confirm(`¿Eliminar la solicitud de "${submission.nombre}"?`)) return;
    try {
      await deleteSubmission(token, submission.id);
      toast.success('Solicitud eliminada');
      onOpenChange(false);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error eliminando');
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
        <ResponsiveDialogHeader className="text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                submissionTypeBadgeClass(submission.tipo),
              )}
            >
              {submissionTypeLabel(submission.tipo)}
            </span>
            {!submission.leida && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
                Sin leer
              </span>
            )}
          </div>

          <ResponsiveDialogTitle className="mt-2 text-xl font-semibold">
            {submission.nombre}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Recibida el {formatDateTime(submission.createdAt)}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="mt-4 space-y-5">
          {/* Contacto directo */}
          <div className="flex flex-wrap gap-2">
            <a
              href={`mailto:${submission.email}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {submission.email}
            </a>

            {submission.telefono && (
              <a
                href={`tel:${submission.telefono}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {submission.telefono}
              </a>
            )}

            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp
              </a>
            )}
          </div>

          {/* Datos propios del formulario */}
          {entries.length > 0 && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50/60">
              <dl className="divide-y divide-neutral-200">
                {entries.map(({ key, label, value }) => (
                  <div
                    key={key}
                    className="flex items-start justify-between gap-3 px-4 py-2.5"
                  >
                    <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                      {label}
                    </dt>
                    <dd className="flex min-w-0 items-center gap-2 text-right text-sm text-neutral-900">
                      <span className="break-words">{value}</span>
                      <button
                        type="button"
                        onClick={() => copiar(value, key)}
                        aria-label={`Copiar ${label}`}
                        className="shrink-0 rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-700"
                      >
                        {copiedKey === key ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Mensaje del visitante */}
          {submission.mensaje && (
            <div>
              <Label className="text-xs uppercase tracking-wide text-neutral-500">
                Mensaje
              </Label>
              <p className="mt-1.5 whitespace-pre-wrap rounded-lg border border-neutral-200 bg-white p-3 text-sm text-neutral-800">
                {submission.mensaje}
              </p>
            </div>
          )}

          {/* Nota interna: acá queda registrado qué se resolvió y por qué */}
          <div>
            <Label
              htmlFor="nota-interna"
              className="text-xs uppercase tracking-wide text-neutral-500"
            >
              Nota interna
            </Label>
            <textarea
              id="nota-interna"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={4}
              maxLength={4000}
              placeholder="Qué se resolvió, con quién se habló, volumen estimado…"
              className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-neutral-400">
                Sólo la ve el equipo, nunca el visitante.
              </p>
              <Button
                size="sm"
                onClick={guardarNota}
                disabled={!notaCambiada || isSaving}
              >
                {isSaving && (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                )}
                Guardar nota
              </Button>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 pt-4">
            <Button
              variant={submission.leida ? 'outline' : 'default'}
              onClick={toggleLeida}
              disabled={isTogglingRead}
            >
              {isTogglingRead ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-1.5 h-4 w-4" />
              )}
              {submission.leida ? 'Marcar como sin leer' : 'Marcar como atendida'}
            </Button>

            <Button
              variant="ghost"
              onClick={eliminar}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
