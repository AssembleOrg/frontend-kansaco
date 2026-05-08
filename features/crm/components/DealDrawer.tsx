'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, MessageCircle, Pencil, Trash2, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  addDealNote,
  deleteDealNote,
  getDealById,
  updateDeal,
  deleteDeal as apiDeleteDeal,
  getVendors,
} from '@/lib/crmApi';
import type { DealDetail, Vendor } from '@/types/crm';
import {
  buildMailtoLink,
  buildWhatsAppLink,
  formatCurrency,
  formatDate,
  formatDateTime,
  leadTypeLabel,
} from '@/features/crm/utils';
import { cn } from '@/lib/utils';
import { QuoteList } from './QuoteList';
import { LeadFormDialog } from './LeadFormDialog';

interface DealDrawerProps {
  dealId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMutate: () => void;
  onRequestMoveStage?: () => void;
}

export function DealDrawer({
  dealId,
  open,
  onOpenChange,
  onMutate,
  onRequestMoveStage,
}: DealDrawerProps) {
  const { token } = useAuth();
  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [editForm, setEditForm] = useState<{
    vendorId: string;
    monto: string;
    fechaCierre: string;
  }>({ vendorId: '', monto: '', fechaCierre: '' });
  const [isSavingForm, setIsSavingForm] = useState(false);
  const [leadEditOpen, setLeadEditOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!token || !dealId) return;
    try {
      setIsLoading(true);
      const [d, v] = await Promise.all([
        getDealById(token, dealId),
        getVendors(token, true),
      ]);
      setDeal(d);
      setVendors(v);
      setEditForm({
        vendorId: d.vendor?.id ? String(d.vendor.id) : '',
        monto: d.monto ?? '',
        fechaCierre: d.fechaCierre ?? '',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error cargando negocio');
    } finally {
      setIsLoading(false);
    }
  }, [token, dealId]);

  useEffect(() => {
    if (open && dealId) {
      void refresh();
    } else {
      setDeal(null);
      setNewNote('');
    }
  }, [open, dealId, refresh]);

  async function handleSaveForm() {
    if (!token || !deal) return;
    try {
      setIsSavingForm(true);
      const vendorId =
        editForm.vendorId === '' ? null : Number(editForm.vendorId);
      const monto = editForm.monto === '' ? null : editForm.monto;
      const fechaCierre =
        editForm.fechaCierre === '' ? null : editForm.fechaCierre;
      await updateDeal(token, deal.id, { vendorId, monto, fechaCierre });
      toast.success('Negocio actualizado');
      onMutate();
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error actualizando');
    } finally {
      setIsSavingForm(false);
    }
  }

  async function handleAddNote() {
    if (!token || !deal || !newNote.trim()) return;
    try {
      setIsSavingNote(true);
      await addDealNote(token, deal.id, newNote.trim());
      setNewNote('');
      toast.success('Nota agregada');
      await refresh();
      onMutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error agregando nota');
    } finally {
      setIsSavingNote(false);
    }
  }

  async function handleDeleteNote(noteId: number) {
    if (!token) return;
    if (!confirm('¿Eliminar esta nota?')) return;
    try {
      await deleteDealNote(token, noteId);
      toast.success('Nota eliminada');
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error eliminando nota');
    }
  }

  async function handleDeleteDeal() {
    if (!token || !deal) return;
    if (!confirm('¿Eliminar este negocio? Esta acción no se puede deshacer.'))
      return;
    try {
      await apiDeleteDeal(token, deal.id);
      toast.success('Negocio eliminado');
      onMutate();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error eliminando');
    }
  }

  const wa = deal ? buildWhatsAppLink(deal.lead.telefono) : null;
  const mailto = deal ? buildMailtoLink(deal.lead.email) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-y-auto sm:max-w-xl"
      >
        <SheetHeader>
          <SheetTitle className="text-xl uppercase">
            {deal?.lead.nombre ?? 'Cargando negocio…'}
          </SheetTitle>
          {deal ? (
            <SheetDescription className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className="rounded-full px-2 py-0.5 text-white"
                style={{ backgroundColor: deal.stage.color }}
              >
                {deal.stage.nombre}
              </span>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700">
                {leadTypeLabel(deal.lead.tipo)}
              </span>
              {deal.currentReason && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800">
                  {deal.currentReason.motivo}
                </span>
              )}
            </SheetDescription>
          ) : null}
          {deal && onRequestMoveStage ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRequestMoveStage}
              className="mt-2 w-full justify-center lg:hidden"
            >
              <ArrowRightLeft className="mr-1.5 h-4 w-4" />
              Mover a etapa
            </Button>
          ) : null}
        </SheetHeader>

        {isLoading && !deal ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : !deal ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
            Cargá un negocio
          </div>
        ) : (
          <>
            <div className="space-y-6 py-4">
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Contacto
                  </h3>
                  <button
                    type="button"
                    onClick={() => setLeadEditOpen(true)}
                    className="flex items-center gap-1 text-xs text-green-700 hover:underline"
                  >
                    <Pencil className="h-3 w-3" /> Editar lead
                  </button>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Email: {deal.lead.email ?? '—'}</p>
                  <p>Teléfono: {deal.lead.telefono ?? '—'}</p>
                  <p>
                    Zona:{' '}
                    {[deal.lead.ciudad, deal.lead.provincia]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded border border-green-200 bg-green-50 px-2 py-1 text-xs text-green-700 hover:bg-green-100"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  )}
                  {mailto && (
                    <a
                      href={mailto}
                      className="inline-flex items-center gap-1 rounded border border-neutral-200/70 bg-neutral-50 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100"
                    >
                      <Mail className="h-3.5 w-3.5" /> Email
                    </a>
                  )}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Detalles del negocio
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="vendor" className="text-xs">
                      Vendedor
                    </Label>
                    <select
                      id="vendor"
                      value={editForm.vendorId}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          vendorId: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Sin asignar</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.nombre} {!v.activo && '(inactivo)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="monto" className="text-xs">
                      Monto manual
                    </Label>
                    <Input
                      id="monto"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={editForm.monto}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, monto: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="fechaCierre" className="text-xs">
                      Fecha de cierre estimada
                    </Label>
                    <Input
                      id="fechaCierre"
                      type="date"
                      value={editForm.fechaCierre}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          fechaCierre: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Monto actual: {formatCurrency(deal.monto)}</span>
                  <Button
                    size="sm"
                    onClick={handleSaveForm}
                    disabled={isSavingForm}
                  >
                    {isSavingForm ? 'Guardando…' : 'Guardar'}
                  </Button>
                </div>
              </section>

              <QuoteList
                dealId={deal.id}
                onMutate={() => {
                  onMutate();
                  void refresh();
                }}
              />

              <section>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Notas
                </h3>
                <div className="space-y-2">
                  <Textarea
                    rows={3}
                    placeholder="Escribí una nota…"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || isSavingNote}
                  >
                    {isSavingNote ? 'Guardando…' : 'Agregar nota'}
                  </Button>
                </div>
                <ul className="mt-3 space-y-2">
                  {deal.notes.length === 0 ? (
                    <li className="text-xs text-gray-400">Sin notas</li>
                  ) : (
                    deal.notes.map((note) => (
                      <li
                        key={note.id}
                        className="rounded border border-gray-200 bg-white p-2 text-sm"
                      >
                        <div className="mb-1 flex items-center justify-between text-[10px] text-gray-400">
                          <span>{formatDateTime(note.createdAt)}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="whitespace-pre-wrap text-gray-700">
                          {note.contenido}
                        </p>
                      </li>
                    ))
                  )}
                </ul>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Historial de etapas
                </h3>
                <ul className="space-y-1 text-xs">
                  {deal.history.length === 0 ? (
                    <li className="text-gray-400">Sin movimientos</li>
                  ) : (
                    deal.history.map((h) => (
                      <li
                        key={h.id}
                        className={cn(
                          'rounded border-l-2 bg-white px-2 py-1 text-gray-600',
                          h.reasonMotivo
                            ? 'border-amber-400'
                            : 'border-green-300',
                        )}
                      >
                        <span className="font-medium">
                          {h.fromStageNombre ?? '(creado)'}
                        </span>{' '}
                        → <span className="font-medium">{h.toStageNombre}</span>
                        {h.reasonMotivo && (
                          <span className="ml-1 text-amber-700">
                            ({h.reasonMotivo})
                          </span>
                        )}
                        <div className="text-[10px] text-gray-400">
                          {formatDateTime(h.movedAt)}
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </section>

              <section className="flex justify-between border-t border-gray-200 pt-4 text-xs text-gray-500">
                <div>
                  Creado: {formatDate(deal.createdAt)} · Actualizado:{' '}
                  {formatDate(deal.updatedAt)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteDeal}
                  className="text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </Button>
              </section>
            </div>

            <LeadFormDialog
              open={leadEditOpen}
              initial={deal.lead}
              onOpenChange={setLeadEditOpen}
              onSaved={() => {
                void refresh();
                onMutate();
              }}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
