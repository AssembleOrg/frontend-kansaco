'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ImageUploadProps {
  onUpload: (file: File, folder?: string) => Promise<void>;
  onUploadMultiple: (files: File[], folder?: string) => Promise<void>;
  isLoading?: boolean;
}

export default function ImageUpload({
  onUpload,
  onUploadMultiple,
  isLoading = false,
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [folder, setFolder] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multipleFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Validar tipos de archivo
      const validFiles = files.filter((file) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        return validTypes.includes(file.type);
      });

      if (validFiles.length !== files.length) {
        alert('Algunos archivos no son imágenes válidas (JPEG, PNG, GIF, WEBP)');
      }

      // Validar tamaño (10MB)
      const sizeValidFiles = validFiles.filter((file) => {
        if (file.size > 10 * 1024 * 1024) {
          alert(`El archivo ${file.name} excede el tamaño máximo de 10MB`);
          return false;
        }
        return true;
      });

      setSelectedFiles((prev) => [...prev, ...sizeValidFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSingleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      await onUpload(selectedFiles[0], folder || undefined);
      setSelectedFiles([]);
      setFolder('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleMultipleUpload = async () => {
    if (selectedFiles.length === 0) return;

    if (selectedFiles.length > 20) {
      alert('Máximo 20 archivos por petición');
      return;
    }

    setIsUploading(true);
    try {
      await onUploadMultiple(selectedFiles, folder || undefined);
      setSelectedFiles([]);
      setFolder('');
      if (multipleFileInputRef.current) {
        multipleFileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error al subir las imágenes');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Subir Imágenes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Folder input */}
        <div className="space-y-2">
          <Label htmlFor="folder">Carpeta (opcional)</Label>
          <Input
            id="folder"
            placeholder="Ej: products, banners, etc."
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            disabled={isUploading || isLoading}
          />
        </div>

        {/* File inputs */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Subir una imagen</Label>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Validar tipo
                  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                  if (!validTypes.includes(file.type)) {
                    alert('El archivo debe ser una imagen válida (JPEG, PNG, GIF, WEBP)');
                    return;
                  }
                  // Validar tamaño
                  if (file.size > 10 * 1024 * 1024) {
                    alert('El archivo excede el tamaño máximo de 10MB');
                    return;
                  }
                  setSelectedFiles([file]);
                }
              }}
              disabled={isUploading || isLoading}
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <Label>Subir múltiples imágenes (máx. 20)</Label>
            <Input
              ref={multipleFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleFileSelect}
              disabled={isUploading || isLoading}
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* Selected files preview */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <Label>Archivos seleccionados ({selectedFiles.length})</Label>
            <div className="grid gap-2 max-h-48 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-2 text-sm"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <ImageIcon className="h-4 w-4 text-gray-500 shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-gray-500 shrink-0">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => handleRemoveFile(index)}
                    disabled={isUploading || isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Upload buttons */}
            <div className="flex gap-2 flex-wrap">
              {selectedFiles.length === 1 && (
                <Button
                  onClick={handleSingleUpload}
                  disabled={isUploading || isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Subir Imagen
                    </>
                  )}
                </Button>
              )}
              {selectedFiles.length > 1 && (
                <Button
                  onClick={handleMultipleUpload}
                  disabled={isUploading || isLoading || selectedFiles.length > 20}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Subir {selectedFiles.length} Imágenes
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

