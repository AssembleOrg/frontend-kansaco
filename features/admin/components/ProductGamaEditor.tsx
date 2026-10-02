'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Layers } from 'lucide-react';
import { getGamasPorPresentacion, setGamaPresentacion } from '@/lib/api';
import { splitPresentations } from '@/lib/bultos';
import { GAMAS } from '@/lib/gamas';

interface Props {
  token: string | null;
  /** Producto guardado (sin id = alta: la gama se asigna después de crearlo). */
  productId?: number;
  /** Presentación guardada en la BD. */
  savedPresentation: string;
  /** Presentación que el admin está escribiendo en el form. */
  draftPresentation: string;
  disabled?: boolean;
}

/**
 * Gama de Tango por presentación dentro de la ficha del producto. Igual que los
 * bultos: los cambios se aplican al instante (no esperan al "Guardar").
 */
export function ProductGamaEditor({
  token,
  productId,
  savedPresentation,
  draftPresentation,
  disabled,
}: Props) {
  const [gamas, setGamas] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token || !productId) return;
    try {
      const map = await getGamasPorPresentacion(token);
      setGamas(map[productId] ?? {});
    } catch {
      // Sin gamas disponibles: el editor queda vacío, el form sigue funcionando.
    }
  }, [token, productId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!productId) {
    return (
      <p className="mt-1 text-xs text-gray-500">La gama se asigna después de crear el producto.</p>
    );
  }

  const guardadas = splitPresentations(savedPresentation);
  const borrador = splitPresentations(draftPresentation);
  const seQuitan = Object.keys(gamas).filter((p) => !borrador.includes(p));

  const change = async (presentation: string, gama: string) => {
    if (!token) return;
    setBusy(true);
    try {
      await setGamaPresentacion(token, productId, presentation, gama || null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar la gama');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-2 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
      <p className="flex items-center gap-1 text-xs font-medium text-gray-700">
        <Layers className="h-3.5 w-3.5" /> Gama por presentación
      </p>

      {guardadas.length === 0 && (
        <p className="text-xs text-gray-500">Guardá una presentación para asignarle gama.</p>
      )}

      {guardadas.map((pres) => (
        <label key={pres} className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="mr-1 font-medium text-gray-800">{pres}:</span>
          <select
            aria-label={`Gama de ${pres}`}
            value={gamas[pres] ?? ''}
            disabled={busy || disabled}
            onChange={(e) => change(pres, e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-xs"
          >
            <option value="">Sin gama</option>
            {GAMAS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      ))}

      {seQuitan.length > 0 && (
        <p className="text-xs text-amber-700">
          ⚠ Al guardar se quita la gama de: {seQuitan.join(', ')} (esa presentación ya no está en el texto).
        </p>
      )}
    </div>
  );
}
