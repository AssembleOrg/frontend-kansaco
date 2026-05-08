'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import type { TerminalReason } from '@/types/crm';

interface DealStageReasonDialogProps {
  open: boolean;
  stageNombre: string;
  reasons: TerminalReason[];
  onCancel: () => void;
  onConfirm: (reasonId: number) => void;
}

export function DealStageReasonDialog({
  open,
  stageNombre,
  reasons,
  onCancel,
  onConfirm,
}: DealStageReasonDialogProps) {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setSelected(reasons[0]?.id ?? null);
    }
  }, [open, reasons]);

  return (
    <ResponsiveDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <ResponsiveDialogContent className="sm:max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Mover a {stageNombre}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Seleccioná un motivo para registrar el cambio de etapa.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="space-y-2 py-4">
          {reasons.length === 0 ? (
            <p className="text-sm text-gray-500">
              Esta etapa terminal no tiene motivos configurados. Agregá motivos
              en Configuración → Pipeline.
            </p>
          ) : (
            reasons.map((reason) => (
              <label
                key={reason.id}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 p-3 hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason.id}
                  checked={selected === reason.id}
                  onChange={() => setSelected(reason.id)}
                  className="h-4 w-4"
                />
                <span className="text-sm">{reason.motivo}</span>
              </label>
            ))
          )}
        </div>

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            disabled={selected === null}
            onClick={() => selected !== null && onConfirm(selected)}
          >
            Confirmar
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
