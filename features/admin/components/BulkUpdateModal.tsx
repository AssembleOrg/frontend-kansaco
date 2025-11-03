'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product } from '@/types/product';
import { formatPrice } from '@/lib/utils';
import { X } from 'lucide-react';

interface BulkUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProducts: Product[];
  onApply: (updateType: 'percentage' | 'fixed', operator: 'increase' | 'decrease', value: number) => void;
  isLoading?: boolean;
}

export default function BulkUpdateModal({
  open,
  onOpenChange,
  selectedProducts,
  onApply,
  isLoading,
}: BulkUpdateModalProps) {
  const [updateType, setUpdateType] = useState<'percentage' | 'fixed'>('percentage');
  const [operator, setOperator] = useState<'increase' | 'decrease'>('increase');
  const [value, setValue] = useState('');

  const handleApply = () => {
    if (!value || isNaN(Number(value))) {
      alert('Por favor ingresa un valor válido');
      return;
    }
    onApply(updateType, operator, Number(value));
  };

  // Calcular preview de cambios
  const previewChanges = selectedProducts.map((product) => {
    const currentPrice = product.price ?? 0;
    let newPrice = currentPrice;

    if (updateType === 'percentage') {
      const change = (currentPrice * Number(value)) / 100;
      newPrice = operator === 'increase' ? currentPrice + change : currentPrice - change;
    } else {
      const change = Number(value);
      newPrice = operator === 'increase' ? currentPrice + change : currentPrice - change;
    }

    return {
      id: product.id,
      name: product.name,
      oldPrice: currentPrice,
      newPrice: Math.max(0, newPrice), // No permitir precios negativos
    };
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Actualizar Precios
            </h2>
            <p className="text-sm text-gray-600">
              {selectedProducts.length} producto{selectedProducts.length !== 1 ? 's' : ''} seleccionado{selectedProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Tipo de actualización */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Tipo de actualización
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="updateType"
                  value="percentage"
                  checked={updateType === 'percentage'}
                  onChange={(e) => setUpdateType(e.target.value as 'percentage' | 'fixed')}
                  className="rounded border-gray-300"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-700">Por porcentaje (%)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="updateType"
                  value="fixed"
                  checked={updateType === 'fixed'}
                  onChange={(e) => setUpdateType(e.target.value as 'percentage' | 'fixed')}
                  className="rounded border-gray-300"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-700">Monto fijo ($)</span>
              </label>
            </div>
          </div>

          {/* Operación */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Operación
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="operator"
                  value="increase"
                  checked={operator === 'increase'}
                  onChange={(e) => setOperator(e.target.value as 'increase' | 'decrease')}
                  className="rounded border-gray-300"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-green-700 font-medium">Aumentar</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="operator"
                  value="decrease"
                  checked={operator === 'decrease'}
                  onChange={(e) => setOperator(e.target.value as 'increase' | 'decrease')}
                  className="rounded border-gray-300"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-red-700 font-medium">Disminuir</span>
              </label>
            </div>
          </div>

          {/* Valor */}
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-900 mb-2">
              Valor ({updateType === 'percentage' ? '%' : '$'})
            </label>
            <Input
              id="value"
              type="number"
              placeholder={`Ingresa el ${updateType === 'percentage' ? 'porcentaje' : 'monto'}`}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              min="0"
              step={updateType === 'percentage' ? '0.1' : '1'}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          {/* Preview */}
          {value && !isNaN(Number(value)) && Number(value) > 0 && (
            <div className="space-y-3 rounded-lg bg-gray-50 p-4">
              <h3 className="font-semibold text-sm text-gray-900">Preview de cambios:</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {previewChanges.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm border-b border-gray-200 pb-2 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-gray-600">{formatPrice(item.oldPrice)}</span>
                      <span className="text-gray-400">→</span>
                      <span className={`font-medium ${operator === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPrice(item.newPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumen */}
          {value && !isNaN(Number(value)) && Number(value) > 0 && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
              <p className="text-sm text-blue-900">
                {selectedProducts.length} producto{selectedProducts.length !== 1 ? 's' : ''} será{selectedProducts.length !== 1 ? 'n' : ''} {operator === 'increase' ? 'aumentado' : 'disminuido'} en {value}
                {updateType === 'percentage' ? '%' : '$'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApply}
            disabled={!value || isNaN(Number(value)) || Number(value) <= 0 || isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Aplicando...' : 'Aplicar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
}
