'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface OrderNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Nota actual de la orden (para prellenar en modo edición). */
  initialNotes?: string;
  /** Modo cancelación: exige un motivo (el backend lo anexa a la nota interna). */
  mode: 'cancel' | 'note';
  isSubmitting?: boolean;
  /** En modo 'cancel' recibe el motivo escrito; en modo 'note', el texto completo de la nota. */
  onConfirm: (text: string) => void | Promise<void>;
}

export function OrderNoteModal({
  open,
  onOpenChange,
  initialNotes,
  mode,
  isSubmitting = false,
  onConfirm,
}: OrderNoteModalProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Reinicia el campo cada vez que se abre.
  useEffect(() => {
    if (open) {
      setValue(mode === 'note' ? initialNotes || '' : '');
      setError(null);
    }
  }, [open, mode, initialNotes]);

  const isCancel = mode === 'cancel';

  const handleConfirm = async () => {
    if (isCancel && !value.trim()) {
      setError('Ingresá el motivo de la cancelación.');
      return;
    }
    await onConfirm(value.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isCancel ? 'Cancelar orden' : 'Nota interna'}
          </DialogTitle>
          <DialogDescription>
            {isCancel
              ? 'Indicá por qué se cancela. Queda en la nota interna; el cliente no lo ve.'
              : 'Agregá o editá la nota interna de esta orden. Solo la ve el equipo de Kansaco.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="order-note">
            {isCancel ? 'Motivo' : 'Nota'}
          </Label>
          <Textarea
            id="order-note"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            placeholder={
              isCancel
                ? 'Ej: el cliente no confirmó la compra…'
                : 'Ej: coordinar entrega para el jueves…'
            }
            rows={4}
            disabled={isSubmitting}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cerrar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={isCancel ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isCancel ? 'Confirmar cancelación' : 'Guardar nota'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
