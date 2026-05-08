'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { createQuote, updateQuote } from '@/lib/crmApi';
import { getProducts } from '@/lib/api';
import type { Quote, QuoteItemInput } from '@/types/crm';
import type { Product } from '@/types/product';
import { formatCurrency } from '@/features/crm/utils';

interface QuoteFormDialogProps {
  open: boolean;
  dealId: number;
  initial: Quote | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

interface DraftItem {
  productId: number | null;
  productName: string;
  presentation: string;
  cantidad: string;
  precioUnitario: string;
}

export function QuoteFormDialog({
  open,
  dealId,
  initial,
  onOpenChange,
  onSaved,
}: QuoteFormDialogProps) {
  const { token } = useAuth();
  const [items, setItems] = useState<DraftItem[]>([]);
  const [titulo, setTitulo] = useState('');
  const [iva, setIva] = useState('21');
  const [validoHasta, setValidoHasta] = useState('');
  const [formaPago, setFormaPago] = useState('Transferencia Bancaria');
  const [notas, setNotas] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const readOnly = initial?.estado === 'ACEPTADO';

  useEffect(() => {
    if (!open || !token) return;
    void getProducts(token).then(setProducts).catch(() => {});
  }, [open, token]);

  useEffect(() => {
    if (open) {
      if (initial) {
        setTitulo(initial.titulo ?? '');
        setIva(initial.ivaPorcentaje);
        setValidoHasta(initial.validoHasta ?? '');
        setFormaPago(initial.formaPago);
        setNotas(initial.notas ?? '');
        setItems(
          initial.items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            presentation: i.presentation ?? '',
            cantidad: i.cantidad,
            precioUnitario: i.precioUnitario,
          })),
        );
      } else {
        setTitulo('');
        setIva('21');
        setValidoHasta('');
        setFormaPago('Transferencia Bancaria');
        setNotas('');
        setItems([]);
      }
      setProductSearch('');
      setPickerOpen(false);
    }
  }, [open, initial]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products.slice(0, 30);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q),
      )
      .slice(0, 30);
  }, [products, productSearch]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, it) => {
      const c = Number(it.cantidad) || 0;
      const p = Number(it.precioUnitario) || 0;
      return acc + c * p;
    }, 0);
    const ivaPct = Number(iva) || 0;
    const ivaMonto = (subtotal * ivaPct) / 100;
    const total = subtotal + ivaMonto;
    return { subtotal, ivaMonto, total };
  }, [items, iva]);

  function addItemFromProduct(p: Product) {
    setItems((prev) => [
      ...prev,
      {
        productId: p.id,
        productName: p.name,
        presentation: p.presentation,
        cantidad: '1',
        precioUnitario: String(p.price ?? 0),
      },
    ]);
    setPickerOpen(false);
    setProductSearch('');
  }

  function addEmptyItem() {
    setItems((prev) => [
      ...prev,
      {
        productId: null,
        productName: '',
        presentation: '',
        cantidad: '1',
        precioUnitario: '0',
      },
    ]);
  }

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!token) return;
    if (items.length === 0) {
      toast.error('Agregá al menos un item');
      return;
    }
    const itemPayload: QuoteItemInput[] = items.map((it, idx) => ({
      productId: it.productId ?? undefined,
      productName: it.productName.trim() || undefined,
      presentation: it.presentation.trim() || undefined,
      cantidad: it.cantidad,
      precioUnitario: it.precioUnitario,
      orden: idx,
    }));
    try {
      setIsSaving(true);
      if (initial) {
        await updateQuote(token, initial.id, {
          titulo: titulo.trim() || undefined,
          ivaPorcentaje: iva,
          validoHasta: validoHasta || undefined,
          formaPago,
          notas: notas.trim() || undefined,
          items: itemPayload,
        });
        toast.success('Presupuesto actualizado');
      } else {
        await createQuote(token, {
          dealId,
          titulo: titulo.trim() || undefined,
          ivaPorcentaje: iva,
          validoHasta: validoHasta || undefined,
          formaPago,
          notas: notas.trim() || undefined,
          items: itemPayload,
        });
        toast.success('Presupuesto creado');
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
      <DialogContent className="flex max-h-[92vh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {initial
              ? `Presupuesto ${initial.numero}`
              : 'Nuevo presupuesto'}
          </DialogTitle>
          <DialogDescription>
            {readOnly
              ? 'Este presupuesto está ACEPTADO y no se puede modificar.'
              : 'Cargá items del catálogo o líneas libres. El monto del negocio se sincroniza automáticamente.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <Label htmlFor="qtitulo">Título (opcional)</Label>
              <Input
                id="qtitulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div>
              <Label htmlFor="qiva">IVA (%)</Label>
              <Input
                id="qiva"
                type="number"
                min={0}
                max={100}
                value={iva}
                onChange={(e) => setIva(e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div>
              <Label htmlFor="qvalido">Válido hasta</Label>
              <Input
                id="qvalido"
                type="date"
                value={validoHasta}
                onChange={(e) => setValidoHasta(e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="qpago">Forma de pago</Label>
              <Input
                id="qpago"
                value={formaPago}
                onChange={(e) => setFormaPago(e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Items</h3>
              {!readOnly && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setPickerOpen((v) => !v)}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Producto del catálogo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addEmptyItem}
                  >
                    Línea libre
                  </Button>
                </div>
              )}
            </div>

            {pickerOpen && !readOnly && (
              <div className="mb-2 rounded-md border border-gray-200 bg-gray-50 p-2">
                <div className="mb-2 flex items-center gap-2">
                  <Input
                    placeholder="Buscar producto…"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setPickerOpen(false)}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto rounded border border-gray-200 bg-white">
                  {filteredProducts.length === 0 ? (
                    <p className="p-3 text-center text-xs text-gray-400">
                      Sin resultados
                    </p>
                  ) : (
                    filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => addItemFromProduct(p)}
                        className="flex w-full items-center justify-between border-b border-gray-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-gray-50"
                      >
                        <span className="min-w-0 flex-1 truncate">
                          <span className="font-medium">{p.name}</span>{' '}
                          <span className="text-xs text-gray-500">
                            {p.presentation}
                          </span>
                        </span>
                        <span className="ml-2 text-xs text-gray-600">
                          {formatCurrency(p.price ?? 0)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500">
                  <tr>
                    <th className="py-1 text-left">Producto</th>
                    <th className="py-1 text-left">Presentación</th>
                    <th className="w-20 py-1 text-right">Cant.</th>
                    <th className="w-28 py-1 text-right">Precio</th>
                    <th className="w-28 py-1 text-right">Subtotal</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 text-center text-xs text-gray-400"
                      >
                        Sin items
                      </td>
                    </tr>
                  ) : (
                    items.map((it, i) => {
                      const sub =
                        (Number(it.cantidad) || 0) *
                        (Number(it.precioUnitario) || 0);
                      return (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="py-1 pr-2">
                            <Input
                              value={it.productName}
                              onChange={(e) =>
                                updateItem(i, { productName: e.target.value })
                              }
                              disabled={readOnly}
                              className="h-8"
                            />
                          </td>
                          <td className="py-1 pr-2">
                            <Input
                              value={it.presentation}
                              onChange={(e) =>
                                updateItem(i, { presentation: e.target.value })
                              }
                              disabled={readOnly}
                              className="h-8"
                            />
                          </td>
                          <td className="py-1 pr-2 text-right">
                            <Input
                              type="number"
                              step="0.01"
                              value={it.cantidad}
                              onChange={(e) =>
                                updateItem(i, { cantidad: e.target.value })
                              }
                              disabled={readOnly}
                              className="h-8 text-right"
                            />
                          </td>
                          <td className="py-1 pr-2 text-right">
                            <Input
                              type="number"
                              step="0.01"
                              value={it.precioUnitario}
                              onChange={(e) =>
                                updateItem(i, {
                                  precioUnitario: e.target.value,
                                })
                              }
                              disabled={readOnly}
                              className="h-8 text-right"
                            />
                          </td>
                          <td className="py-1 pr-2 text-right text-gray-700">
                            {formatCurrency(sub)}
                          </td>
                          <td className="py-1 text-right">
                            {!readOnly && (
                              <button
                                type="button"
                                onClick={() => removeItem(i)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <Label htmlFor="qnotas">Notas / condiciones</Label>
            <Textarea
              id="qnotas"
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              disabled={readOnly}
            />
          </div>

          <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                IVA ({Number(iva) || 0}%)
              </span>
              <span>{formatCurrency(totals.ivaMonto)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-gray-200 pt-1 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cerrar
          </Button>
          {!readOnly && (
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Guardando…' : initial ? 'Guardar' : 'Crear'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
