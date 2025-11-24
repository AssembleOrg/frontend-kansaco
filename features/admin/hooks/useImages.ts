import { useState, useCallback, useEffect } from 'react';
import {
  uploadImage,
  uploadMultipleImages,
  listImages,
  deleteImage,
  ImageListItem,
  ImageListResponse,
} from '@/lib/api';

export function useImages(token: string | null) {
  const [images, setImages] = useState<ImageListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    hasMore: boolean;
    nextToken?: string;
    total: number;
  }>({
    page: 1,
    limit: 1000,
    hasMore: false,
    total: 0,
  });
  const [selectedPrefix, setSelectedPrefix] = useState<string>('');

  // Cargar imágenes
  const fetchImages = useCallback(
    async (prefix?: string, continuationToken?: string, append = false) => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await listImages(token, {
          limit: pagination.limit,
          prefix: prefix !== undefined ? prefix : selectedPrefix || undefined,
          continuationToken,
        });
        
        // Si no hay imágenes, no es un error, es un estado válido
        if (append && continuationToken) {
          // Agregar nuevas imágenes a las existentes
          setImages((prev) => [...prev, ...result.images]);
        } else {
          // Reemplazar imágenes
          setImages(result.images || []);
        }
        
        setPagination({
          page: result.page || 1,
          limit: result.limit || 20,
          hasMore: result.hasMore || false,
          nextToken: result.nextToken,
          total: result.total || 0,
        });
        
        // Limpiar error si la respuesta es exitosa (aunque esté vacía)
        setError(null);
      } catch (err) {
        console.error('Error loading images:', err);
        // Si hay un error, establecer lista vacía en lugar de romper la aplicación
        // Esto permite que la UI se muestre correctamente incluso cuando no hay imágenes
        setError(null); // No mostrar error para no romper la UI
        if (!append) {
          setImages([]);
        }
        // Establecer paginación por defecto
        setPagination({
          page: 1,
          limit: pagination.limit,
          hasMore: false,
          total: 0,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [token, pagination.limit, selectedPrefix]
  );

  // Cargar siguiente página
  const loadNextPage = useCallback(() => {
    if (pagination.hasMore && pagination.nextToken) {
      fetchImages(selectedPrefix, pagination.nextToken, true);
    }
  }, [pagination.hasMore, pagination.nextToken, selectedPrefix, fetchImages]);

  // Subir una imagen
  const uploadSingleImage = useCallback(
    async (file: File, folder?: string) => {
      if (!token) {
        throw new Error('Authentication required');
      }

      try {
        const result = await uploadImage(token, file, folder);
        // Recargar imágenes después de subir
        await fetchImages(selectedPrefix);
        return result;
      } catch (err) {
        console.error('Error uploading image:', err);
        throw err;
      }
    },
    [token, fetchImages, selectedPrefix]
  );

  // Subir múltiples imágenes
  const uploadMultiple = useCallback(
    async (files: File[], folder?: string) => {
      if (!token) {
        throw new Error('Authentication required');
      }

      try {
        const results = await uploadMultipleImages(token, files, folder);
        // Recargar imágenes después de subir
        await fetchImages(selectedPrefix);
        return results;
      } catch (err) {
        console.error('Error uploading images:', err);
        throw err;
      }
    },
    [token, fetchImages, selectedPrefix]
  );

  // Eliminar imagen
  const removeImage = useCallback(
    async (key: string) => {
      if (!token) {
        throw new Error('Authentication required');
      }

      try {
        await deleteImage(token, key);
        // Remover de la lista local
        setImages((prev) => prev.filter((img) => img.key !== key));
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
      } catch (err) {
        console.error('Error deleting image:', err);
        throw err;
      }
    },
    [token]
  );

  // Filtrar por prefijo
  const filterByPrefix = useCallback(
    (prefix: string) => {
      setSelectedPrefix(prefix);
      fetchImages(prefix);
    },
    [fetchImages]
  );

  // Cargar imágenes al montar o cambiar token
  useEffect(() => {
    if (token) {
      fetchImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return {
    images,
    isLoading,
    error,
    pagination,
    uploadSingleImage,
    uploadMultiple,
    removeImage,
    fetchImages,
    loadNextPage,
    filterByPrefix,
    selectedPrefix,
  };
}

