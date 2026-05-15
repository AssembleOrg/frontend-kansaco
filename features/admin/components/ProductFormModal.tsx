'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '@/types/product';
import {
  X,
  Loader2,
  Image as ImageIcon,
  GripVertical,
  Upload,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import ImageSelectionModal from './ImageSelectionModal';
import {
  ImageListItem,
  getProductImages,
  uploadImageWithProgress,
} from '@/lib/api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { getCategories } from '@/lib/api';
import { Category } from '@/types/category';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable image thumbnail component
function SortableImageItem({
  image,
  index,
  onRemove,
  disabled,
}: {
  image: ImageListItem;
  index: number;
  onRemove: (key: string) => void;
  disabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative overflow-hidden rounded-lg border-2 ${
        index === 0 ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="relative aspect-square bg-gray-100">
        <img
          src={image.url}
          alt={image.key}
          className="h-full w-full object-cover"
        />
        {/* Drag handle */}
        <button
          type="button"
          className="absolute left-1 top-1 cursor-grab rounded bg-black/50 p-0.5 text-white opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        {/* Remove button */}
        <button
          type="button"
          onClick={() => onRemove(image.key)}
          disabled={disabled}
          className="absolute right-1 top-1 rounded-full bg-red-500/80 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      {/* Position badge */}
      <div
        className={`absolute bottom-0 left-0 right-0 px-2 py-1 text-center text-xs font-medium text-white ${
          index === 0 ? 'bg-green-600/90' : 'bg-gray-600/70'
        }`}
      >
        {index === 0 ? 'Portada' : `#${index + 1}`}
      </div>
    </div>
  );
}

type UploadItem = {
  id: string;
  fileName: string;
  fileSize: number;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  errorMessage?: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ProductFormModalProps {
  product?: Product;
  onSubmit: (
    data: Omit<Product, 'id' | 'slug'>,
    selectedImages?: ImageListItem[],
    imagesLoaded?: boolean
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
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [imagesLoadFailed, setImagesLoadFailed] = useState(false);
  const [brokenImagesCount, setBrokenImagesCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Load categories
  useEffect(() => {
    if (token) {
      setIsLoadingCategories(true);
      getCategories(token)
        .then((categories) => setAvailableCategories(categories))
        .catch((err) => {
          console.error('Error loading categories:', err);
          toast.error('Error al cargar categorías', {
            description: 'No se pudieron cargar las categorías.',
          });
        })
        .finally(() => setIsLoadingCategories(false));
    }
  }, [token]);

  const loadProductImages = useCallback(
    (productId: number, signal?: AbortSignal) => {
      if (!token) return;
      setIsLoadingImages(true);
      setImagesLoadFailed(false);
      setImagesLoaded(false);
      getProductImages(token, productId, signal)
        .then((productImages) => {
          if (signal?.aborted) return;
          const imageListItems: ImageListItem[] = productImages.map((img) => ({
            key: img.imageKey,
            url: img.imageUrl,
            lastModified: img.createdAt,
            size: 0,
          }));
          const sorted = imageListItems.sort((a, b) => {
            const imgA = productImages.find((img) => img.imageKey === a.key);
            const imgB = productImages.find((img) => img.imageKey === b.key);
            if (imgA && imgB) {
              if (imgA.order !== imgB.order) return imgA.order - imgB.order;
              return imgA.id - imgB.id;
            }
            return 0;
          });
          const validImages = sorted.filter(
            (img) =>
              img.url && img.url.trim() !== '' && !img.url.includes('undefined')
          );
          const broken = sorted.length - validImages.length;
          if (broken > 0) {
            setBrokenImagesCount(broken);
            toast.warning(
              `Se encontraron ${broken} imagen${broken > 1 ? 'es' : ''} rota${broken > 1 ? 's' : ''}`,
              {
                description: 'Fueron removidas automáticamente de la lista.',
                duration: 5000,
              }
            );
          }
          setSelectedImages(validImages);
          setImagesLoaded(true);
        })
        .catch((err) => {
          if (err?.name === 'AbortError' || signal?.aborted) return;
          console.error('Error loading product images:', err);
          setImagesLoadFailed(true);
          setImagesLoaded(false);
        })
        .finally(() => {
          if (signal?.aborted) return;
          setIsLoadingImages(false);
        });
    },
    [token]
  );

  // Load product data and images
  useEffect(() => {
    if (product) {
      const categoryNames =
        product.categories && product.categories.length > 0
          ? product.categories.map((c) => c.name)
          : product.category ?? [];
      setFormData({
        ...product,
        name: product.name ?? '',
        sku: product.sku ?? '',
        slug: product.slug ?? '',
        category: categoryNames,
        description: product.description ?? '',
        presentation: product.presentation ?? '',
        aplication: product.aplication ?? '',
        wholeSaler: product.wholeSaler ?? '',
        price: product.price ?? 0,
        stock: product.stock ?? 0,
        imageUrl: product.imageUrl ?? '',
        isFeatured: product.isFeatured ?? false,
      });
      setBrokenImagesCount(0);
      setImagesLoadFailed(false);
      setImagesLoaded(false);

      if (product.id && token) {
        const controller = new AbortController();
        loadProductImages(product.id, controller.signal);
        return () => controller.abort();
      }
    } else {
      setSelectedImages([]);
      setBrokenImagesCount(0);
      setImagesLoadFailed(false);
      setImagesLoaded(true); // create flow: no images to load
    }
  }, [product, token, loadProductImages]);

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
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddCategory = () => {
    const trimmedCategory = categoryInput.trim();
    if (!trimmedCategory) return;
    if (formData.category.includes(trimmedCategory)) {
      toast.error('Esta categoría ya está asignada a este producto');
      setCategoryInput('');
      return;
    }
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

  // Drag & drop handler - reorder images (first = cover)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSelectedImages((prev) => {
      const oldIndex = prev.findIndex((img) => img.key === active.id);
      const newIndex = prev.findIndex((img) => img.key === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  // Remove image from selection
  const handleRemoveImage = (key: string) => {
    setSelectedImages((prev) => prev.filter((img) => img.key !== key));
  };

  const uploadingItems = uploadQueue.filter((it) => it.status === 'uploading');
  const batchProgressPercent =
    uploadingItems.length === 0
      ? 0
      : Math.round(
          uploadingItems.reduce((sum, it) => sum + it.progress, 0) /
            uploadingItems.length
        );

  const handleClose = useCallback(() => {
    if (isUploading) {
      const confirmed = window.confirm(
        'Hay imágenes subiendo. ¿Cancelar la subida y cerrar igualmente?'
      );
      if (!confirmed) return;
      uploadAbortRef.current?.abort();
    }
    onClose();
  }, [isUploading, onClose]);

  const dismissDoneItem = useCallback((id: string) => {
    window.setTimeout(() => {
      setUploadQueue((prev) => prev.filter((it) => it.id !== id));
    }, 1500);
  }, []);

  const handleDismissUploadItem = useCallback((id: string) => {
    setUploadQueue((prev) => prev.filter((it) => it.id !== id));
  }, []);

  // Inline file upload with REAL progress (xhr-based)
  const handleInlineUpload = useCallback(
    async (files: FileList | File[]) => {
      if (!token) return;

      const fileArray = Array.from(files);
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const validFiles: File[] = [];
      const invalidDetails: string[] = [];
      for (const f of fileArray) {
        if (!validTypes.includes(f.type)) {
          invalidDetails.push(`${f.name}: formato no permitido`);
        } else if (f.size > 10 * 1024 * 1024) {
          invalidDetails.push(`${f.name}: supera 10MB`);
        } else {
          validFiles.push(f);
        }
      }

      if (invalidDetails.length > 0) {
        toast.error(
          `${invalidDetails.length} archivo${invalidDetails.length > 1 ? 's' : ''} rechazado${invalidDetails.length > 1 ? 's' : ''}`,
          {
            description: invalidDetails.slice(0, 3).join(' · '),
          }
        );
      }

      if (validFiles.length === 0) return;

      // Create one queue entry per file BEFORE starting
      const entries = validFiles.map((file) => ({
        id:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
      }));
      setUploadQueue((prev) => [
        ...prev,
        ...entries.map(({ id, file }) => ({
          id,
          fileName: file.name,
          fileSize: file.size,
          progress: 0,
          status: 'uploading' as const,
        })),
      ]);

      // Shared AbortController for this batch — supports cancel-on-close
      const controller = new AbortController();
      uploadAbortRef.current = controller;
      setIsUploading(true);

      try {
        const newImages: ImageListItem[] = [];
        let succeeded = 0;
        let failed = 0;

        // Batches of 2 to respect backend throttle (3 req/2s)
        for (let i = 0; i < entries.length; i += 2) {
          if (controller.signal.aborted) break;
          const batch = entries.slice(i, i + 2);
          const results = await Promise.allSettled(
            batch.map(({ id, file }) =>
              uploadImageWithProgress(
                token,
                file,
                'products',
                (percent) => {
                  setUploadQueue((prev) =>
                    prev.map((it) =>
                      it.id === id ? { ...it, progress: percent } : it
                    )
                  );
                },
                controller.signal
              )
                .then((res) => ({ id, res }))
                .catch((err) => {
                  throw { id, err };
                })
            )
          );

          for (const result of results) {
            if (result.status === 'fulfilled') {
              const { id, res } = result.value;
              newImages.push({
                key: res.key,
                url: res.url,
                lastModified: res.lastModified,
                size: res.size,
              });
              succeeded += 1;
              setUploadQueue((prev) =>
                prev.map((it) =>
                  it.id === id ? { ...it, progress: 100, status: 'done' } : it
                )
              );
              dismissDoneItem(id);
            } else {
              const reason = result.reason as
                | { id: string; err: unknown }
                | undefined;
              if (reason && typeof reason === 'object' && 'id' in reason) {
                const err = reason.err;
                const isAbort =
                  err instanceof DOMException && err.name === 'AbortError';
                if (!isAbort) failed += 1;
                const message = isAbort
                  ? 'Cancelado'
                  : err instanceof Error
                    ? err.message
                    : 'Error al subir';
                setUploadQueue((prev) =>
                  prev.map((it) =>
                    it.id === reason.id
                      ? {
                          ...it,
                          status: isAbort ? 'error' : 'error',
                          errorMessage: message,
                        }
                      : it
                  )
                );
              } else {
                failed += 1;
              }
            }
          }
        }

        if (newImages.length > 0) {
          setSelectedImages((prev) => [...prev, ...newImages]);
        }

        if (succeeded > 0 && failed === 0) {
          toast.success(
            `${succeeded} imagen${succeeded > 1 ? 'es' : ''} subida${succeeded > 1 ? 's' : ''}`
          );
        } else if (succeeded > 0 && failed > 0) {
          toast.warning(
            `${succeeded} subida${succeeded > 1 ? 's' : ''}, ${failed} con error`
          );
        } else if (failed > 0) {
          toast.error(
            `No se pudo subir ${failed === 1 ? 'la imagen' : 'ninguna imagen'}`
          );
        }
      } finally {
        setIsUploading(false);
        uploadAbortRef.current = null;
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [token, dismissDoneItem]
  );

  // Drop zone handlers
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files.length > 0) {
        handleInlineUpload(e.dataTransfer.files);
      }
    },
    [handleInlineUpload]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Guardia: si estamos editando un producto, NO permitir guardar hasta que las
    // imágenes existentes hayan terminado de cargar o que la carga haya fallado y
    // el usuario sepa que tiene que reintentar. Sin esta guardia, selectedImages
    // puede estar vacío y el diff en handleEditProduct desasocia TODAS las imágenes.
    if (product?.id) {
      if (isLoadingImages) {
        toast.error('Esperá a que terminen de cargar las imágenes existentes', {
          description: 'Si guardás ahora se pueden perder las imágenes del producto.',
        });
        return;
      }
      if (imagesLoadFailed) {
        toast.error('No se pudieron cargar las imágenes del producto', {
          description: 'Reintentá la carga antes de guardar para no perder imágenes.',
        });
        return;
      }
    }

    if (!formData.name.trim()) {
      setError('El nombre del producto es requerido');
      return;
    }

    if (formData.sku.trim()) {
      const skuPattern = /^[a-zA-Z0-9_-]+$/;
      if (!skuPattern.test(formData.sku.trim())) {
        setError(
          'El SKU solo puede contener letras, números, guiones (-) y guiones bajos (_)'
        );
        return;
      }
    }

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
      const { slug, ...dataToSubmit } = formData;
      const submitData = { ...dataToSubmit, price: finalPrice };
      await onSubmit(submitData, selectedImages, imagesLoaded);
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
            onClick={handleClose}
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
              placeholder="Descripción del producto..."
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
                disabled={isLoading || isLoadingCategories}
              >
                <option value="">
                  {isLoadingCategories ? 'Cargando categorías...' : 'Seleccionar categoría...'}
                </option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                onClick={handleAddCategory}
                variant="outline"
                disabled={isLoading || !categoryInput || isLoadingCategories}
              >
                Agregar
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              También puedes escribir el nombre de una categoría nueva. Se creará automáticamente.
            </p>
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
            {/* <div>
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
            </div> */}
          </div>

          {/* ========== IMÁGENES - Sección inline mejorada ========== */}
          <div>
            <Label>Imágenes del Producto</Label>

            {/* Broken images warning */}
            {brokenImagesCount > 0 && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  {brokenImagesCount} imagen{brokenImagesCount > 1 ? 'es' : ''} rota
                  {brokenImagesCount > 1 ? 's' : ''} fue
                  {brokenImagesCount > 1 ? 'ron' : ''} removida
                  {brokenImagesCount > 1 ? 's' : ''} automáticamente.
                </span>
              </div>
            )}

            {/* Loading state */}
            {isLoadingImages && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando imágenes...
              </div>
            )}

            {/* Load failed banner */}
            {imagesLoadFailed && product?.id && (
              <div className="mt-3 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">
                    No se pudieron cargar las imágenes del producto.
                  </p>
                  <p className="text-xs text-red-600">
                    Reintentá antes de guardar para no perder las imágenes existentes.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => product?.id && loadProductImages(product.id)}
                  className="shrink-0"
                >
                  Reintentar
                </Button>
              </div>
            )}

            {/* Image grid with drag & drop */}
            {!isLoadingImages && selectedImages.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-500">
                  Arrastrá para reordenar. La primera imagen es la portada.
                </p>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedImages.map((img) => img.key)}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                      {selectedImages.map((img, index) => (
                        <SortableImageItem
                          key={img.key}
                          image={img}
                          index={index}
                          onRemove={handleRemoveImage}
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* Action buttons: gallery + upload */}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsImageModalOpen(true)}
                disabled={isLoading || isUploading}
                className="gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Elegir de galería
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploading}
                className="gap-2"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {isUploading
                  ? `Subiendo ${batchProgressPercent}%`
                  : 'Subir nueva'}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleInlineUpload(e.target.files);
                  }
                }}
              />
            </div>

            {/* Real-time upload progress list (xhr.upload.onprogress) */}
            {uploadQueue.length > 0 && (
              <div className="mt-3 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                {uploadQueue.map((item) => (
                  <div key={item.id} className="text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-gray-700">
                        {item.fileName}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-gray-500">
                          {formatBytes(item.fileSize)}
                        </span>
                        {item.status === 'uploading' && (
                          <span className="font-semibold text-green-700">
                            {item.progress}%
                          </span>
                        )}
                        {item.status === 'done' && (
                          <span className="font-semibold text-green-700">
                            ✓ Listo
                          </span>
                        )}
                        {item.status === 'error' && (
                          <button
                            type="button"
                            onClick={() => handleDismissUploadItem(item.id)}
                            className="rounded p-0.5 text-red-600 hover:bg-red-100"
                            aria-label="Descartar"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <Progress
                      value={
                        item.status === 'done'
                          ? 100
                          : item.status === 'error'
                            ? item.progress
                            : item.progress
                      }
                      className={`mt-1 h-1.5 ${
                        item.status === 'error' ? 'bg-red-100' : ''
                      }`}
                    />
                    {item.status === 'error' && item.errorMessage && (
                      <p className="mt-1 text-[11px] text-red-600">
                        {item.errorMessage}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Drop zone (shown when no images) */}
            {!isLoadingImages && selectedImages.length === 0 && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="mt-3 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-green-400 hover:bg-green-50/50"
              >
                <Plus className="mb-2 h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Arrastrá archivos acá, o usá los botones de arriba
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  JPEG, PNG, GIF, WEBP (máx. 10MB)
                </p>
              </div>
            )}
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
                setFormData((prev) => ({ ...prev, isVisible: checked as boolean }))
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
                setFormData((prev) => ({ ...prev, isFeatured: checked as boolean }))
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
            onClick={handleClose}
            variant="outline"
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              isUploading ||
              (!!product?.id && (isLoadingImages || imagesLoadFailed))
            }
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
