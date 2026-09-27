'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Package, X } from 'lucide-react';
import {
  assignBulto,
  BultoAdmin,
  getBultos,
  getBultosForProducts,
  unassignBulto,
} from '@/lib/api';
import { BultoInfo, splitPresentations } from '@/lib/bultos';

interface Props {
  token: string | null;
  /** Producto guardado (sin id = alta: los bultos se asignan después de crearlo). */
  productId?: number;
  /** Presentación guardada en la BD. */
  savedPresentation: string;
  /** Presentación que el admin está escribiendo en el form. */
  draftPresentation: string;
  disabled?: boolean;
}

/**
 * Bultos por presentación dentro de la ficha del producto. Los cambios se
 * aplican al instante (no esperan al "Guardar" del producto).
 */
export function ProductBultosEditor({
  token,
  productId,
  savedPresentation,
  draftPresentation,
  disabled,
}: Props) {
  const [catalogo, setCatalogo] = useState<BultoAdmin[]>([]);
  const [asignados, setAsignados] = useState<Record<string, BultoInfo[]>>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token || !productId) return;
    try {
      const [cat, map] = await Promise.all([getBultos(token), getBultosForProducts([productId])]);
      setCatalogo(cat);
      setAsignados(map[productId] ?? {});
    } catch {
      // Sin bultos disponibles: el editor queda vacío, el form sigue funcionando.
    }
  }, [token, productId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!productId) {
    return (
      <p className="mt-1 text-xs text-gray-500">
        Los bultos (Caja x 24, Pallet x 48…) se asignan después de crear el producto.
      </p>
    );
  }

  const guardadas = splitPresentations(savedPresentation);
  const borrador = splitPresentations(draftPresentation);
  // Presentaciones con bultos que desaparecen del texto: se pierden al guardar.
  const seQuitan = Object.keys(asignados).filter(
    (p) => asignados[p].length > 0 && !borrador.includes(p)
  );

  const change = async (presentation: string, bultoId: number, quitar: boolean) => {
    if (!token) return;
    setBusy(true);
    try {
      const items = [{ productId, presentation }];
      await (quitar ? unassignBulto : assignBulto)(token, bultoId, items, false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar el bulto');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-2 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1 text-xs font-medium text-gray-700">
          <Package className="h-3.5 w-3.5" /> Bultos por presentación
        </p>
        <Link href="/admin/bultos" className="text-xs text-green-700 hover:underline">
          Gestionar bultos
        </Link>
      </div>

      {guardadas.length === 0 && (
        <p className="text-xs text-gray-500">Guardá una presentación para asignarle bultos.</p>
      )}

      {guardadas.map((pres) => {
        const actuales = asignados[pres] ?? [];
        const disponibles = catalogo.filter((b) => !actuales.some((a) => a.id === b.id));
        return (
          <div key={pres} className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="mr-1 font-medium text-gray-800">{pres}:</span>
            {actuales.length === 0 && <span className="text-gray-400">por unidad</span>}
            {actuales.map((b) => (
              <span
                key={b.id}
                className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-green-800"
              >
                {b.nombre}
                <button
                  type="button"
                  aria-label={`Quitar ${b.nombre} de ${pres}`}
                  disabled={busy || disabled}
                  onClick={() => b.id && change(pres, b.id, true)}
                  className="rounded-full hover:bg-green-200 disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {disponibles.length > 0 && (
              <select
                aria-label={`Agregar bulto a ${pres}`}
                value=""
                disabled={busy || disabled}
                onChange={(e) => e.target.value && change(pres, Number(e.target.value), false)}
                className="rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-xs"
              >
                <option value="">+ bulto</option>
                {disponibles.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      })}

      {seQuitan.length > 0 && (
        <p className="text-xs text-amber-700">
          ⚠ Al guardar se quitan los bultos de: {seQuitan.join(', ')} (esa presentación ya no está en el texto).
        </p>
      )}
    </div>
  );
}
