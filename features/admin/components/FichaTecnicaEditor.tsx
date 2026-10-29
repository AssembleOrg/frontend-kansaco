'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Eye, FileText, Loader2, RefreshCw, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  deleteTechnicalSheet,
  TechnicalSheetInfo,
  uploadTechnicalSheet,
} from '@/lib/api';
import TechnicalSheetViewer from '@/features/products/components/client/TechnicalSheetViewer';

const MAX_BYTES = 20 * 1024 * 1024;

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  token: string | null;
  /** Sin id (alta) la ficha se sube después de guardar. */
  productId?: number;
  productName: string;
  initial?: TechnicalSheetInfo | null;
  disabled?: boolean;
}

/**
 * Ficha técnica (PDF) del producto. Se sube y se quita al instante, sin
 * esperar a "Guardar": el archivo va a su propio endpoint.
 */
export function FichaTecnicaEditor({
  token,
  productId,
  productName,
  initial,
  disabled,
}: Props) {
  const [sheet, setSheet] = useState<TechnicalSheetInfo | null>(initial ?? null);
  const [progress, setProgress] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = progress !== null || isDeleting;

  const upload = async (file: File | undefined) => {
    if (!file || !token || !productId) return;
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      toast.error('La ficha técnica tiene que ser un PDF');
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error('El PDF no puede superar los 20 MB', {
        description: `Este pesa ${formatBytes(file.size)}.`,
      });
      return;
    }
    setProgress(0);
    try {
      const info = await uploadTechnicalSheet(token, productId, file, setProgress);
      setSheet(info);
      setConfirmDelete(false);
      toast.success(sheet ? 'Ficha técnica reemplazada' : 'Ficha técnica cargada');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo subir la ficha técnica');
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async () => {
    if (!token || !productId) return;
    setIsDeleting(true);
    try {
      await deleteTechnicalSheet(token, productId);
      setSheet(null);
      toast.success('Ficha técnica quitada');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo quitar la ficha técnica');
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const pick = () => inputRef.current?.click();

  return (
    <div data-testid="ficha-tecnica-editor">
      <Label>Ficha técnica (PDF)</Label>
      <p className="mt-0.5 text-xs text-neutral-500">
        La ven los clientes logueados en la página del producto. Máx. 20 MB.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => upload(e.target.files?.[0])}
        data-testid="ficha-input"
      />

      {!productId ? (
        <p className="mt-3 rounded-lg border border-dashed border-neutral-300 px-3 py-3 text-xs text-neutral-500">
          Guardá el producto primero y después adjuntá la ficha técnica.
        </p>
      ) : progress !== null ? (
        <div className="mt-3 space-y-2 rounded-lg border border-neutral-200 px-3 py-3">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Subiendo… {progress}%
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      ) : sheet ? (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
            <FileText className="h-5 w-5 shrink-0 text-red-600" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-800" title={sheet.name} data-testid="ficha-nombre">
                {sheet.name}
              </p>
              {sheet.size ? (
                <p className="text-xs text-neutral-500">{formatBytes(sheet.size)}</p>
              ) : null}
            </div>
          </div>

          {confirmDelete ? (
            <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-xs text-red-700">¿Quitar la ficha técnica? Los clientes dejan de verla.</p>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="destructive" onClick={remove} disabled={busy}>
                  {isDeleting ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
                  Quitar
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setConfirmDelete(false)} disabled={busy}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              <Button type="button" size="sm" variant="outline" onClick={() => setIsPreviewOpen(true)} disabled={disabled || busy}>
                <Eye className="mr-1 h-3.5 w-3.5" />
                Ver
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={pick} disabled={disabled || busy}>
                <RefreshCw className="mr-1 h-3.5 w-3.5" />
                Reemplazar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setConfirmDelete(true)}
                disabled={disabled || busy}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Quitar
              </Button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={disabled || busy}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            upload(e.dataTransfer.files?.[0]);
          }}
          className={`mt-3 flex w-full flex-col items-center gap-1 rounded-lg border-2 border-dashed px-3 py-4 text-center text-xs transition-colors disabled:opacity-50 ${
            isDragging
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-neutral-300 text-neutral-500 hover:border-green-400 hover:text-green-700'
          }`}
        >
          <Upload className="h-5 w-5" />
          <span className="font-medium">Subir PDF</span>
          <span>o arrastralo acá</span>
        </button>
      )}

      {isPreviewOpen && token && productId && sheet && (
        <TechnicalSheetViewer
          productId={productId}
          productName={productName}
          fileName={sheet.name}
          token={token}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}
