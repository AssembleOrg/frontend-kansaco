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

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Configuración del pipeline
          </h1>
          <p className="text-sm text-gray-500">
            Etapas del kanban, su orden, color y probabilidad. En las etapas
            terminales se gestionan los motivos.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" /> Nueva etapa
        </Button>
      </header>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <ul className="space-y-2">
          {stages.map((stage, index) => (
            <li
              key={stage.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    title="Subir"
                    disabled={index === 0}
                    onClick={() => moveStage(index, -1)}
                    className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Bajar"
                    disabled={index === stages.length - 1}
                    onClick={() => moveStage(index, 1)}
                    className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                <div
                  className="mt-1 h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: stage.color }}
                  aria-hidden="true"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {stage.nombre}
                    </h3>
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {stage.probability}%
                    </span>
                    {stage.isTerminal && (
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          stage.terminalKind === 'WON'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {stage.terminalKind === 'WON' ? 'Ganada' : 'Perdida'}
                      </span>
                    )}
                  </div>

                  {stage.isTerminal && (
                    <div className="mt-3 rounded-md bg-gray-50 p-3">
                      <p className="mb-2 text-xs font-medium uppercase text-gray-600">
                        Motivos
                      </p>
                      <ul className="mb-3 space-y-1">
                        {stage.reasons.length === 0 ? (
                          <li className="text-xs text-gray-400">
                            Sin motivos. Agregá al menos uno para poder cerrar
                            negocios en esta etapa.
                          </li>
                        ) : (
                          stage.reasons.map((reason) => (
                            <li
                              key={reason.id}
                              className="flex items-center gap-2 text-sm"
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
                                    className="h-7 flex-1"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleSaveReasonEdit}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingReason(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="flex-1">{reason.motivo}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingReason({
                                        id: reason.id,
                                        motivo: reason.motivo,
                                      })
                                    }
                                    className="text-gray-400 hover:text-gray-700"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteReason(reason.id)}
                                    className="text-red-400 hover:text-red-700"
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
                          className="h-8 flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddReason(stage.id)}
                        >
                          Agregar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Editar"
                    onClick={() => {
                      setEditing(stage);
                      setDialogOpen(true);
                    }}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Eliminar"
                    onClick={() => handleDeleteStage(stage)}
                    className="rounded p-1.5 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

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
