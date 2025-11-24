'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Loader2, Search, Check, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { ImageListItem } from '@/lib/api';
import { useImages } from '@/features/admin/hooks/useImages';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface ImageSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (selectedImages: ImageListItem[]) => void;
  initialSelected?: ImageListItem[];
}

export default function ImageSelectionModal({
  open,
  onOpenChange,
  onSelect,
  initialSelected = [],
}: ImageSelectionModalProps) {
  const { token } = useAuth();
  const {
    images,
    isLoading,
    pagination,
    loadNextPage,
    filterByPrefix,
    selectedPrefix,
  } = useImages(token ?? null);

  const [selectedImages, setSelectedImages] = useState<ImageListItem[]>(initialSelected);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrefix, setFilterPrefix] = useState('');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastImageElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && pagination.hasMore) {
          loadNextPage();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [isLoading, pagination.hasMore, loadNextPage]
  );

  // Filtrar imágenes por término de búsqueda
  const filteredImages = images.filter((img) => {
    const searchLower = searchTerm.toLowerCase();
    return img.key.toLowerCase().includes(searchLower);
  });

  // Inicializar selección cuando cambia initialSelected
  useEffect(() => {
    if (open && initialSelected.length > 0) {
      setSelectedImages(initialSelected);
    }
  }, [open, initialSelected]);

  // Resetear cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setFilterPrefix('');
      if (selectedPrefix) {
        filterByPrefix('');
      }
    }
  }, [open, selectedPrefix, filterByPrefix]);

  const handleToggleImage = (image: ImageListItem) => {
    setSelectedImages((prev) => {
      const isSelected = prev.some((img) => img.key === image.key);
      if (isSelected) {
        return prev.filter((img) => img.key !== image.key);
      } else {
        return [...prev, image];
      }
    });
  };

  const handleFilterChange = (prefix: string) => {
    setFilterPrefix(prefix);
    filterByPrefix(prefix);
  };

  const handleConfirm = () => {
    onSelect(selectedImages);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedImages(initialSelected);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Seleccionar Imágenes</h2>
            <p className="mt-1 text-sm text-gray-600">
              {selectedImages.length > 0
                ? `${selectedImages.length} imagen${selectedImages.length > 1 ? 'es' : ''} seleccionada${selectedImages.length > 1 ? 's' : ''}`
                : 'Selecciona imágenes para el producto'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="border-b border-gray-200 p-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nombre de archivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <Input
                placeholder="Filtrar por carpeta..."
                value={filterPrefix}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="pr-8"
              />
              {filterPrefix && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
                  onClick={() => handleFilterChange('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Images Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && images.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              {searchTerm || filterPrefix
                ? 'No se encontraron imágenes con los filtros aplicados'
                : 'No hay imágenes disponibles'}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredImages.map((image, index) => {
                const isSelected = selectedImages.some((img) => img.key === image.key);
                const selectionIndex = selectedImages.findIndex((img) => img.key === image.key);
                const isLast = index === filteredImages.length - 1;

                return (
                  <div
                    key={image.key}
                    ref={isLast ? lastImageElementRef : null}
                    className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-green-300'
                    }`}
                    onClick={() => handleToggleImage(image)}
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-gray-100">
                      <Image
                        src={image.url}
                        alt={image.key}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 200px"
                      />
                      {/* Overlay */}
                      <div
                        className={`absolute inset-0 transition-colors ${
                          isSelected ? 'bg-green-600/20' : 'bg-black/0 group-hover:bg-black/10'
                        }`}
                      />
                    </div>

                    {/* Selection Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white shadow-lg">
                        <span className="text-sm font-bold">{selectionIndex + 1}</span>
                      </div>
                    )}

                    {/* Check Icon */}
                    {isSelected && (
                      <div className="absolute bottom-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white">
                        <Check className="h-4 w-4" />
                      </div>
                    )}

                    {/* Image Info */}
                    <div className="p-2">
                      <p className="truncate text-xs text-gray-600" title={image.key}>
                        {image.key.split('/').pop()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Loading More Indicator */}
          {isLoading && images.length > 0 && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 p-6">
          <div className="text-sm text-gray-600">
            {selectedImages.length > 0 && (
              <div className="space-y-1">
                <p className="font-medium">
                  Orden de selección: {selectedImages.map((img, idx) => idx + 1).join(', ')}
                </p>
                <p className="text-xs text-gray-500">
                  La primera imagen será la portada del producto
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-green-600 hover:bg-green-700"
              disabled={selectedImages.length === 0}
            >
              Confirmar ({selectedImages.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

