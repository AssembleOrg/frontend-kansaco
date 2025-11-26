'use client';

import { useState, useEffect } from 'react';
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
import { ShoppingCart } from 'lucide-react';

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
  const [quantity, setQuantity] = useState(1);
  const [selectedPresentation, setSelectedPresentation] = useState<string>('');

  // Parsear las presentaciones del producto
  const presentations = product.presentation
    ? product.presentation
        .split(',')
        .map((pres) => pres.trim())
        .filter((pres) => pres.length > 0)
    : [];

  // Establecer la primera presentación como predeterminada cuando se abre el modal
  useEffect(() => {
    if (open && presentations.length > 0 && !selectedPresentation) {
      setSelectedPresentation(presentations[0]);
    }
  }, [open, presentations, selectedPresentation]);

  // Resetear cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      setQuantity(1);
      if (presentations.length > 0) {
        setSelectedPresentation(presentations[0]);
      } else {
        setSelectedPresentation('');
      }
    }
  }, [open, presentations]);

  const handleConfirm = () => {
    if (quantity <= 0) {
      return;
    }
    if (presentations.length > 0 && !selectedPresentation) {
      return;
    }
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
            Selecciona la cantidad y presentación para {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Selector de cantidad */}
          <div className="grid gap-2">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-full"
            />
          </div>

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
                {presentations.map((pres, index) => (
                  <option key={index} value={pres}>
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

