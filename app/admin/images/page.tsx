'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useImages } from '@/features/admin/hooks/useImages';
import { ImageInUseError } from '@/lib/api';
import ImageUpload from '@/features/admin/components/ImageUpload';
import ImageGallery from '@/features/admin/components/ImageGallery';

export default function ImagesPage() {
  const { token } = useAuth();
  const {
    images,
    isLoading,
    error,
    pagination,
    uploadSingleImage,
    uploadMultiple,
    removeImage,
    loadNextPage,
    filterByPrefix,
    selectedPrefix,
  } = useImages(token ?? null);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isUploading) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isUploading]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpload = async (file: File, folder?: string) => {
    setIsUploading(true);
    try {
      await uploadSingleImage(file, folder);
      showToast('Imagen subida correctamente', 'success');
    } catch (error) {
      showToast('Error al subir la imagen', 'error');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadMultiple = async (files: File[], folder?: string) => {
    setIsUploading(true);
    try {
      await uploadMultiple(files, folder);
      showToast(`${files.length} imágenes subidas correctamente`, 'success');
    } catch (error) {
      showToast('Error al subir las imágenes', 'error');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (key: string) => {
    try {
      await removeImage(key);
      showToast('Imagen eliminada correctamente', 'success');
    } catch (error) {
      if (error instanceof ImageInUseError) {
        showToast(
          'No se puede borrar: la imagen está en uso por uno o más productos.',
          'error'
        );
        return;
      }
      showToast('Error al eliminar la imagen', 'error');
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Gestión de Imágenes
        </h1>
        <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
          Sube, visualiza y gestiona las imágenes de tu web
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Upload Section */}
      <ImageUpload
        onUpload={handleUpload}
        onUploadMultiple={handleUploadMultiple}
        isLoading={isLoading}
      />

      {/* Gallery Section */}
      <ImageGallery
        images={images}
        isLoading={isLoading}
        onDelete={handleDelete}
        onLoadMore={loadNextPage}
        hasMore={pagination.hasMore}
        onFilterChange={filterByPrefix}
        selectedPrefix={selectedPrefix}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 rounded-lg p-4 text-sm font-medium text-white shadow-lg ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
