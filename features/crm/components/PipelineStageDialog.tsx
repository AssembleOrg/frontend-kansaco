'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { createPipelineStage, updatePipelineStage } from '@/lib/crmApi';
import type { PipelineStage, TerminalKind } from '@/types/crm';

interface PipelineStageDialogProps {
  open: boolean;
  initial: PipelineStage | null;
  defaultOrden: number;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function PipelineStageDialog({
  open,
  initial,
  defaultOrden,
  onOpenChange,
  onSaved,
}: PipelineStageDialogProps) {
  const { token } = useAuth();
  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState('#64748b');
  const [probability, setProbability] = useState<string>('0');
  const [orden, setOrden] = useState<string>('1');
  const [isTerminal, setIsTerminal] = useState(false);
  const [terminalKind, setTerminalKind] = useState<TerminalKind>('WON');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setNombre(initial?.nombre ?? '');
      setColor(initial?.color ?? '#64748b');
      setProbability(String(initial?.probability ?? 0));
      setOrden(String(initial?.orden ?? defaultOrden));
      setIsTerminal(initial?.isTerminal ?? false);
      setTerminalKind(initial?.terminalKind ?? 'WON');
    }
  }, [open, initial, defaultOrden]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!nombre.trim()) {
      toast.error('Nombre obligatorio');
      return;
    }
    const probNum = Number(probability);
    if (Number.isNaN(probNum) || probNum < 0 || probNum > 100) {
      toast.error('Probabilidad debe estar entre 0 y 100');
      return;
    }
    const ordenNum = Number(orden);
    if (Number.isNaN(ordenNum) || ordenNum < 1) {
      toast.error('Orden debe ser >= 1');
      return;
    }
    try {
      setIsSaving(true);
      const payload = {
        nombre: nombre.trim(),
        orden: ordenNum,
        color,
        probability: probNum,
        isTerminal,
        terminalKind: isTerminal ? terminalKind : null,
      };
      if (initial) {
        await updatePipelineStage(token, initial.id, payload);
        toast.success('Etapa actualizada');
      } else {
        await createPipelineStage(token, payload);
        toast.success('Etapa creada');
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error guardando');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar etapa' : 'Nueva etapa'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="orden">Orden</Label>
              <Input
                id="orden"
                type="number"
                min={1}
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="prob">Probabilidad (%)</Label>
              <Input
                id="prob"
                type="number"
                min={0}
                max={100}
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="color">Color</Label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-gray-300"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="terminal"
              checked={isTerminal}
              onCheckedChange={(v) => setIsTerminal(v === true)}
            />
            <Label htmlFor="terminal" className="text-sm font-normal">
              Es una etapa terminal (cierre del negocio)
            </Label>
          </div>
          {isTerminal && (
            <div>
              <Label htmlFor="kind">Tipo terminal</Label>
              <select
                id="kind"
                value={terminalKind}
                onChange={(e) =>
                  setTerminalKind(e.target.value as TerminalKind)
                }
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="WON">Ganada (WON)</option>
                <option value="LOST">Perdida (LOST)</option>
              </select>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando…' : initial ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
