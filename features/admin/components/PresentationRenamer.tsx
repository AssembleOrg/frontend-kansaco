'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Pencil, X } from 'lucide-react';
import { renamePresentation } from '@/lib/api';
import { splitPresentations } from '@/lib/bultos';

interface Props {
  token: string | null;
  productId: number;
  /** Presentación guardada en la BD. */
  savedPresentation: string;
  /** Presentación que el admin está escribiendo en el form. */
  draftPresentation: string;
  /** Texto de presentación nuevo, tal como quedó guardado. */
  onRenamed: (presentation: string) => void;
  disabled?: boolean;
}

/**
 * Renombra una presentación sin perder sus bultos, gama ni SKU Tango (editar el
 * texto a mano los borra). Se aplica al instante, igual que los demás editores.
 */
export function PresentationRenamer({
  token,
  productId,
  savedPresentation,
  draftPresentation,
  onRenamed,
  disabled,
}: Props) {
  const [editando, setEditando] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState('');
  const [busy, setBusy] = useState(false);

  const guardadas = splitPresentations(savedPresentation);
  if (guardadas.length === 0) return null;
  // Con cambios sin guardar en el texto, renombrar pisaría el borrador.
  const hayBorrador =
    splitPresentations(draftPresentation).join('|') !== guardadas.join('|');

  const empezar = (pres: string) => {
    setEditando(pres);
    setNuevo(pres);
  };

  const confirmar = async () => {
    if (!token || !editando) return;
    const to = nuevo.trim();
    if (!to || to === editando) return setEditando(null);
    if (to.includes(',')) return toast.error('La presentación no puede contener comas');
    if (guardadas.includes(to)) return toast.error(`Ya existe la presentación "${to}"`);
    setBusy(true);
    try {
      const product = await renamePresentation(token, productId, editando, to);
      onRenamed(product.presentation);
      setEditando(null);
      toast.success('Presentación renombrada', {
        description: `"${editando}" → "${to}" (con sus bultos, gama y SKU)`,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo renombrar');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-2 space-y-1.5 rounded-md border border-gray-200 bg-gray-50 p-3">
      <p className="flex items-center gap-1 text-xs font-medium text-gray-700">
        <Pencil className="h-3.5 w-3.5" /> Renombrar presentación (conserva bultos, gama y SKU)
      </p>
      {hayBorrador && (
        <p className="text-xs text-amber-700">
          Guardá o descartá los cambios del texto antes de renombrar.
        </p>
      )}
      {guardadas.map((pres) =>
        editando === pres ? (
          <div key={pres} className="flex items-center gap-1.5 text-xs">
            <input
              aria-label={`Nuevo nombre para ${pres}`}
              value={nuevo}
              autoFocus
              disabled={busy}
              maxLength={255}
              onChange={(e) => setNuevo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  confirmar();
                }
                if (e.key === 'Escape') setEditando(null);
              }}
              className="min-w-[180px] flex-1 rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-xs"
            />
            <button
              type="button"
              aria-label="Confirmar"
              disabled={busy}
              onClick={confirmar}
              className="rounded p-0.5 text-green-700 hover:bg-green-100 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Cancelar"
              disabled={busy}
              onClick={() => setEditando(null)}
              className="rounded p-0.5 text-gray-500 hover:bg-gray-200 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div key={pres} className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-800">{pres}</span>
            <button
              type="button"
              aria-label={`Renombrar ${pres}`}
              disabled={busy || disabled || hayBorrador || editando !== null}
              onClick={() => empezar(pres)}
              className="rounded p-0.5 text-gray-500 hover:bg-gray-200 disabled:opacity-40"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      )}
    </div>
  );
}
