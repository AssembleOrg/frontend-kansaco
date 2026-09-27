'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  Boxes,
  Eye,
  EyeOff,
  Loader2,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import ProductFormModal from '@/features/admin/components/ProductFormModal';
import { Product } from '@/types/product';
import {
  assignBulto,
  associateProductImage,
  BultoAdmin,
  BultoItemRef,
  createProduct,
  deleteProduct,
  deleteProductImage,
  getBultos,
  getAllBultosForProducts,
  getProductImages,
  getProductsPaginated,
  ImageListItem,
  reorderProductImages,
  unassignBulto,
  updateProduct,
} from '@/lib/api';
import { BultosPorProducto, pareceMenor20L, splitPresentations } from '@/lib/bultos';
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

type Estado = 'todos' | 'visibles' | 'ocultos' | 'destacados' | 'sinImagen';
type FiltroBulto = 'todos' | 'con' | 'sin' | 'pendientes' | `id:${number}`;
type Orden = 'nombre' | 'nombreDesc' | 'nuevos';

const ESTADOS: { value: Estado; label: string; test: (p: Product) => boolean }[] = [
  { value: 'todos', label: 'Todos', test: () => true },
  { value: 'visibles', label: 'Visibles', test: (p) => p.isVisible },
  { value: 'ocultos', label: 'Ocultos', test: (p) => !p.isVisible },
  { value: 'destacados', label: 'Destacados', test: (p) => p.isFeatured },
  { value: 'sinImagen', label: 'Sin imagen', test: (p) => !p.imageUrl },
];

const categoriasDe = (p: Product) =>
  p.categories?.length ? p.categories.map((c) => c.name) : p.category ?? [];

type Confirm = {
  title: string;
  description: string;
  lines?: string[];
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => Promise<void>;
};

/** Corre en tandas de 3 (el backend limita 10 req/s). Devuelve cuántos fallaron. */
async function enTandas<T>(items: T[], fn: (item: T) => Promise<unknown>): Promise<number> {
  let fallidos = 0;
  for (let i = 0; i < items.length; i += 3) {
    const res = await Promise.allSettled(items.slice(i, i + 3).map(fn));
    fallidos += res.filter((r) => r.status === 'rejected').length;
  }
  return fallidos;
}

