'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { X, Loader2, Image as ImageIcon, ArrowUpToLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import ImageSelectionModal from './ImageSelectionModal';
import {
  ImageListItem,
  getProductImages,
  setProductImageAsPrimary,
} from '@/lib/api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { ALLOWED_PRODUCT_CATEGORIES } from '@/lib/constants';

interface ProductFormModalProps {
  product?: Product;
  onSubmit: (
    data: Omit<Product, 'id' | 'slug'>,
    selectedImages?: ImageListItem[]
  ) => Promise<void>;
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
    isFeatured: false,
    price: 0,
  });

  const { token } = useAuth();
  const [categoryInput, setCategoryInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<ImageListItem[]>([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        name: product.name ?? '',
        sku: product.sku ?? '',
        slug: product.slug ?? '',
        description: product.description ?? '',
        presentation: product.presentation ?? '',
        aplication: product.aplication ?? '',
        wholeSaler: product.wholeSaler ?? '',
        price: product.price ?? 0,
        stock: product.stock ?? 0,
        imageUrl: product.imageUrl ?? '',
        isFeatured: product.isFeatured ?? false,
      });

      // Cargar imágenes existentes del producto
      if (product.id && token) {
        setIsLoadingImages(true);
        getProductImages(token, product.id)
          .then((productImages) => {
            // Convertir ProductImage[] a ImageListItem[]
            const imageListItems: ImageListItem[] = productImages.map(
              (img) => ({
                key: img.imageKey,
                url: img.imageUrl,
                lastModified: img.createdAt,
                size: 0, // No tenemos el tamaño en ProductImage
              })
            );
            // Ordenar por order y luego por id
            const sorted = imageListItems.sort((a, b) => {
              const imgA = productImages.find((img) => img.imageKey === a.key);
              const imgB = productImages.find((img) => img.imageKey === b.key);
              if (imgA && imgB) {
                if (imgA.order !== imgB.order) {
                  return imgA.order - imgB.order;
                }
                return imgA.id - imgB.id;
              }
              return 0;
            });
            setSelectedImages(sorted);
          })
          .catch((err) => {
            console.error('Error loading product images:', err);
          })
          .finally(() => {
            setIsLoadingImages(false);
          });
      }
    } else {
      // Resetear imágenes al crear nuevo producto
      setSelectedImages([]);
    }
  }, [product, token]);

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
    const trimmedCategory = categoryInput.trim();

    // Validación: campo vacío
    if (!trimmedCategory) return;

    // Validación: duplicados
    if (formData.category.includes(trimmedCategory)) {
      toast.error('Esta categoría ya está asignada a este producto');
      setCategoryInput('');
      return;
    }

    // Agregar categoría
    setFormData((prev) => ({
      ...prev,
      category: [...prev.category, trimmedCategory],
    }));
    setCategoryInput('');
  };

  const handleRemoveCategory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      category: prev.category.filter((_, i) => i !== index),
    }));
  };
  //Lo agregado para el upload de portada.
  const handleSetAsPrimary = async (imageKey: string) => {
    if (!token || !product) return;

    const loadingToast = toast.loading('Cambiando portada...');

    try {
      const allImages = await getProductImages(token, product.id);
      const targetImage = allImages.find((img) => img.imageKey === imageKey);

      if (!targetImage) {
        toast.dismiss(loadingToast);
        toast.error('Imagen no encontrada', {
          description: 'No se pudo encontrar la imagen seleccionada',
          duration: 4000,
        });
        return;
      }

      await setProductImageAsPrimary(token, product.id, targetImage.id);

      setSelectedImages((prevImages) => {
        const targetIndex = prevImages.findIndex((img) => img.key === imageKey);
        if (targetIndex === -1) return prevImages;
        const newImages = [...prevImages];
        const [movedImage] = newImages.splice(targetIndex, 1);
        newImages.unshift(movedImage);

        return newImages;
      });
      toast.dismiss(loadingToast);
      toast.success('Portada cambiada', {
        description: 'Esta imagen ahora es la portada del producto',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error setting primary image:', error);

      toast.dismiss(loadingToast);

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al cambiar la portada';

      toast.error('Error al cambiar portada', {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas
    if (!formData.name.trim()) {
      setError('El nombre del producto es requerido');
      return;
    }

    // Validar formato de SKU si se proporciona
    if (formData.sku.trim()) {
      const skuPattern = /^[a-zA-Z0-9_-]+$/;
      if (!skuPattern.test(formData.sku.trim())) {
        setError(
          'El SKU solo puede contener letras, números, guiones (-) y guiones bajos (_)'
        );
        return;
      }
    }

    // Convertir precio a número y validar
    const priceValue =
      typeof formData.price === 'string'
        ? parseFloat(formData.price)
        : formData.price;
    const finalPrice = isNaN(priceValue) || priceValue <= 0 ? 1 : priceValue;

    if (finalPrice <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }

    try {
      // Preparar datos sin slug (este no debe enviarse al backend, el id ya no está en formData)
      const { slug, ...dataToSubmit } = formData;
      const submitData = {
        ...dataToSubmit,
        price: finalPrice,
      };

      await onSubmit(submitData, selectedImages);
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
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="Ej: PROD-123 (letras, números, - y _)"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Solo letras, números, guiones (-) y guiones bajos (_)
              </p>
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
              <select
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                <option value="">Seleccionar categoría...</option>
                {ALLOWED_PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                onClick={handleAddCategory}
                variant="outline"
                disabled={isLoading || !categoryInput}
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

          {/* Selección de Imágenes */}
          <div>
            <Label>Imágenes del Producto</Label>
            <div className="mt-2 space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsImageModalOpen(true)}
                disabled={isLoading}
                className="w-full gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                {selectedImages.length > 0
                  ? `Editar Imágenes (${selectedImages.length} seleccionada${selectedImages.length > 1 ? 's' : ''})`
                  : 'Seleccionar Imágenes'}
              </Button>

              {selectedImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {selectedImages.length} imagen
                    {selectedImages.length > 1 ? 'es' : ''} seleccionada
                    {selectedImages.length > 1 ? 's' : ''}
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {selectedImages.map((img, index) => (
                      <div
                        key={img.key}
                        className="group relative overflow-hidden rounded-lg border-2 border-gray-200"
                      >
                        <div className="relative aspect-square bg-gray-100">
                          <img
                            src={img.url}
                            alt={img.key}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                          {index + 1}
                        </div>
                        {index === 0 ? (
                          <div className="absolute bottom-0 left-0 right-0 bg-green-600/90 px-2 py-1 text-center text-xs font-medium text-white">
                            Portada
                          </div>
                        ) : (
                          product && (
                            <button
                              onClick={() => handleSetAsPrimary(img.key)}
                              className="absolute bottom-1 right-1 rounded-full bg-white/90 p-1.5 opacity-0 shadow-md transition-all hover:scale-110 hover:bg-white group-hover:opacity-100"
                              title="Establecer como imagen de portada"
                              type="button"
                            >
                              <ArrowUpToLine className="h-4 w-4 text-green-600" />
                            </button>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    La primera imagen será la portada del producto. Las demás
                    aparecerán en el carrusel de detalles.
                  </p>
                </div>
              )}
            </div>
          </div>

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

          {/* Destacado */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="isFeatured"
              name="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  isFeatured: checked as boolean,
                }))
              }
              disabled={isLoading}
            />
            <Label htmlFor="isFeatured" className="cursor-pointer">
              Destacar producto en página principal
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

      {/* Image Selection Modal */}
      <ImageSelectionModal
        open={isImageModalOpen}
        onOpenChange={setIsImageModalOpen}
        onSelect={setSelectedImages}
        initialSelected={selectedImages}
      />
    </div>
  );
}
