'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartItem } from '@/types';
import { useCartStore } from '../../store/cartStore';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CartItemCardProps {
  item: CartItem;
}

const DEBOUNCE_MS = 350;

export const CartItemCard = ({ item }: CartItemCardProps) => {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);

  const { product, quantity, presentation } = item;

  // Optimistic local quantity. Synced from props but updated instantly on +/-.
  const [localQty, setLocalQty] = useState<number>(quantity);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedRef = useRef<number>(quantity);

  // Sync optimistic state when the actual cart quantity changes from outside
  // (e.g. server response) and we have no pending debounce.
  useEffect(() => {
    if (debounceRef.current === null) {
      setLocalQty(quantity);
      lastSyncedRef.current = quantity;
    }
  }, [quantity]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const flush = (next: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      if (next !== lastSyncedRef.current) {
        lastSyncedRef.current = next;
        updateQuantity(product.id, next, presentation);
      }
    }, DEBOUNCE_MS);
  };

  const handleIncrease = () => {
    const next = localQty + 1;
    setLocalQty(next);
    flush(next);
  };

  const handleDecrease = () => {
    if (localQty <= 1) {
      setConfirmOpen(true);
      return;
    }
    const next = localQty - 1;
    setLocalQty(next);
    flush(next);
  };

  const handleRemove = () => setConfirmOpen(true);

  const confirmRemove = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setConfirmOpen(false);
    removeFromCart(product.id, presentation);
  };

  return (
    <>
      <div className="group relative flex gap-3 rounded-xl border border-neutral-200 bg-white p-3 transition-shadow hover:shadow-sm">
        <Link
          href={`/productos/${product.slug}`}
          className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50"
        >
          <Image
            src={product.imageUrl || '/sauberatras.jpg'}
            alt={product.name}
            fill
            sizes="80px"
            className="object-contain p-1"
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/productos/${product.slug}`}
              className="line-clamp-2 text-sm font-medium leading-snug text-neutral-800 hover:text-green-700"
            >
              {product.name}
            </Link>
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Eliminar del carrito"
              className="rounded-md p-1.5 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {product.sku && (
              <span className="text-[11px] text-neutral-500">SKU {product.sku}</span>
            )}
            {presentation && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
                {presentation}
              </span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between pt-2">
            <div
              className="inline-flex items-center rounded-full border border-neutral-200 bg-white"
              role="group"
              aria-label="Cantidad"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleDecrease}
                aria-label="Disminuir cantidad"
                className="h-8 w-8 rounded-full text-neutral-600 hover:bg-neutral-100"
              >
                <Minus size={14} />
              </Button>
              <span
                aria-live="polite"
                className="min-w-[1.5rem] text-center text-sm font-semibold tabular-nums text-neutral-800"
              >
                {localQty}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleIncrease}
                aria-label="Aumentar cantidad"
                className="h-8 w-8 rounded-full text-neutral-600 hover:bg-neutral-100"
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Eliminar producto</DialogTitle>
            <DialogDescription>
              ¿Querés quitar <span className="font-medium">{product.name}</span> del carrito?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmRemove}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
