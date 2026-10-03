'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Barcode } from 'lucide-react';
import { getSkusForProducts, setSkusPresentacion } from '@/lib/api';
import { splitPresentations } from '@/lib/bultos';

interface Props {
  token: string | null;
  /** Producto guardado (sin id = alta: los códigos se cargan después de crearlo). */
  productId?: number;
  /** Presentación guardada en la BD. */
  savedPresentation: string;
  /** Presentación que el admin está escribiendo en el form. */
  draftPresentation: string;
  disabled?: boolean;
}

const parse = (txt: string) => [...new Set(txt.split(/[\s,;/]+/).map((s) => s.trim()).filter(Boolean))];

/**
 * Códigos Tango (SKU del ERP) por presentación. Varios por presentación,
 * separados por coma. Se guardan al salir del campo (no esperan al "Guardar").
 */
export function ProductSkuEditor({
  token,
  productId,
  savedPresentation,
  draftPresentation,
  disabled,
}: Props) {
  const [guardados, setGuardados] = useState<Record<string, string[]>>({});
  const [texto, setTexto] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!productId) return;
    try {
      const map = (await getSkusForProducts([productId]))[productId] ?? {};
      setGuardados(map);
      setTexto(Object.fromEntries(Object.entries(map).map(([p, s]) => [p, s.join(', ')])));
    } catch {
      // Sin códigos disponibles: el editor queda vacío, el form sigue funcionando.
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!productId) {
    return (
      <p className="mt-1 text-xs text-gray-500">Los SKU Tango se cargan después de crear el producto.</p>
    );
  }

  const presentaciones = splitPresentations(savedPresentation);
  const borrador = splitPresentations(draftPresentation);
  const seQuitan = Object.keys(guardados).filter((p) => !borrador.includes(p));

  const save = async (presentation: string) => {
    if (!token) return;
    const nuevos = parse(texto[presentation] ?? '');
    if (nuevos.join(',') === (guardados[presentation] ?? []).join(',')) return;
    setBusy(true);
    try {
      await setSkusPresentacion(token, productId, presentation, nuevos);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudieron guardar los SKU');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-2 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
      <p className="flex items-center gap-1 text-xs font-medium text-gray-700">
        <Barcode className="h-3.5 w-3.5" /> SKU Tango por presentación
      </p>

      {presentaciones.length === 0 && (
        <p className="text-xs text-gray-500">Guardá una presentación para cargarle SKU.</p>
      )}

      {presentaciones.map((pres) => (
        <label key={pres} className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="mr-1 font-medium text-gray-800">{pres}:</span>
          <input
            aria-label={`SKU Tango de ${pres}`}
            value={texto[pres] ?? ''}
            disabled={busy || disabled}
            onChange={(e) => setTexto((t) => ({ ...t, [pres]: e.target.value }))}
            onBlur={() => save(pres)}
            placeholder="0010002700, 0020002700"
            className="min-w-[200px] flex-1 rounded-md border border-gray-300 bg-white px-1.5 py-0.5 font-mono text-xs"
          />
        </label>
      ))}

      {seQuitan.length > 0 && (
        <p className="text-xs text-amber-700">
          ⚠ Al guardar se quitan los SKU de: {seQuitan.join(', ')} (esa presentación ya no está en el texto).
        </p>
      )}
    </div>
  );
}
