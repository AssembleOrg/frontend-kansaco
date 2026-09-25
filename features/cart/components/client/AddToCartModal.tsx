'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Product } from '@/types/product';
import { Minus, Package, Plus, ShoppingCart } from 'lucide-react';
import { useBultos } from '@/features/cart/hooks/useBultos';
import { describirBultos, pasoBulto, splitPresentations, tieneSueltas } from '@/lib/bultos';

interface AddToCartModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (quantity: number, presentation: string) => void;
}

export const AddToCartModal = ({
  product,
  open,
  onOpenChange,
  onConfirm,
}: AddToCartModalProps) => {
  const presentations = useMemo(
    () => splitPresentations(product.presentation),
    [product.presentation]
  );
  const [selectedPresentation, setSelectedPresentation] = useState<string>(
    presentations[0] ?? ''
  );
  const [quantity, setQuantity] = useState(1);

  const bultosPorPres = useBultos([product.id], open)[product.id];
  const bultos = bultosPorPres?.[selectedPresentation] ?? [];
  const paso = pasoBulto(bultos);
  const desglose = describirBultos(quantity, bultos);

  // Al abrir o cambiar de presentación: arrancar en 1 bulto (o 1 unidad si no tiene).
  useEffect(() => {
    if (open) setQuantity(paso);
  }, [open, selectedPresentation, paso]);

  // Al cerrar: volver a la primera presentación.
  useEffect(() => {
    if (!open) setSelectedPresentation(presentations[0] ?? '');
  }, [open, presentations]);

  const handleConfirm = () => {
    if (quantity <= 0) return;
    if (presentations.length > 0 && !selectedPresentation) return;
    onConfirm(quantity, selectedPresentation);
    onOpenChange(false);
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setQuantity(numValue);
    } else if (value === '') {
      setQuantity(1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Agregar al carrito
          </DialogTitle>
          <DialogDescription>
            Selecciona la presentación y cantidad para {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Selector de presentación */}
          {presentations.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="presentation">Presentación</Label>
              <select
                id="presentation"
                value={selectedPresentation}
                onChange={(e) => setSelectedPresentation(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 hover:border-gray-400"
              >
                {presentations.map((pres) => (
                  <option key={pres} value={pres}>
                    {pres}
                  </option>
                ))}
              </select>
            </div>
          )}

          {presentations.length === 0 && (
            <p className="text-sm text-gray-500">
              Este producto no tiene presentaciones disponibles.
            </p>
          )}

          {/* Cantidad (siempre en unidades; los bultos suman de a bulto) */}
          <div className="grid gap-2">
            <Label htmlFor="quantity">
              Cantidad {bultos.length > 0 && <span className="font-normal text-gray-500">(unidades)</span>}
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Restar ${paso}`}
                onClick={() => setQuantity((q) => Math.max(paso, q - paso))}
                disabled={quantity <= paso}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                inputMode="numeric"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-full text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Sumar ${paso}`}
                onClick={() => setQuantity((q) => q + paso)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {bultos.length > 0 && (
              <>
                <div className="flex flex-wrap gap-2">
                  {bultos.map((b) => (
                    <Button
                      key={b.nombre}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity((q) => q + b.unidades)}
                    >
                      <Package className="mr-1 h-3.5 w-3.5" />+ {b.nombre}
                    </Button>
                  ))}
                </div>
                <p
                  className={`text-sm ${
                    tieneSueltas(quantity, bultos) ? 'text-amber-700' : 'text-green-700'
                  }`}
                  aria-live="polite"
                >
                  {quantity} u. = {desglose}
                  {tieneSueltas(quantity, bultos) &&
                    '. Se vende por bulto cerrado: te vamos a contactar para ajustar.'}
                </p>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={quantity <= 0 || (presentations.length > 0 && !selectedPresentation)}
            className="bg-green-600 hover:bg-green-700"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Agregar al carrito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
