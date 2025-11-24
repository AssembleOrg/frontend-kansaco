'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Copy, Loader2, Search, Filter, X } from 'lucide-react';
import Image from 'next/image';
import { ImageListItem } from '@/lib/api';

interface ImageGalleryProps {
  images: ImageListItem[];
  isLoading: boolean;
  onDelete: (key: string) => Promise<void>;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onFilterChange?: (prefix: string) => void;
  selectedPrefix?: string;
}

export default function ImageGallery({
  images,
  isLoading,
  onDelete,
  onLoadMore,
  hasMore = false,
  onFilterChange,
  selectedPrefix = '',
}: ImageGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrefix, setFilterPrefix] = useState(selectedPrefix);
  const [deletingKeys, setDeletingKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleDelete = async (key: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta imagen?')) {
      return;
    }

    setDeletingKeys((prev) => new Set(prev).add(key));
    try {
      await onDelete(key);
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error al eliminar la imagen');
    } finally {
      setDeletingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const handleCopyUrl = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFilterChange = (prefix: string) => {
    setFilterPrefix(prefix);
    onFilterChange?.(prefix);
  };

  const handleClearFilter = () => {
    setFilterPrefix('');
    onFilterChange?.('');
  };

  // Filtrar imágenes por término de búsqueda
  const filteredImages = images.filter((img) => {
    const searchLower = searchTerm.toLowerCase();
    return img.key.toLowerCase().includes(searchLower);
  });

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nombre de archivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Filtrar por carpeta..."
                  value={filterPrefix}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="pl-10 pr-8"
                />
                {filterPrefix && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
                    onClick={handleClearFilter}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
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
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredImages.map((image) => {
                const isDeleting = deletingKeys.has(image.key);
                const isCopied = copiedKey === image.key;

                return (
                  <div
                    key={image.key}
                    className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-gray-100">
                      <Image
                        src={image.url}
                        alt={image.key}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 20vw, 200px"
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                    </div>

                    {/* Actions */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(image.key)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                        onClick={() => handleCopyUrl(image.url, image.key)}
                        title="Copiar URL"
                      >
                        {isCopied ? (
                          <span className="text-xs">✓</span>
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Image info */}
                    <div className="p-2">
                      <p className="truncate text-xs text-gray-600" title={image.key}>
                        {image.key.split('/').pop()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(image.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls - Always Visible */}
            <div className="mt-6 flex flex-col items-center gap-4">
              {onLoadMore ? (
                <Button
                  onClick={onLoadMore}
                  disabled={isLoading || !hasMore}
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando...
                    </>
                  ) : hasMore ? (
                    'Cargar más imágenes'
                  ) : (
                    'No hay más imágenes'
                  )}
                </Button>
              ) : (
                <div className="text-sm text-gray-500">
                  Paginación no disponible
                </div>
              )}
            </div>

            {/* Results count */}
            <div className="mt-4 text-center text-sm text-gray-500">
              {searchTerm || filterPrefix
                ? `Mostrando ${filteredImages.length} de ${images.length} imágenes`
                : `Total: ${images.length} imágenes`}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

