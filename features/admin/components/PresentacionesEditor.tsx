'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Check, Loader2, Pencil, X } from 'lucide-react';
import {
  assignBulto,
  BultoAdmin,
  getBultos,
  getBultosForProducts,
  getGamasPorPresentacion,
  getSkusForProducts,
  renamePresentation,
  setGamaPresentacion,
  setSkusPresentacion,
  unassignBulto,
} from '@/lib/api';
import { BultoInfo, splitPresentations } from '@/lib/bultos';
import { GAMAS } from '@/lib/gamas';

interface Props {
  token: string | null;
  /** Producto guardado (sin id = alta: los datos por presentación se cargan después). */
  productId?: number;
  /** Presentación guardada en la BD. */
  savedPresentation: string;
  /** Presentación que el admin está escribiendo en el form. */
  draftPresentation: string;
  /** Texto de presentación nuevo tras renombrar (el form debe adoptarlo). */
  onRenamed: (presentation: string) => void;
  disabled?: boolean;
}

const parseSkus = (txt: string) => [
  ...new Set(
    txt
      .split(/[\s,;/]+/)
      .map((s) => s.trim())
      .filter(Boolean)
  ),
];

/**
 * Tabla única de presentaciones: renombrar, gama, SKU Tango y bultos por fila.
 * Todo se aplica al instante (no espera al "Guardar" del producto), igual que antes.
 */
