'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface ProductFormModalProps {
  product?: Product;
  onSubmit: (data: Omit<Product, 'id'>) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export default function ProductFormModal({
  product,
  onSubmit,
  onClose,
  isLoading = false,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<
    Omit<Product, 'id'> & { price: number; stock: number; imageUrl: string }
  >({
    name: '',
    slug: '',
    sku: '',
    category: [],
    description: '',
    presentation: '',
    aplication: '',
    imageUrl: '',
    wholeSaler: '',
    stock: 0,
    isVisible: true,
    price: 0,
  });

  const [categoryInput, setCategoryInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        price: product.price ?? 0,
        stock: product.stock ?? 0,
        imageUrl: product.imageUrl ?? '',
      });
    }
  }, [product]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddCategory = () => {
    if (categoryInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        category: [...prev.category, categoryInput.trim()],
      }));
      setCategoryInput('');
    }
  };

  const handleRemoveCategory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      category: prev.category.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas
    if (!formData.name.trim()) {
      setError('El nombre del producto es requerido');
      return;
    }
    if (!formData.sku.trim()) {
      setError('El SKU es requerido');
      return;
    }
    if (formData.price <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al guardar el producto';
      setError(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">
            {product ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Nombre */}
          <div>
            <Label htmlFor="name">Nombre del Producto *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ej: Lubricante Industrial XYZ"
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* SKU */}
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="Ej: SKU-001"
                disabled={isLoading}
                required
              />
            </div>

            {/* Presentación */}
            <div>
              <Label htmlFor="presentation">Presentación</Label>
              <Input
                id="presentation"
                name="presentation"
                value={formData.presentation}
                onChange={handleInputChange}
                placeholder="Ej: 1L, 5L, 20L"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Descrip ción del producto..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Aplicación */}
          <div>
            <Label htmlFor="aplication">Aplicación</Label>
            <Input
              id="aplication"
              name="aplication"
              value={formData.aplication}
              onChange={handleInputChange}
              placeholder="Ej: Uso en máquinas textiles"
              disabled={isLoading}
            />
          </div>

          {/* Categorías */}
          <div>
            <Label>Categorías</Label>
            <div className="flex gap-2">
              <Input
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                placeholder="Nueva categoría..."
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddCategory}
                variant="outline"
                disabled={isLoading}
              >
                Agregar
              </Button>
            </div>
            {formData.category.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.category.map((cat, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(index)}
                      className="hover:text-blue-900"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Precio */}
            <div>
              <Label htmlFor="price">Precio *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                disabled={isLoading}
                required
              />
            </div>

            {/* Stock */}
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Imagen URL */}
          {/* <div>
            <Label htmlFor="imageUrl">URL de Imagen</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://..."
              disabled={isLoading}
            />
          </div> */}

          {/* Whole Saler */}
          <div>
            <Label htmlFor="wholeSaler">Mayorista</Label>
            <Input
              id="wholeSaler"
              name="wholeSaler"
              value={formData.wholeSaler}
              onChange={handleInputChange}
              placeholder="Nombre del mayorista"
              disabled={isLoading}
            />
          </div>

          {/* Visible */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="isVisible"
              name="isVisible"
              checked={formData.isVisible}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  isVisible: checked as boolean,
                }))
              }
              disabled={isLoading}
            />
            <Label htmlFor="isVisible" className="cursor-pointer">
              Visible en la tienda
            </Label>
          </div>

          {/* Slug (auto-generated, read-only) */}
          <div>
            <Label htmlFor="slug">Slug (auto-generado)</Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              disabled
              className="bg-gray-50 text-gray-600"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {product ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </div>
      </div>
    </div>
  );
}
