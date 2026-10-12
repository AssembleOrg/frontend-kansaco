'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ORDER_STATUS_LABEL, OrderStatus } from '@/types/order';

interface OrderStatusConfirmProps {
  orderId: string;
  /** Etapa a la que se quiere pasar; null = cerrado. */
  status: OrderStatus | null;
  isSubmitting?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

/**
 * Confirmación antes de mover un pedido de etapa: el cambio le avisa al
 * cliente (mail + campanita), así que un clic de más no pasa de largo.
 * Cancelar no pasa por acá: usa OrderNoteModal, que además pide el motivo.
 */
export function OrderStatusConfirm({
  orderId,
  status,
  isSubmitting = false,
  onConfirm,
  onClose,
}: OrderStatusConfirmProps) {
  return (
    <Dialog open={!!status} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            ¿Pasar el pedido a {status ? ORDER_STATUS_LABEL[status] : ''}?
          </DialogTitle>
          <DialogDescription>
            Pedido #{orderId.slice(0, 8).toUpperCase()}.{' '}
            {status === 'PENDIENTE'
              ? 'Vuelve a quedar editable. No se le avisa al cliente.'
              : 'Se le avisa al cliente por mail y en la web.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Volver
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