export default function ProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [bultosMap, setBultosMap] = useState<BultosPorProducto>({});
  const [bultos, setBultos] = useState<BultoAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState<Estado>('todos');
  const [categoria, setCategoria] = useState('all');
  const [filtroBulto, setFiltroBulto] = useState<FiltroBulto>('todos');
  const [orden, setOrden] = useState<Orden>('nombre');

  // Selección y acciones
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bultoAccion, setBultoAccion] = useState<string>('');
  const [presAccion, setPresAccion] = useState('');
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Modal de producto
  const [editing, setEditing] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ponytail: trae todo el catálogo (148 productos) y filtra en el navegador;
  // pasar a filtros del servidor si el catálogo supera ~1000.
  const load = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const all: Product[] = [];
      for (let page = 1; ; page++) {
        const res = await getProductsPaginated(token, { page, limit: 100 });
        all.push(...res.data);
        if (!res.hasNext) break;
      }
      const [map, lista] = await Promise.all([
        getAllBultosForProducts(token),
        getBultos(token),
      ]);
      setProducts(all);
      setBultosMap(map);
      setBultos(lista);
      setSelected((cur) => new Set([...cur].filter((id) => all.some((p) => p.id === id))));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  // ─── Derivados ──────────────────────────────────────────────────

  const presDe = useCallback(
    (p: Product) =>
      splitPresentations(p.presentation).map((pres) => ({
        pres,
        bultos: bultosMap[p.id]?.[pres] ?? [],
      })),
    [bultosMap]
  );

  const categorias = useMemo(
    () => [...new Set(products.flatMap(categoriasDe))].sort((a, b) => a.localeCompare(b)),
    [products]
  );

  const pasaBulto = useCallback(
    (p: Product, f: FiltroBulto) => {
      const pres = presDe(p);
      if (f === 'todos') return true;
      if (f === 'con') return pres.some((x) => x.bultos.length > 0);
      if (f === 'sin') return pres.every((x) => x.bultos.length === 0);
      if (f === 'pendientes') return pres.some((x) => x.bultos.length === 0 && pareceMenor20L(x.pres));
      const id = Number(f.slice(3));
      return pres.some((x) => x.bultos.some((b) => b.id === id));
    },
    [presDe]
  );

  // Todos los filtros menos el de estado: sirve para los contadores de estado.
  const baseFiltrada = useMemo(() => {
    const qn = q.trim().toLowerCase();
    return products.filter(
      (p) =>
        (!qn ||
          p.name.toLowerCase().includes(qn) ||
          p.sku?.toLowerCase().includes(qn) ||
          p.slug?.toLowerCase().includes(qn) ||
          p.presentation?.toLowerCase().includes(qn)) &&
        (categoria === 'all' || categoriasDe(p).includes(categoria)) &&
        pasaBulto(p, filtroBulto)
    );
  }, [products, q, categoria, filtroBulto, pasaBulto]);

  const visibles = useMemo(() => {
    const test = ESTADOS.find((e) => e.value === estado)!.test;
    const list = baseFiltrada.filter(test);
    return list.sort((a, b) =>
      orden === 'nuevos'
        ? b.id - a.id
        : orden === 'nombreDesc'
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name)
    );
  }, [baseFiltrada, estado, orden]);

  const cuentaBulto = (f: FiltroBulto) => products.filter((p) => pasaBulto(p, f)).length;

  const hayFiltros = q !== '' || estado !== 'todos' || categoria !== 'all' || filtroBulto !== 'todos';
  const limpiar = () => {
    setQ('');
    setEstado('todos');
    setCategoria('all');
    setFiltroBulto('todos');
  };

  const seleccionados = products.filter((p) => selected.has(p.id));
  const selVisibles = seleccionados.filter((p) => p.isVisible).length;
  const selOcultos = seleccionados.length - selVisibles;
  const totalVisibles = products.filter((p) => p.isVisible).length;
  const todosVisiblesMarcados = visibles.length > 0 && visibles.every((p) => selected.has(p.id));
  const toggleTodos = () => {
    const next = new Set(selected);
    for (const p of visibles) {
      if (todosVisiblesMarcados) next.delete(p.id);
      else next.add(p.id);
    }
    setSelected(next);
  };
  const toggle = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
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

  // ─── Acciones en masa ───────────────────────────────────────────

  /** Presentaciones de los seleccionados que coinciden con el texto (todas si está vacío). */
  const itemsSeleccion = (): BultoItemRef[] => {
    const pn = presAccion.trim().toLowerCase();
    return seleccionados.flatMap((p) =>
      splitPresentations(p.presentation)
        .filter((pres) => !pn || pres.toLowerCase().includes(pn))
        .map((presentation) => ({ productId: p.id, presentation }))
    );
  };
  const nombreItem = (i: BultoItemRef) =>
    `${products.find((p) => p.id === i.productId)?.name ?? `#${i.productId}`} · ${i.presentation}`;

  const accionBulto = async (quitar: boolean) => {
    if (!token) return;
    const bulto = bultos.find((b) => String(b.id) === bultoAccion);
    if (!bulto) return toast.error('Elegí un bulto');
    const items = itemsSeleccion();
    if (items.length === 0) return toast.error('Ninguna presentación coincide con ese texto');
    try {
      const fn = quitar ? unassignBulto : assignBulto;
      const preview = await fn(token, bulto.id, items, true);
      const afectados = (quitar ? preview.quitar : preview.agregar) ?? [];
      if (afectados.length === 0) {
        toast.info(quitar ? `Ninguna tiene "${bulto.nombre}"` : `Todas ya tienen "${bulto.nombre}"`);
        return;
      }
      setConfirm({
        title: `${quitar ? 'Quitar' : 'Asignar'} "${bulto.nombre}" ${quitar ? 'de' : 'a'} ${afectados.length} presentaciones`,
        description: quitar
          ? 'Esas presentaciones dejan de tener este bulto.'
          : `Se suma a los bultos que ya tengan.${preview.yaTenian ? ` ${preview.yaTenian} ya lo tenían.` : ''}`,
        lines: afectados.map(nombreItem),
        confirmLabel: quitar ? 'Quitar' : 'Asignar',
        danger: quitar,
        onConfirm: async () => {
          const res = await fn(token, bulto.id, items, false);
          toast.success(quitar ? `${res.quitados ?? 0} quitados` : `${res.agregados ?? 0} asignados`);
          await load();
        },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al previsualizar');
    }
  };

  const accionVisibilidad = (isVisible: boolean) => {
    if (!token) return;
    const cambian = seleccionados.filter((p) => p.isVisible !== isVisible);
    if (cambian.length === 0) {
      toast.info(`Todos los seleccionados ya están ${isVisible ? 'visibles' : 'ocultos'}`);
      return;
    }
    setConfirm({
      title: `${isVisible ? 'Mostrar' : 'Ocultar'} ${cambian.length} productos`,
      description: isVisible
        ? 'Van a aparecer en la tienda.'
        : 'Dejan de aparecer en la tienda. No se borra nada.',
      lines: cambian.map((p) => p.name),
      confirmLabel: isVisible ? 'Mostrar' : 'Ocultar',
      danger: !isVisible,
      onConfirm: async () => {
        const fallidos = await enTandas(cambian, (p) => updateProduct(token, p.id, { isVisible }));
        if (fallidos) toast.error(`${fallidos} no se pudieron actualizar`);
        else toast.success(`${cambian.length} productos ${isVisible ? 'visibles' : 'ocultos'}`);
        await load();
      },
    });
  };

  const [toggling, setToggling] = useState<number | null>(null);
  /** Mostrar/ocultar un solo producto (un clic, sin confirmación: es reversible). */
  const toggleVisible = async (p: Product) => {
    if (!token) return;
    setToggling(p.id);
    try {
      await updateProduct(token, p.id, { isVisible: !p.isVisible });
      setProducts((cur) => cur.map((x) => (x.id === p.id ? { ...x, isVisible: !p.isVisible } : x)));
      toast.success(`${p.name}: ${p.isVisible ? 'oculto' : 'visible'} en la tienda`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo cambiar la visibilidad');
    } finally {
      setToggling(null);
    }
  };

  const confirmarBorrado = (p: Product) => {
    if (!token) return;
    setConfirm({
      title: `Eliminar "${p.name}"`,
      description: 'Se borra el producto y sus bultos asignados. No se puede deshacer.',
      confirmLabel: 'Eliminar',
      danger: true,
      onConfirm: async () => {
        await deleteProduct(token, p.id);
        toast.success('Producto eliminado');
        await load();
      },
    });
  };

  // ─── Alta / edición (misma lógica de imágenes que antes) ───────

  const syncImages = async (productId: number, selectedImages: ImageListItem[]) => {
    if (!token) return;
    const existing = await getProductImages(token, productId);
    const byKey = new Map(existing.map((img) => [img.imageKey, img]));
    const keys = new Set(selectedImages.map((img) => img.key));
    const fallidosQuitar = await enTandas(
      existing.filter((img) => !keys.has(img.imageKey)),
      (img) => deleteProductImage(token, productId, img.id)
    );
    const fallidosAgregar = await enTandas(
      selectedImages.filter((img) => !byKey.has(img.key)),
      (img) => associateProductImage(token, productId, img.key, false)
    );
    if (selectedImages.length > 0) {
      const actuales = await getProductImages(token, productId);
      const ids = selectedImages
        .map((img) => actuales.find((ci) => ci.imageKey === img.key)?.id)
        .filter((id): id is number => id !== undefined);
      if (ids.length > 0) await reorderProductImages(token, productId, ids);
    }
    if (fallidosQuitar || fallidosAgregar) {
      toast.error(
        `Producto guardado, pero ${fallidosAgregar} imágenes no se asociaron y ${fallidosQuitar} no se quitaron`
      );
    }
  };

  const handleSubmit = async (
    data: Omit<Product, 'id' | 'slug'>,
    selectedImages?: ImageListItem[],
    imagesLoaded?: boolean
  ) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      if (editing) {
        await updateProduct(token, editing.id, data);
        // Solo sincronizar imágenes si el modal terminó de cargar las existentes
        // (si no, selectedImages estaría incompleto y se borrarían todas).
        if (selectedImages !== undefined && imagesLoaded === true) {
          await syncImages(editing.id, selectedImages).catch(() =>
            toast.error('Producto actualizado, pero hubo un error con las imágenes')
          );
        }
        toast.success('Producto actualizado');
      } else {
        const nuevo = await createProduct(token, data);
        if (selectedImages?.length) {
          try {
            const subidas: { id: number }[] = [];
            for (let i = 0; i < selectedImages.length; i += 3) {
              const res = await Promise.allSettled(
                selectedImages
                  .slice(i, i + 3)
                  .map((img, j) => associateProductImage(token, nuevo.id, img.key, i + j === 0))
              );
              for (const r of res) if (r.status === 'fulfilled') subidas.push(r.value);
            }
            if (subidas.length > 0) await reorderProductImages(token, nuevo.id, subidas.map((s) => s.id));
          } catch {
            toast.error('Producto creado, pero hubo un error con las imágenes');
          }
        }
        toast.success('Producto creado. Ya podés asignarle bultos desde Editar.');
      }
      setIsModalOpen(false);
      setEditing(null);
      await load();
    } catch {
      toast.error(editing ? 'Error al actualizar el producto' : 'Error al crear el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const abrirModal = (p?: Product) => {
    setEditing(p ?? null);
    setIsModalOpen(true);
  };

  // ─── UI ──────────────────────────────────────────────────────────

  const chip = (active: boolean) =>
    `flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
      active ? 'bg-green-50 font-medium text-green-700' : 'text-neutral-600 hover:bg-neutral-50'
    }`;
  const count = (n: number, active: boolean) => (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
        active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
      }`}
    >
      {n}
    </span>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-neutral-900 lg:text-2xl">
            <Package className="h-5 w-5 text-green-700" />
            Productos
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {products.length} productos · filtrá, seleccioná y aplicá acciones en masa.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={isLoading} aria-label="Recargar">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => abrirModal()}>
            <Plus className="mr-1 h-4 w-4" /> Nuevo producto
          </Button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="lg:grid lg:grid-cols-[250px_1fr] lg:gap-6">
        {/* ===== Filtros ===== */}
        <aside className="mb-6 space-y-4 lg:sticky lg:top-6 lg:mb-0 lg:self-start">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Nombre, SKU o presentación"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="bg-white pl-9"
            />
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-2">
            <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Estado</p>
            {ESTADOS.map((e) => (
              <button key={e.value} type="button" onClick={() => setEstado(e.value)} className={chip(estado === e.value)}>
                {e.label}
                {count(baseFiltrada.filter(e.test).length, estado === e.value)}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-2">
            <p className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              <Boxes className="h-3 w-3" /> Bultos
            </p>
            {(
              [
                ['todos', 'Todos'],
                ['con', 'Con bulto'],
                ['sin', 'Sin bulto'],
                ['pendientes', 'Pendientes < 20 L'],
              ] as [FiltroBulto, string][]
            ).map(([v, l]) => (
              <button key={v} type="button" onClick={() => setFiltroBulto(v)} className={chip(filtroBulto === v)}>
                {l}
                {count(cuentaBulto(v), filtroBulto === v)}
              </button>
            ))}
            {bultos.length > 0 && (
              <select
                aria-label="Filtrar por un bulto"
                value={filtroBulto.startsWith('id:') ? filtroBulto : ''}
                onChange={(e) => setFiltroBulto((e.target.value || 'todos') as FiltroBulto)}
                className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm"
              >
                <option value="">Un bulto puntual…</option>
                {bultos.map((b) => (
                  <option key={b.id} value={`id:${b.id}`}>
                    {b.nombre} ({b.asignados})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-2">
            <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Categoría</p>
            <select
              aria-label="Categoría"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm"
            >
              <option value="all">Todas</option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {hayFiltros && (
            <Button variant="ghost" size="sm" className="w-full text-neutral-600" onClick={limpiar}>
              <X className="mr-1 h-4 w-4" /> Limpiar filtros
            </Button>
          )}
        </aside>

        {/* ===== Lista ===== */}
        <section className="min-w-0 space-y-3">
          {/* Barra de selección / acciones en masa */}
          {selected.size > 0 && (
            <div className="sticky top-0 z-10 space-y-2 rounded-xl border border-green-200 bg-green-50 p-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-green-900">{selected.size} seleccionados</span>
                <button type="button" onClick={() => setSelected(new Set())} className="text-xs text-green-800 underline">
                  Limpiar
                </button>
                <span className="mx-1 hidden h-4 w-px bg-green-200 sm:inline-block" />
                <span className="text-xs text-green-800">
                  ({selVisibles} visibles · {selOcultos} ocultos)
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 bg-white"
                  disabled={selOcultos === 0}
                  onClick={() => accionVisibilidad(true)}
                >
                  <Eye className="mr-1 h-3.5 w-3.5" /> Mostrar {selOcultos > 0 && `(${selOcultos})`}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 bg-white"
                  disabled={selVisibles === 0}
                  onClick={() => accionVisibilidad(false)}
                >
                  <EyeOff className="mr-1 h-3.5 w-3.5" /> Ocultar {selVisibles > 0 && `(${selVisibles})`}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Bulto para asignar o quitar"
                  value={bultoAccion}
                  onChange={(e) => setBultoAccion(e.target.value)}
                  className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-sm"
                >
                  <option value="">Bulto…</option>
                  {bultos.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nombre}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder='Solo presentaciones con… (ej. "1 Litro")'
                  value={presAccion}
                  onChange={(e) => setPresAccion(e.target.value)}
                  className="h-8 w-full bg-white sm:w-64"
                />
                <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700" onClick={() => accionBulto(false)}>
                  Asignar bulto
                </Button>
                <Button size="sm" variant="outline" className="h-8 bg-white" onClick={() => accionBulto(true)}>
                  Quitar bulto
                </Button>
              </div>
              {bultos.length === 0 && (
                <p className="text-xs text-amber-700">Todavía no hay bultos: crealos en Catálogo → Bultos.</p>
              )}
            </div>
          )}

          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="flex flex-wrap items-center gap-3 border-b border-neutral-100 px-4 py-2 text-xs text-neutral-500">
              <Checkbox checked={todosVisiblesMarcados} onCheckedChange={toggleTodos} aria-label="Seleccionar todos los visibles" />
              <span className="flex-1">
                {visibles.length} {visibles.length === 1 ? 'producto' : 'productos'}
                {hayFiltros && ` de ${products.length}`}
              </span>
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEstado(estado === 'visibles' ? 'todos' : 'visibles')}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ring-1 ${
                    estado === 'visibles' ? 'bg-green-50 text-green-800 ring-green-300' : 'ring-neutral-200 hover:bg-neutral-50'
                  }`}
                  title="Ver solo visibles en la tienda"
                >
                  <Eye className="h-3 w-3 text-green-600" /> {totalVisibles} en tienda
                </button>
                <button
                  type="button"
                  onClick={() => setEstado(estado === 'ocultos' ? 'todos' : 'ocultos')}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ring-1 ${
                    estado === 'ocultos' ? 'bg-neutral-100 text-neutral-800 ring-neutral-400' : 'ring-neutral-200 hover:bg-neutral-50'
                  }`}
                  title="Ver solo ocultos"
                >
                  <EyeOff className="h-3 w-3" /> {products.length - totalVisibles} ocultos
                </button>
              </span>
              <select
                aria-label="Ordenar"
                value={orden}
                onChange={(e) => setOrden(e.target.value as Orden)}
                className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs"
              >
                <option value="nombre">Nombre A–Z</option>
                <option value="nombreDesc">Nombre Z–A</option>
                <option value="nuevos">Más nuevos</option>
              </select>
            </div>

            {isLoading && products.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              </div>
            ) : visibles.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-neutral-500">
                Ningún producto coincide.{' '}
                {hayFiltros && (
                  <button type="button" onClick={limpiar} className="text-green-700 underline">
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {visibles.map((p) => (
                  <li
                    key={p.id}
                    className={`flex gap-3 px-4 py-3 ${selected.has(p.id) ? 'bg-green-50/50' : ''} ${
                      p.isVisible ? '' : 'bg-neutral-50/70'
                    }`}
                  >
                    <Checkbox
                      className="mt-1"
                      checked={selected.has(p.id)}
                      onCheckedChange={() => toggle(p.id)}
                      aria-label={`Seleccionar ${p.name}`}
                    />
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-neutral-100 bg-neutral-50">
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt={p.name} fill sizes="48px" className="object-contain p-1" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[10px] text-neutral-400">Sin img</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <button
                          type="button"
                          onClick={() => abrirModal(p)}
                          className="truncate text-left text-sm font-medium text-neutral-900 hover:text-green-700"
                        >
                          {p.name}
                        </button>
                        {p.isFeatured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-label="Destacado" />}
                        <button
                          type="button"
                          onClick={() => toggleVisible(p)}
                          disabled={toggling === p.id}
                          title={p.isVisible ? 'Visible en la tienda — clic para ocultar' : 'Oculto — clic para mostrar'}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 transition-colors disabled:opacity-50 ${
                            p.isVisible
                              ? 'bg-green-50 text-green-700 ring-green-200 hover:bg-green-100'
                              : 'bg-neutral-100 text-neutral-500 ring-neutral-200 hover:bg-neutral-200'
                          }`}
                        >
                          {toggling === p.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : p.isVisible ? (
                            <Eye className="h-3 w-3" />
                          ) : (
                            <EyeOff className="h-3 w-3" />
                          )}
                          {p.isVisible ? 'Visible' : 'Oculto'}
                        </button>
                      </div>
                      <p className="truncate text-xs text-neutral-500">
                        {p.sku ? `SKU ${p.sku}` : 'Sin SKU'}
                        {categoriasDe(p).length > 0 && ` · ${categoriasDe(p).join(', ')}`}
                      </p>
                      {/* Presentaciones con sus bultos */}
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {presDe(p).map(({ pres, bultos: bs }) => (
                          <span
                            key={pres}
                            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] ${
                              bs.length === 0 && pareceMenor20L(pres)
                                ? 'border-amber-200 bg-amber-50 text-amber-800'
                                : 'border-neutral-200 bg-white text-neutral-700'
                            }`}
                            title={bs.length === 0 && pareceMenor20L(pres) ? 'Pendiente: < 20 L sin bulto' : undefined}
                          >
                            {pres}
                            {bs.map((b) => (
                              <span key={b.id} className="rounded bg-green-100 px-1 text-green-800">
                                {b.nombre}
                              </span>
                            ))}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-start gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => abrirModal(p)} aria-label={`Editar ${p.name}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                        onClick={() => confirmarBorrado(p)}
                        aria-label={`Eliminar ${p.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {isModalOpen && (
        <ProductFormModal
          product={editing ?? undefined}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsModalOpen(false);
            setEditing(null);
            load(); // los bultos se editan al instante dentro del modal
          }}
          isLoading={isSubmitting}
        />
      )}

      <Dialog open={!!confirm} onOpenChange={(o) => !o && !confirming && setConfirm(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{confirm?.title}</DialogTitle>
            <DialogDescription>{confirm?.description}</DialogDescription>
          </DialogHeader>
          {confirm?.lines && confirm.lines.length > 0 && (
            <ul className="max-h-60 space-y-1 overflow-y-auto rounded-md bg-neutral-50 p-3 text-xs text-neutral-700">
              {confirm.lines.map((l, i) => (
                <li key={`${l}-${i}`} className="truncate">
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
