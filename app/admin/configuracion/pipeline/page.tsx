'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, ChevronUp, ChevronDown, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  addTerminalReason,
  deleteTerminalReason,
  deletePipelineStage,
  getPipelineStages,
  reorderPipelineStages,
  updateTerminalReason,
} from '@/lib/crmApi';
import type { PipelineStage } from '@/types/crm';
import { PipelineStageDialog } from '@/features/crm/components/PipelineStageDialog';
import { PageHeader } from '@/features/crm/components/mobile/PageHeader';
import { RowActions } from '@/features/crm/components/mobile/RowActions';

export default function PipelineConfigPage() {
  const { token } = useAuth();
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PipelineStage | null>(null);
  const [newReason, setNewReason] = useState<Record<number, string>>({});
  const [editingReason, setEditingReason] = useState<{
    id: number;
    motivo: string;
  } | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await getPipelineStages(token);
      setStages(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error cargando etapas');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function moveStage(index: number, dir: -1 | 1) {
    if (!token) return;
    const next = [...stages];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await reorderPipelineStages(
        token,
        next.map((s) => s.id),
      );
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error reordenando');
    }
  }

  async function handleDeleteStage(stage: PipelineStage) {
    if (!token) return;
    if (
      !confirm(
        `¿Eliminar la etapa "${stage.nombre}"? No se puede borrar si tiene negocios.`,
      )
    )
      return;
    try {
      await deletePipelineStage(token, stage.id);
      toast.success('Etapa eliminada');
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error eliminando');
    }
  }

  async function handleAddReason(stageId: number) {
    if (!token) return;
    const motivo = (newReason[stageId] ?? '').trim();
    if (!motivo) return;
    try {
      await addTerminalReason(token, stageId, motivo);
      setNewReason((prev) => ({ ...prev, [stageId]: '' }));
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error agregando motivo');
    }
  }

  async function handleSaveReasonEdit() {
    if (!token || !editingReason) return;
    try {
      await updateTerminalReason(token, editingReason.id, {
        motivo: editingReason.motivo.trim(),
      });
      setEditingReason(null);
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error editando motivo');
    }
  }

  async function handleDeleteReason(reasonId: number) {
    if (!token) return;
    try {
      await deleteTerminalReason(token, reasonId);
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error eliminando motivo');
    }
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <PageHeader
        title="Configuración del pipeline"
        description="Etapas del kanban, su orden, color y probabilidad. En las etapas terminales se gestionan los motivos."
        actions={
          <Button
            onClick={openCreate}
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Plus className="mr-1 h-4 w-4" /> Nueva etapa
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <ul className="space-y-2">
          {stages.map((stage, index) => (
            <li
              key={stage.id}
              className="rounded-xl border border-neutral-200/70 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-4"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex flex-col">
                  <button
                    type="button"
                    aria-label="Subir"
                    disabled={index === 0}
                    onClick={() => moveStage(index, -1)}
                    className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Bajar"
                    disabled={index === stages.length - 1}
                    onClick={() => moveStage(index, 1)}
                    className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                <div
                  className="mt-2 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: stage.color }}
                  aria-hidden="true"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[15px] font-semibold tracking-tight text-neutral-900">
                      {stage.nombre}
                    </h3>
                    <span className="text-[12px] tabular-nums text-neutral-500">
                      {stage.probability}%
                    </span>
                    {stage.isTerminal && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          stage.terminalKind === 'WON'
                            ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                            : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                        }`}
                      >
                        {stage.terminalKind === 'WON' ? 'Ganada' : 'Perdida'}
                      </span>
                    )}
                  </div>

                  {stage.isTerminal && (
                    <div className="mt-3 rounded-lg bg-neutral-50 p-3">
                      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                        Motivos
                      </p>
                      <ul className="mb-3 space-y-1.5">
                        {stage.reasons.length === 0 ? (
                          <li className="text-[12px] text-neutral-400">
                            Sin motivos. Agregá al menos uno para poder cerrar
                            negocios en esta etapa.
                          </li>
                        ) : (
                          stage.reasons.map((reason) => (
                            <li
                              key={reason.id}
                              className="flex items-center gap-2 text-sm transition-opacity"
                            >
                              {editingReason?.id === reason.id ? (
                                <>
                                  <Input
                                    value={editingReason.motivo}
                                    onChange={(e) =>
                                      setEditingReason({
                                        ...editingReason,
                                        motivo: e.target.value,
                                      })
                                    }
                                    className="h-8 flex-1"
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    aria-label="Guardar"
                                    onClick={handleSaveReasonEdit}
                                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-green-600 hover:bg-green-50"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label="Cancelar"
                                    onClick={() => setEditingReason(null)}
                                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-200/60"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="flex-1 truncate text-neutral-700">
                                    {reason.motivo}
                                  </span>
                                  <button
                                    type="button"
                                    aria-label="Editar motivo"
                                    onClick={() =>
                                      setEditingReason({
                                        id: reason.id,
                                        motivo: reason.motivo,
                                      })
                                    }
                                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-700"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label="Eliminar motivo"
                                    onClick={() => handleDeleteReason(reason.id)}
                                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-red-400 hover:bg-red-50 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                            </li>
                          ))
                        )}
                      </ul>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Nuevo motivo (ej: Precio)"
                          value={newReason[stage.id] ?? ''}
                          onChange={(e) =>
                            setNewReason({
                              ...newReason,
                              [stage.id]: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              void handleAddReason(stage.id);
                            }
                          }}
                          className="h-9 flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddReason(stage.id)}
                          className="shrink-0"
                        >
                          Agregar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <RowActions
                  onEdit={() => {
                    setEditing(stage);
                    setDialogOpen(true);
                  }}
                  onDelete={() => handleDeleteStage(stage)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* FAB nueva etapa (mobile) */}
      <button
        type="button"
        onClick={openCreate}
        aria-label="Nueva etapa"
        className="fab-bottom fixed right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg shadow-green-600/30 transition-transform active:scale-95 sm:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>

      <PipelineStageDialog
        open={dialogOpen}
        initial={editing}
        defaultOrden={stages.length + 1}
        onOpenChange={setDialogOpen}
        onSaved={refresh}
      />
    </div>
  );
}