export function PresentacionesEditor({
  token,
  productId,
  savedPresentation,
  draftPresentation,
  onRenamed,
  disabled,
}: Props) {
  const [catalogo, setCatalogo] = useState<BultoAdmin[]>([]);
  const [bultos, setBultos] = useState<Record<string, BultoInfo[]>>({});
  const [gamas, setGamas] = useState<Record<string, string>>({});
  const [skus, setSkus] = useState<Record<string, string[]>>({});
  const [skuTxt, setSkuTxt] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null); // presentación que se está guardando
  const [renombrando, setRenombrando] = useState<string | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState('');

  const load = useCallback(async () => {
    if (!token || !productId) return;
    setLoading(true);
    try {
      // Cada parte falla por separado: sin bultos o sin gamas, el resto sigue andando.
      const [cat, b, g, s] = await Promise.all([
        getBultos(token).catch(() => []),
        getBultosForProducts([productId]).catch(() => ({})),
        getGamasPorPresentacion(token, [productId]).catch(() => ({})),
        getSkusForProducts([productId]).catch(() => ({})),
      ]);
      const skusProd =
        (s as Record<number, Record<string, string[]>>)[productId] ?? {};
      setCatalogo(cat);
      setBultos(
        (b as Record<number, Record<string, BultoInfo[]>>)[productId] ?? {}
      );
      setGamas((g as Record<number, Record<string, string>>)[productId] ?? {});
      setSkus(skusProd);
      setSkuTxt(
        Object.fromEntries(
          Object.entries(skusProd).map(([p, v]) => [p, v.join(', ')])
        )
      );
    } finally {
      setLoading(false);
    }
  }, [token, productId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!productId) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
        Creá el producto para cargar gama, SKU Tango y bultos de cada
        presentación.
      </p>
    );
  }

  const guardadas = splitPresentations(savedPresentation);
  const borrador = splitPresentations(draftPresentation);
  const hayBorrador = borrador.join('|') !== guardadas.join('|');
  const nuevas = borrador.filter((p) => !guardadas.includes(p));
  const seQuitan = guardadas.filter((p) => !borrador.includes(p));
  const sinGama = guardadas.filter((p) => !gamas[p]).length;
  const sinSku = guardadas.filter((p) => !skus[p]?.length).length;

  /** Ejecuta un cambio de una fila con su spinner y recarga. */
  const run = async (
    pres: string,
    fn: () => Promise<unknown>,
    error: string
  ) => {
    if (!token) return;
    setBusy(pres);
    try {
      await fn();
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : error);
    } finally {
      setBusy(null);
    }
  };

  const guardarSkus = (pres: string) => {
    const nuevos = parseSkus(skuTxt[pres] ?? '');
    if (nuevos.join(',') === (skus[pres] ?? []).join(',')) return;
    run(
      pres,
      () => setSkusPresentacion(token!, productId, pres, nuevos),
      'No se pudieron guardar los SKU'
    );
  };

  const confirmarRenombre = async () => {
    if (!token || !renombrando) return;
    const from = renombrando;
    const to = nuevoNombre.trim();
    if (!to || to === from) return setRenombrando(null);
    if (to.includes(','))
      return toast.error('La presentación no puede contener comas');
    if (guardadas.includes(to))
      return toast.error(`Ya existe la presentación "${to}"`);
    setBusy(from);
    try {
      const product = await renamePresentation(token, productId, from, to);
      setRenombrando(null);
      onRenamed(product.presentation);
      toast.success('Presentación renombrada', {
        description: `"${from}" → "${to}" (con su gama, SKU y bultos)`,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo renombrar');
    } finally {
      setBusy(null);
    }
  };

  // Un cambio por vez: evita carreras entre filas mientras se guarda.
  const bloqueado = (_pres: string) => !!disabled || busy !== null;

  return (
    <div className="space-y-2">
      {/* Resumen + accesos */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-medium text-neutral-700">
          {guardadas.length} presentaci{guardadas.length === 1 ? 'ón' : 'ones'}
        </span>
        {sinGama > 0 && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-800">
            {sinGama} sin gama
          </span>
        )}
        {sinSku > 0 && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-800">
            {sinSku} sin SKU
          </span>
        )}
        {loading && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />
        )}
        <Link
          href="/admin/bultos"
          className="ml-auto text-green-700 hover:underline"
        >
          Gestionar bultos
        </Link>
      </div>

      {hayBorrador && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Cambios en el texto sin guardar
          {nuevas.length > 0 && (
            <>
              {' '}
              · se agregan: <b>{nuevas.join(', ')}</b>
            </>
          )}
          {seQuitan.length > 0 && (
            <>
              {' '}
              · se quitan (con su gama, SKU y bultos):{' '}
              <b>{seQuitan.join(', ')}</b>
            </>
          )}
          . Para cambiar solo el nombre usá ✎, que conserva sus datos.
        </div>
      )}

      {guardadas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-200 px-3 py-4 text-center text-xs text-neutral-500">
          Sin presentaciones. Escribilas arriba separadas por coma y guardá el
          producto.
        </p>
      ) : (
        <div className="max-h-[340px] overflow-auto rounded-lg border border-neutral-200">
          <table className="w-full min-w-[640px] text-xs">
            <thead className="sticky top-0 z-10 bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">
                  Presentación
                </th>
                <th className="w-[110px] px-2 py-2 text-left font-semibold">
                  Gama
                </th>
                <th className="w-[210px] px-2 py-2 text-left font-semibold">
                  SKU Tango
                </th>
                <th className="px-2 py-2 text-left font-semibold">Bultos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {guardadas.map((pres) => {
                const actuales = bultos[pres] ?? [];
                const disponibles = catalogo.filter(
                  (b) => !actuales.some((a) => a.id === b.id)
                );
                const saliendo = seQuitan.includes(pres);
                return (
                  <tr
                    key={pres}
                    className={`align-middle ${saliendo ? 'bg-amber-50/60' : 'hover:bg-neutral-50'}`}
                  >
                    {/* Presentación + renombrar */}
                    <td className="px-3 py-1.5">
                      {renombrando === pres ? (
                        <div className="flex items-center gap-1">
                          <input
                            aria-label={`Nuevo nombre para ${pres}`}
                            value={nuevoNombre}
                            autoFocus
                            maxLength={255}
                            disabled={busy === pres}
                            onChange={(e) => setNuevoNombre(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                confirmarRenombre();
                              }
                              if (e.key === 'Escape') setRenombrando(null);
                            }}
                            className="w-full min-w-0 rounded-md border border-neutral-300 px-1.5 py-1"
                          />
                          <button
                            type="button"
                            aria-label="Confirmar"
                            onClick={confirmarRenombre}
                            className="rounded p-1 text-green-700 hover:bg-green-100"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Cancelar"
                            onClick={() => setRenombrando(null)}
                            className="rounded p-1 text-neutral-500 hover:bg-neutral-200"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="group flex items-center gap-1.5">
                          <span
                            className={`font-medium ${saliendo ? 'text-amber-800 line-through' : 'text-neutral-800'}`}
                          >
                            {pres}
                          </span>
                          {busy === pres && (
                            <Loader2 className="h-3 w-3 animate-spin text-neutral-400" />
                          )}
                          <button
                            type="button"
                            aria-label={`Renombrar ${pres}`}
                            title={
                              hayBorrador
                                ? 'Guardá o descartá los cambios del texto antes de renombrar'
                                : 'Renombrar (conserva gama, SKU y bultos)'
                            }
                            disabled={
                              bloqueado(pres) ||
                              hayBorrador ||
                              renombrando !== null
                            }
                            onClick={() => {
                              setRenombrando(pres);
                              setNuevoNombre(pres);
                            }}
                            className="rounded p-1 text-neutral-400 opacity-60 hover:bg-neutral-200 hover:text-neutral-700 disabled:opacity-30 group-hover:opacity-100"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Gama */}
                    <td className="px-2 py-1.5">
                      <select
                        aria-label={`Gama de ${pres}`}
                        value={gamas[pres] ?? ''}
                        disabled={bloqueado(pres)}
                        onChange={(e) =>
                          run(
                            pres,
                            () =>
                              setGamaPresentacion(
                                token!,
                                productId,
                                pres,
                                e.target.value || null
                              ),
                            'No se pudo actualizar la gama'
                          )
                        }
                        className={`w-full rounded-md border px-1.5 py-1 ${gamas[pres] ? 'border-neutral-300 bg-white' : 'border-amber-200 bg-amber-50 text-amber-800'}`}
                      >
                        <option value="">—</option>
                        {GAMAS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* SKU Tango */}
                    <td className="px-2 py-1.5">
                      <input
                        aria-label={`SKU Tango de ${pres}`}
                        value={skuTxt[pres] ?? ''}
                        disabled={bloqueado(pres)}
                        onChange={(e) =>
                          setSkuTxt((t) => ({ ...t, [pres]: e.target.value }))
                        }
                        onBlur={() => guardarSkus(pres)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        placeholder="0010002700, …"
                        title="Varios códigos separados por coma. Se guarda al salir del campo."
                        className={`w-full rounded-md border px-1.5 py-1 font-mono ${skus[pres]?.length ? 'border-neutral-300 bg-white' : 'border-amber-200 bg-amber-50'}`}
                      />
                    </td>

                    {/* Bultos */}
                    <td className="px-2 py-1.5">
                      <div className="flex flex-wrap items-center gap-1">
                        {actuales.length === 0 && (
                          <span className="text-neutral-400">por unidad</span>
                        )}
                        {actuales.map((b) => (
                          <span
                            key={b.id}
                            className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-green-800"
                          >
                            {b.nombre}
                            <button
                              type="button"
                              aria-label={`Quitar ${b.nombre} de ${pres}`}
                              disabled={bloqueado(pres)}
                              onClick={() =>
                                b.id &&
                                run(
                                  pres,
                                  () =>
                                    unassignBulto(
                                      token!,
                                      b.id!,
                                      [{ productId, presentation: pres }],
                                      false
                                    ),
                                  'No se pudo quitar el bulto'
                                )
                              }
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
                            disabled={bloqueado(pres)}
                            onChange={(e) =>
                              e.target.value &&
                              run(
                                pres,
                                () =>
                                  assignBulto(
                                    token!,
                                    Number(e.target.value),
                                    [{ productId, presentation: pres }],
                                    false
                                  ),
                                'No se pudo asignar el bulto'
                              )
                            }
                            className="rounded-md border border-dashed border-neutral-300 bg-white px-1 py-0.5 text-neutral-600"
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
