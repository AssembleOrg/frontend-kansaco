'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Boxes, Check, Eye, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  assignBulto,
  BultoAdmin,
  BultoItemRef,
  createBulto,
  deleteBulto,
  getBultos,
  getPresentacionesConBultos,
  PresentacionConBultos,
  unassignBulto,
  updateBulto,
} from '@/lib/api';
import { pareceMenor20L } from '@/lib/bultos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const rowKey = (r: BultoItemRef) => `${r.productId}|${r.presentation}`;

type Confirm = {
  title: string;
  description: string;
  lines?: string[];
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => Promise<void>;
};

export default function BultosPage() {
  const { token } = useAuth();
  const [bultos, setBultos] = useState<BultoAdmin[]>([]);
  const [rows, setRows] = useState<PresentacionConBultos[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Alta / edición de bulto
  const [nombre, setNombre] = useState('');
  const [unidades, setUnidades] = useState('');
  const [editing, setEditing] = useState<{ id: number; nombre: string; unidades: string } | null>(null);

  // Filtros y selección de presentaciones
  const [q, setQ] = useState('');
  const [presFilter, setPresFilter] = useState('');
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Modal "ver asignados" de un bulto
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [viewQ, setViewQ] = useState('');
  const [viewChecked, setViewChecked] = useState<Set<string>>(new Set());
  const [confirmQuitar, setConfirmQuitar] = useState(false);
  const [quitando, setQuitando] = useState(false);

  const load = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [b, r] = await Promise.all([getBultos(token), getPresentacionesConBultos(token)]);
      setBultos(b);
      setRows(r);
      setSelectedId((cur) => (cur && b.some((x) => x.id === cur) ? cur : b[0]?.id ?? null));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al cargar bultos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const selected = bultos.find((b) => b.id === selectedId) ?? null;
  const pendientes = useMemo(
    () => rows.filter((r) => r.bultos.length === 0 && pareceMenor20L(r.presentation)),
    [rows]
  );

  const viewing = bultos.find((b) => b.id === viewingId) ?? null;
  const asignadosViewing = useMemo(() => {
    if (!viewingId) return [];
    const qn = viewQ.trim().toLowerCase();
    return rows.filter(
      (r) =>
        r.bultos.some((b) => b.id === viewingId) &&
        (!qn ||
          r.productName.toLowerCase().includes(qn) ||
          r.presentation.toLowerCase().includes(qn) ||
          r.sku?.toLowerCase().includes(qn))
    );
  }, [rows, viewingId, viewQ]);

  const openViewing = (id: number) => {
    setViewQ('');
    setViewChecked(new Set());
    setConfirmQuitar(false);
    setViewingId(id);
  };

  const todosViewMarcados =
    asignadosViewing.length > 0 && asignadosViewing.every((r) => viewChecked.has(rowKey(r)));
  const toggleViewTodos = () => {
    const next = new Set(viewChecked);
    for (const r of asignadosViewing) {
      if (todosViewMarcados) next.delete(rowKey(r));
      else next.add(rowKey(r));
    }
    setViewChecked(next);
    setConfirmQuitar(false);
  };
  const toggleView = (r: PresentacionConBultos) => {
    const next = new Set(viewChecked);
    if (next.has(rowKey(r))) next.delete(rowKey(r));
    else next.add(rowKey(r));
    setViewChecked(next);
    setConfirmQuitar(false);
  };

  /** Quita el bulto de todas las marcadas en UNA sola llamada. */
  const quitarMarcados = async () => {
    if (!token || !viewing) return;
    const items = rows
      .filter((r) => viewChecked.has(rowKey(r)))
      .map(({ productId, presentation }) => ({ productId, presentation }));
    if (items.length === 0) return;
    setQuitando(true);
    try {
      const res = await unassignBulto(token, viewing.id, items, false);
      toast.success(`"${viewing.nombre}" quitado de ${res.quitados ?? 0} presentaciones`);
      setViewChecked(new Set());
      setConfirmQuitar(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo quitar');
    } finally {
      setQuitando(false);
    }
  };

  const visibles = useMemo(() => {
    const qn = q.trim().toLowerCase();
    const pn = presFilter.trim().toLowerCase();
    return (soloPendientes ? pendientes : rows).filter(
      (r) =>
        (!qn || r.productName.toLowerCase().includes(qn) || r.sku?.toLowerCase().includes(qn)) &&
        (!pn || r.presentation.toLowerCase().includes(pn))
    );
  }, [rows, pendientes, q, presFilter, soloPendientes]);

  const checkedItems = rows
    .filter((r) => checked.has(rowKey(r)))
    .map(({ productId, presentation }) => ({ productId, presentation }));
  const nameOf = (r: BultoItemRef) =>
    `${rows.find((x) => x.productId === r.productId)?.productName ?? `#${r.productId}`} · ${r.presentation}`;

  const allVisibleChecked = visibles.length > 0 && visibles.every((r) => checked.has(rowKey(r)));
  const toggleAllVisible = () => {
    const next = new Set(checked);
    for (const r of visibles) {
      if (allVisibleChecked) next.delete(rowKey(r));
      else next.add(rowKey(r));
    }
    setChecked(next);
  };
  const toggle = (r: PresentacionConBultos) => {
    const next = new Set(checked);
    if (next.has(rowKey(r))) next.delete(rowKey(r));
    else next.add(rowKey(r));
    setChecked(next);
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setConfirming(true);
    try {
      await confirm.onConfirm();
      setConfirm(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setConfirming(false);
    }
  };

  // ─── Bultos ──────────────────────────────────────────────────────

  const parseUnidades = (v: string) => {
    const n = Number(v);
    return Number.isInteger(n) && n >= 1 && n <= 10000 ? n : null;
  };

  const handleCreate = async () => {
    if (!token) return;
    const n = parseUnidades(unidades);
    const nom = nombre.trim() || (n ? `Caja x ${n}` : '');
    if (!n) return toast.error('Unidades: entero entre 1 y 10000');
    if (!nom) return toast.error('Poné un nombre');
    try {
      const b = await createBulto(token, { nombre: nom, unidades: n });
      setNombre('');
      setUnidades('');
      toast.success(`Bulto "${b.nombre}" creado`);
      await load();
      setSelectedId(b.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo crear');
    }
  };

  const handleSaveEdit = () => {
    if (!token || !editing) return;
    const n = parseUnidades(editing.unidades);
    const nom = editing.nombre.trim();
    if (!n) return toast.error('Unidades: entero entre 1 y 10000');
    if (!nom) return toast.error('Poné un nombre');
    const original = bultos.find((b) => b.id === editing.id);
    const save = async () => {
      await updateBulto(token, editing.id, { nombre: nom, unidades: n });
      toast.success('Bulto actualizado');
      setEditing(null);
      await load();
    };
    if (original && original.unidades !== n && original.asignados > 0) {
      setConfirm({
        title: `Cambiar ${original.nombre} de ${original.unidades} a ${n} unidades`,
        description: `Afecta a ${original.asignados} presentaciones asignadas en la tienda. Los pedidos ya hechos no cambian (guardan su copia).`,
        confirmLabel: 'Cambiar unidades',
        onConfirm: save,
      });
    } else {
      save().catch((e) => toast.error(e instanceof Error ? e.message : 'No se pudo guardar'));
    }
  };

  const handleDelete = (b: BultoAdmin) => {
    if (!token) return;
    const afectados = rows.filter((r) => r.bultos.some((x) => x.id === b.id));
    setConfirm({
      title: `Borrar "${b.nombre}"`,
      description:
        b.asignados > 0
          ? `Tiene ${b.asignados} asignaciones: esas presentaciones dejan de tener este bulto. Los pedidos ya hechos no cambian.`
          : 'No tiene productos asignados.',
      lines: afectados.map((r) => `${r.productName} · ${r.presentation}`),
      confirmLabel: 'Borrar bulto',
      danger: true,
      onConfirm: async () => {
        await deleteBulto(token, b.id, b.asignados > 0);
        toast.success(`"${b.nombre}" borrado`);
        await load();
      },
    });
  };

  // ─── Asignación con previsualización ─────────────────────────────

  const handleAssign = async (quitar: boolean) => {
    if (!token || !selected || checkedItems.length === 0) return;
    try {
      const fn = quitar ? unassignBulto : assignBulto;
      const preview = await fn(token, selected.id, checkedItems, true);
      const afectados = (quitar ? preview.quitar : preview.agregar) ?? [];
      if (afectados.length === 0) {
        toast.info(
          quitar
            ? `Ninguna de las seleccionadas tiene "${selected.nombre}"`
            : `Todas las seleccionadas ya tienen "${selected.nombre}"`
        );
        return;
      }
      setConfirm({
        title: quitar
          ? `Quitar "${selected.nombre}" de ${afectados.length} presentaciones`
          : `Asignar "${selected.nombre}" a ${afectados.length} presentaciones`,
        description: quitar
          ? 'Esas presentaciones vuelven a venderse sin este bulto.'
          : `Se suma a los bultos que ya tengan.${
              preview.yaTenian ? ` ${preview.yaTenian} seleccionadas ya lo tenían y no se tocan.` : ''
            }`,
        lines: afectados.map(nameOf),
        confirmLabel: quitar ? 'Quitar' : 'Asignar',
        danger: quitar,
        onConfirm: async () => {
          const res = await fn(token, selected.id, checkedItems, false);
          toast.success(
            quitar ? `${res.quitados ?? 0} quitados` : `${res.agregados ?? 0} asignados`
          );
          setChecked(new Set());
          await load();
        },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al previsualizar');
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-neutral-900 lg:text-2xl">
            <Boxes className="h-5 w-5 text-green-700" />
            Bultos
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Cajas, packs y pallets. La cantidad de los pedidos sigue en unidades; el bulto
            sugiere de a cuánto se vende y muestra el desglose.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={isLoading} aria-label="Recargar">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {isLoading && rows.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-6">
          {/* ===== Bultos ===== */}
          <aside className="mb-6 space-y-4 lg:sticky lg:top-6 lg:mb-0 lg:self-start">
            <div className="rounded-xl border border-neutral-200 bg-white p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                Nuevo bulto
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Unidades"
                  inputMode="numeric"
                  value={unidades}
                  onChange={(e) => setUnidades(e.target.value.replace(/\D/g, ''))}
                  className="w-24"
                  aria-label="Unidades por bulto"
                />
                <Input
                  placeholder={unidades ? `Caja x ${unidades}` : 'Nombre'}
                  value={nombre}
                  maxLength={60}
                  onChange={(e) => setNombre(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  aria-label="Nombre del bulto"
                />
              </div>
              <Button onClick={handleCreate} className="mt-2 w-full bg-green-600 hover:bg-green-700" size="sm">
                <Plus className="mr-1 h-4 w-4" /> Crear
              </Button>
              <p className="mt-1.5 text-[11px] text-neutral-400">
                Ej.: 24 → &quot;Caja x 24&quot;, 48 → &quot;Pallet x 48&quot;.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-2">
              <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                Bultos ({bultos.length})
              </p>
              {bultos.length === 0 && (
                <p className="px-2 pb-2 text-sm text-neutral-500">Todavía no hay bultos. Creá el primero.</p>
              )}
              <ul className="space-y-0.5">
                {bultos.map((b) =>
                  editing?.id === b.id ? (
                    <li key={b.id} className="flex items-center gap-1 rounded-lg bg-neutral-50 p-1.5">
                      <Input
                        value={editing.unidades}
                        inputMode="numeric"
                        onChange={(e) => setEditing({ ...editing, unidades: e.target.value.replace(/\D/g, '') })}
                        className="h-8 w-16"
                        aria-label="Unidades"
                      />
                      <Input
                        value={editing.nombre}
                        maxLength={60}
                        onChange={(e) => setEditing({ ...editing, nombre: e.target.value })}
                        className="h-8"
                        aria-label="Nombre"
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveEdit} aria-label="Guardar">
                        <Check className="h-4 w-4 text-green-700" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(null)} aria-label="Cancelar">
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ) : (
                    <li key={b.id} className="group flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedId(b.id)}
                        className={`flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                          selectedId === b.id
                            ? 'bg-green-50 text-green-700'
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                        }`}
                      >
                        <span className="truncate">{b.nombre}</span>
                        <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] tabular-nums text-neutral-500">
                          {b.unidades} u.
                        </span>
                      </button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1 px-2 text-xs tabular-nums text-neutral-600"
                        onClick={() => openViewing(b.id)}
                        aria-label={`Ver ${b.asignados} presentaciones con ${b.nombre}`}
                        title="Ver asignados"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {b.asignados}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setEditing({ id: b.id, nombre: b.nombre, unidades: String(b.unidades) })}
                        aria-label={`Editar ${b.nombre}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(b)}
                        aria-label={`Borrar ${b.nombre}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </li>
                  )
                )}
              </ul>
              <p className="px-2 pt-1 text-[11px] text-neutral-400">
                u. = unidades por bulto · <Eye className="inline h-3 w-3" /> = presentaciones asignadas
              </p>
            </div>
          </aside>

          {/* ===== Asignación ===== */}
          <section className="rounded-xl border border-neutral-200 bg-white">
            <div className="space-y-3 border-b border-neutral-100 p-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    placeholder="Buscar producto o SKU"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Input
                  placeholder='Presentación (ej. "1 Litro", "500cc")'
                  value={presFilter}
                  onChange={(e) => setPresFilter(e.target.value)}
                  className="sm:w-64"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSoloPendientes((v) => !v)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition-colors ${
                    soloPendientes
                      ? 'bg-amber-50 text-amber-800 ring-amber-300'
                      : 'bg-white text-neutral-600 ring-neutral-200 hover:bg-neutral-50'
                  }`}
                  title="Presentaciones que parecen menores a 20 L y todavía no tienen bulto"
                >
                  Pendientes &lt; 20 L sin bulto: {pendientes.length}
                </button>
                <span className="text-xs text-neutral-500">
                  {visibles.length} presentaciones · {checked.size} seleccionadas
                </span>
                {checked.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setChecked(new Set())}
                    className="text-xs text-neutral-500 underline hover:text-neutral-800"
                  >
                    Limpiar selección
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!selected || checked.size === 0}
                  onClick={() => handleAssign(false)}
                >
                  Asignar {selected ? `"${selected.nombre}"` : 'bulto'} a {checked.size}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!selected || checked.size === 0}
                  onClick={() => handleAssign(true)}
                >
                  Quitar {selected ? `"${selected.nombre}"` : 'bulto'}
                </Button>
                {!selected && (
                  <span className="self-center text-xs text-amber-700">Creá o elegí un bulto a la izquierda.</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-2 text-xs font-medium text-neutral-500">
              <Checkbox
                checked={allVisibleChecked}
                onCheckedChange={toggleAllVisible}
                aria-label="Seleccionar todas las visibles"
              />
              <span className="flex-1">Producto · presentación</span>
              <span>Bultos actuales</span>
            </div>
            <ul className="max-h-[60vh] divide-y divide-neutral-100 overflow-y-auto">
              {visibles.length === 0 && (
                <li className="px-4 py-10 text-center text-sm text-neutral-500">
                  {soloPendientes ? '¡No quedan pendientes!' : 'Sin resultados para ese filtro.'}
                </li>
              )}
              {visibles.map((r) => (
                <li key={rowKey(r)}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-neutral-50">
                    <Checkbox checked={checked.has(rowKey(r))} onCheckedChange={() => toggle(r)} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-neutral-800">
                        {r.productName}
                        {!r.isVisible && <span className="ml-1 text-[11px] text-neutral-400">(oculto)</span>}
                      </span>
                      <span className="block truncate text-xs text-neutral-500">
                        {r.presentation}
                        {r.sku ? ` · SKU ${r.sku}` : ''}
                      </span>
                    </span>
                    <span className="flex max-w-[45%] flex-wrap justify-end gap-1">
                      {r.bultos.length === 0 ? (
                        <span className="text-[11px] text-neutral-400">por unidad</span>
                      ) : (
                        r.bultos.map((b) => (
                          <span
                            key={b.id}
                            className={`rounded-full px-2 py-0.5 text-[11px] ${
                              b.id === selectedId ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {b.nombre}
                          </span>
                        ))
                      )}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewingId(null)}>
        <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {viewing?.nombre} · {viewing?.unidades} u.
            </DialogTitle>
            <DialogDescription>
              {viewing?.asignados ?? 0} presentaciones se venden con este bulto.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Filtrar por producto, presentación o SKU"
              value={viewQ}
              onChange={(e) => setViewQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-3 px-3 text-xs text-neutral-500">
            <Checkbox
              checked={todosViewMarcados}
              onCheckedChange={toggleViewTodos}
              aria-label="Seleccionar todas las listadas"
            />
            <span>
              {viewChecked.size > 0
                ? `${viewChecked.size} seleccionadas`
                : `Seleccionar ${viewQ ? 'las filtradas' : 'todas'} (${asignadosViewing.length})`}
            </span>
          </div>
          <ul className="min-h-0 flex-1 divide-y divide-neutral-100 overflow-y-auto rounded-md border border-neutral-200">
            {asignadosViewing.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-neutral-500">
                {viewQ ? 'Sin resultados.' : 'Todavía no tiene productos asignados.'}
              </li>
            )}
            {asignadosViewing.map((r) => (
              <li key={rowKey(r)}>
                <label
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-neutral-50 ${
                    viewChecked.has(rowKey(r)) ? 'bg-red-50/60' : ''
                  }`}
                >
                  <Checkbox checked={viewChecked.has(rowKey(r))} onCheckedChange={() => toggleView(r)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-neutral-800">{r.productName}</span>
                    <span className="block truncate text-xs text-neutral-500">
                      {r.presentation}
                      {r.sku ? ` · SKU ${r.sku}` : ''}
                      {r.bultos.length > 1 &&
                        ` · también: ${r.bultos
                          .filter((b) => b.id !== viewingId)
                          .map((b) => b.nombre)
                          .join(', ')}`}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <DialogFooter className="gap-2 sm:items-center sm:justify-between sm:gap-0">
            {confirmQuitar ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-red-700">
                  ¿Quitar &quot;{viewing?.nombre}&quot; de {viewChecked.size} presentaciones?
                </span>
                <Button size="sm" variant="outline" onClick={() => setConfirmQuitar(false)} disabled={quitando}>
                  No
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={quitarMarcados}
                  disabled={quitando}
                >
                  {quitando && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  Sí, quitar
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                disabled={viewChecked.size === 0}
                onClick={() => setConfirmQuitar(true)}
              >
                <X className="mr-1 h-4 w-4" />
                Quitar seleccionadas ({viewChecked.size})
              </Button>
            )}
            <Button variant="outline" onClick={() => setViewingId(null)} disabled={quitando}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirm} onOpenChange={(o) => !o && !confirming && setConfirm(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{confirm?.title}</DialogTitle>
            <DialogDescription>{confirm?.description}</DialogDescription>
          </DialogHeader>
          {confirm?.lines && confirm.lines.length > 0 && (
            <ul className="max-h-60 space-y-1 overflow-y-auto rounded-md bg-neutral-50 p-3 text-xs text-neutral-700">
              {confirm.lines.map((l) => (
                <li key={l} className="truncate">
                  {l}
                </li>
              ))}
            </ul>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirm(null)} disabled={confirming}>
              Cancelar
            </Button>
            <Button
              onClick={runConfirm}
              disabled={confirming}
              className={confirm?.danger ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {confirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirm?.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
