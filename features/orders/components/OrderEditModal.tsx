'use client';

import React, { useState, useEffect } from 'react';
import { Order, UpdateOrderDto, OrderItem } from '@/types/order';
import { Product } from '@/types';
import { updateOrder, validateOrderForEdit } from '@/lib/api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Minus, Trash2, Package } from 'lucide-react';

interface OrderEditModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function OrderEditModal({
  order,
  isOpen,
  onClose,
  onSuccess,
}: OrderEditModalProps) {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Datos básicos
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Datos para mayoristas
  const [cuit, setCuit] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [situacionAfip, setSituacionAfip] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');

  // Productos de la orden
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const isMayorista = order.customerType === 'CLIENTE_MAYORISTA';

  // Inicializar formulario con datos de la orden
  useEffect(() => {
    if (order && isOpen) {
      setFullName(order.contactInfo?.fullName || '');
      setEmail(order.contactInfo?.email || '');
      setPhone(order.contactInfo?.phone || '');
      setAddress(order.contactInfo?.address || '');
      setNotes(order.notes || '');

      // Inicializar items
      setOrderItems(order.items || []);

      if (isMayorista && order.businessInfo) {
        setCuit(order.businessInfo.cuit || '');
        setRazonSocial(order.businessInfo.razonSocial || '');
        setSituacionAfip(order.businessInfo.situacionAfip || '');
        setCodigoPostal(order.businessInfo.codigoPostal || '');
      }
    }
  }, [order, isOpen, isMayorista]);

  const validateCUIT = (cuitValue: string): boolean => {
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
    return cuitRegex.test(cuitValue);
  };

  const handleCuitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    if (value.length <= 2) {
      setCuit(value);
    } else if (value.length <= 10) {
      setCuit(`${value.substring(0, 2)}-${value.substring(2)}`);
    } else {
      setCuit(
        `${value.substring(0, 2)}-${value.substring(2, 10)}-${value.substring(10)}`
      );
    }
  };

  const validatePhone = (phoneValue: string): boolean => {
    const phoneDigits = phoneValue.replace(/\D/g, '');
    return phoneDigits.length >= 8;
  };

  // Handlers para gestión de productos
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updated = [...orderItems];
    updated[index].quantity = newQuantity;
    setOrderItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (orderItems.length === 1) {
      toast.error('No puedes eliminar todos los productos', {
        description: 'La orden debe tener al menos un producto.',
        duration: 5000,
      });
      return;
    }
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleAddProduct = (product: Product) => {
    // Verificar si el producto ya está en la orden
    const existingItemIndex = orderItems.findIndex(
      (item) => item.productId === product.id
    );

    if (existingItemIndex !== -1) {
      // Si ya existe, incrementar la cantidad
      const updated = [...orderItems];
      updated[existingItemIndex].quantity += 1;
      setOrderItems(updated);
      toast.success('Cantidad actualizada', {
        description: `Se incrementó la cantidad de ${product.name}`,
        duration: 3000,
      });
    } else {
      // Si no existe, agregarlo
      setOrderItems([
        ...orderItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          presentation: product.presentation || undefined,
          unitPrice: product.price || undefined,
        },
      ]);
      toast.success('Producto agregado', {
        description: `${product.name} se agregó a la orden`,
        duration: 3000,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('No estás autenticado');
      return;
    }

    // Validar campos requeridos
    if (!fullName || !email || !phone || !address) {
      toast.error('Campos requeridos incompletos', {
        description:
          'Por favor, completa todos los campos de información de contacto.',
        duration: 5000,
      });
      return;
    }

    if (!validatePhone(phone)) {
      toast.error('Teléfono inválido', {
        description: 'El teléfono debe tener al menos 8 dígitos.',
        duration: 5000,
      });
      return;
    }

    // Validar que haya al menos un producto
    if (orderItems.length === 0) {
      toast.error('No hay productos en la orden', {
        description: 'Debes agregar al menos un producto a la orden.',
        duration: 5000,
      });
      return;
    }

    // Validar datos mayoristas si aplica
    if (isMayorista) {
      if (!cuit || !situacionAfip) {
        toast.error('Datos fiscales incompletos', {
          description:
            'Por favor, completa los datos fiscales requeridos (CUIT y Situación AFIP).',
          duration: 5000,
        });
        return;
      }

      if (!validateCUIT(cuit)) {
        toast.error('CUIT inválido', {
          description: 'El formato del CUIT no es válido. Debe ser XX-XXXXXXXX-X',
          duration: 5000,
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const updateData: UpdateOrderDto = {
        contactInfo: {
          fullName,
          email,
          phone,
          address,
        },
        items: orderItems,
        notes,
      };

      if (isMayorista) {
        updateData.businessInfo = {
          cuit,
          razonSocial,
          situacionAfip,
          codigoPostal,
        };
      }

      await updateOrder(token, order.id, updateData);

      toast.success('Orden actualizada correctamente', {
        description: 'Los cambios se han guardado exitosamente.',
        duration: 3000,
      });

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('Error al actualizar orden:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error al actualizar la orden', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Orden</DialogTitle>
          <DialogDescription>
            Modifica los datos de tu orden. Solo puedes editar órdenes pendientes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información de Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información de Contacto</h3>

            <div>
              <Label htmlFor="edit-fullName">Nombre completo *</Label>
              <Input
                id="edit-fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="edit-email">Email (no editable)</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                disabled={true}
                className="bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                El email no se puede cambiar. Es el email con el que te registraste.
              </p>
            </div>

            <div>
              <Label htmlFor="edit-phone">Teléfono *</Label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: 1136585581"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="edit-address">Dirección de envío *</Label>
              <Textarea
                id="edit-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle, número, localidad, provincia"
                required
                disabled={isSubmitting}
                rows={3}
              />
            </div>
          </div>

          {/* Información Fiscal (solo mayoristas) */}
          {isMayorista && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información Fiscal</h3>

              <div>
                <Label htmlFor="edit-cuit">CUIT *</Label>
                <Input
                  id="edit-cuit"
                  value={cuit}
                  onChange={handleCuitChange}
                  placeholder="XX-XXXXXXXX-X"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="edit-razonSocial">Razón Social</Label>
                <Input
                  id="edit-razonSocial"
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="edit-situacionAfip">Situación ante AFIP *</Label>
                <select
                  id="edit-situacionAfip"
                  value={situacionAfip}
                  onChange={(e) => setSituacionAfip(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Seleccionar...</option>
                  <option value="No Inscripto">No Inscripto</option>
                  <option value="Monotributista">Monotributista</option>
                  <option value="Responsable Inscripto">
                    Responsable Inscripto
                  </option>
                  <option value="Persona Jurídica">Persona Jurídica</option>
                </select>
              </div>

              <div>
                <Label htmlFor="edit-codigoPostal">Código Postal</Label>
                <Input
                  id="edit-codigoPostal"
                  value={codigoPostal}
                  onChange={(e) => setCodigoPostal(e.target.value)}
                  placeholder="Ej: 1888"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {/* Productos del Pedido */}
          <div className="space-y-4">
            <Separator />
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Productos del Pedido</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  // ✅ VALIDAR que la orden sigue siendo editable
                  if (token) {
                    const validation = await validateOrderForEdit(token, order.id);

                    if (!validation.valid) {
                      toast.error(
                        validation.reason?.includes('not found')
                          ? 'Esta orden ya no existe'
                          : `Esta orden no puede ser editada (estado: ${order.status})`
                      );
                      onClose();
                      onSuccess(); // Refresh parent
                      return;
                    }
                  }

                  // Guardar contexto completo de edición
                  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                  console.log('📋 [OrderEditModal] GUARDANDO ORDEN EN LOCALSTORAGE');
                  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                  console.log('🆔 Order ID:', {
                    value: order.id,
                    type: typeof order.id,
                    length: order.id.length,
                    firstChars: order.id.slice(0, 10),
                    lastChars: order.id.slice(-10)
                  });
                  console.log('📦 Order Items Count:', orderItems.length);
                  console.log('🔑 Token presente:', !!token);
                  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

                  localStorage.setItem('editingOrderId', order.id);
                  localStorage.setItem('editMode', 'true');

                  // Guardar items actuales de la orden (estado local del modal)
                  localStorage.setItem('editingOrderItems', JSON.stringify(orderItems));

                  // Cerrar modal antes de redirigir
                  onClose();

                  // Redirigir a productos
                  window.location.href = '/productos';
                }}
                disabled={isSubmitting}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar más productos
              </Button>
            </div>

            {orderItems.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500 font-medium">No hay productos en el pedido</p>
                <p className="text-sm text-gray-400 mt-1">
                  Haz click en &quot;Agregar Producto&quot; para añadir items
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {orderItems.map((item, index) => (
                  <div
                    key={`${item.productId}-${index}`}
                    className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 bg-white"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.productName}
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-1">
                        {item.presentation && (
                          <span className="flex items-center gap-1">
                            {item.presentation}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(index, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isSubmitting}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(index, parseInt(e.target.value) || 1)
                          }
                          className="w-16 text-center h-8"
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(index, item.quantity + 1)}
                          disabled={isSubmitting}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                      onClick={() => handleRemoveItem(index)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Total de unidades */}
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Total:</span>{' '}
                    {orderItems.reduce((acc, item) => acc + item.quantity, 0)} unidades en{' '}
                    {orderItems.length} producto{orderItems.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <Label htmlFor="edit-notes">Notas adicionales</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Información adicional sobre tu pedido..."
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
