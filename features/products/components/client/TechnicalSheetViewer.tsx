'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Download,
  Loader2,
  FileText,
  AlertTriangle,
  Maximize2,
} from 'lucide-react';
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { fetchTechnicalSheet } from '@/lib/api';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

const clampZoom = (z: number) =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * 100) / 100));

// pdf.js pesa ~1 MB: se carga recién cuando alguien abre una ficha.
let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null;
function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist/legacy/build/pdf.mjs').then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
      return pdfjs as unknown as typeof import('pdfjs-dist');
    });
    pdfjsPromise.catch(() => {
      pdfjsPromise = null;
    });
  }
  return pdfjsPromise;
}

interface PageSize {
  width: number;
  height: number;
}

interface TechnicalSheetViewerProps {
  productId: number;
  productName: string;
  fileName: string;
  token: string;
  onClose: () => void;
}

export default function TechnicalSheetViewer({
  productId,
  productName,
  fileName,
  token,
  onClose,
}: TechnicalSheetViewerProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageSizes, setPageSizes] = useState<PageSize[]>([]);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pinchScale, setPinchScale] = useState(1);

  const blobRef = useRef<Blob | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const pinchRef = useRef<{ startDist: number; scale: number } | null>(null);

  // Cargar el PDF (con el token: el endpoint no es público).
  useEffect(() => {
    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | null = null;
    setStatus('loading');
    setDoc(null);
    setPageSizes([]);

    (async () => {
      try {
        const [pdfjs, blob] = await Promise.all([
          loadPdfjs(),
          fetchTechnicalSheet(token, productId),
        ]);
        if (cancelled) return;
        blobRef.current = blob;
        const data = new Uint8Array(await blob.arrayBuffer());
        loadingTask = pdfjs.getDocument({ data });
        const loaded = await loadingTask.promise;
        if (cancelled) return;
        const sizes: PageSize[] = [];
        for (let i = 1; i <= loaded.numPages; i++) {
          const page = await loaded.getPage(i);
          const vp = page.getViewport({ scale: 1 });
          sizes.push({ width: vp.width, height: vp.height });
        }
        if (cancelled) return;
        setPageSizes(sizes);
        setDoc(loaded);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error && err.message && !/pdf|worker/i.test(err.name)
            ? err.message
            : 'No se pudo abrir la ficha técnica.'
        );
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      loadingTask?.destroy();
    };
  }, [productId, token, reloadKey]);

  // Ancho disponible para el "ajustar al ancho".
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Escala base por página: a zoom 100% cada página ocupa el ancho disponible
  // (una apaisada en medio de verticales no achica a las demás).
  const rotated = rotation % 180 !== 0;
  const padding = containerWidth < 640 ? 16 : 48;
  const scales = pageSizes.map((s) => {
    const width = rotated ? s.height : s.width;
    const fit = containerWidth ? Math.min((containerWidth - padding) / width, 1.5) : 1;
    return fit * zoom;
  });
  const scalesKey = scales.map((x) => x.toFixed(4)).join(',');

  // Dibujar páginas cada vez que cambia el zoom o la rotación.
  useEffect(() => {
    if (!doc || !containerWidth) return;
    let cancelled = false;
    const tasks: RenderTask[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const timer = window.setTimeout(async () => {
      for (let i = 1; i <= doc.numPages && !cancelled; i++) {
        const canvas = canvasRefs.current[i - 1];
        if (!canvas) continue;
        try {
          const page = await doc.getPage(i);
          if (cancelled) return;
          const viewport = page.getViewport({ scale: scales[i - 1] * dpr, rotation });
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const task = page.render({ canvas, viewport });
          tasks.push(task);
          await task.promise;
        } catch (err) {
          if ((err as Error)?.name !== 'RenderingCancelledException') {
            console.error('Error dibujando la ficha técnica:', err);
          }
        }
      }
    }, 60);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      tasks.forEach((t) => t.cancel());
    };
    // scalesKey resume scales (array nuevo en cada render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, scalesKey, rotation]);

  // Página actual según el scroll.
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const middle = el.scrollTop + el.clientHeight / 3;
    let page = 1;
    canvasRefs.current.forEach((c, i) => {
      if (c && c.parentElement && c.parentElement.offsetTop <= middle) page = i + 1;
    });
    setCurrentPage(page);
  }, []);

  const changeZoom = useCallback((next: (z: number) => number) => {
    const el = scrollRef.current;
    setZoom((prev) => {
      const z = clampZoom(next(prev));
      // Mantener el mismo punto del documento a la vista.
      if (el && z !== prev) {
        const ratio = z / prev;
        const top = (el.scrollTop + el.clientHeight / 2) * ratio - el.clientHeight / 2;
        const left = (el.scrollLeft + el.clientWidth / 2) * ratio - el.clientWidth / 2;
        requestAnimationFrame(() => el.scrollTo({ top, left }));
      }
      return z;
    });
  }, []);

  const zoomIn = useCallback(() => changeZoom((z) => z + ZOOM_STEP), [changeZoom]);
  const zoomOut = useCallback(() => changeZoom((z) => z - ZOOM_STEP), [changeZoom]);
  const fitWidth = useCallback(() => setZoom(1), []);
  const rotateLeft = useCallback(() => setRotation((r) => (r + 270) % 360), []);
  const rotateRight = useCallback(() => setRotation((r) => (r + 90) % 360), []);

  const download = useCallback(() => {
    const blob = blobRef.current;
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }, [fileName]);

  // Teclado, bloqueo del scroll de fondo y foco.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if ((e.key === '+' || e.key === '=') && !e.altKey) {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-' && !e.altKey) {
        e.preventDefault();
        zoomOut();
      } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        fitWidth();
      } else if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (e.shiftKey) rotateLeft();
        else rotateRight();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [onClose, zoomIn, zoomOut, fitWidth, rotateLeft, rotateRight]);

  // Ctrl + rueda (y pellizco del touchpad) hace zoom del PDF, no de la página.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const factor = Math.exp(-e.deltaY / 500);
      changeZoom((z) => z * factor);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [changeZoom]);

  // Pellizco con dos dedos en el celular.
  const touchDistance = (t: React.TouchList) =>
    Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchRef.current = { startDist: touchDistance(e.touches), scale: 1 };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const s = touchDistance(e.touches) / pinchRef.current.startDist;
      const limited = clampZoom(zoom * s) / zoom;
      pinchRef.current.scale = limited;
      setPinchScale(limited);
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (pinchRef.current && e.touches.length < 2) {
      const s = pinchRef.current.scale;
      pinchRef.current = null;
      setPinchScale(1);
      if (Math.abs(s - 1) > 0.02) changeZoom((z) => z * s);
    }
  };

  const numPages = pageSizes.length;
  const ready = status === 'ready';
  const btn =
    'inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 disabled:pointer-events-none disabled:opacity-40';

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-neutral-800"
      role="dialog"
      aria-modal="true"
      aria-label={`Ficha técnica de ${productName}`}
      data-testid="technical-sheet-viewer"
    >
      {/* Barra de herramientas */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 border-b border-white/10 bg-neutral-900 px-2 py-1.5 text-white sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FileText className="hidden h-5 w-5 shrink-0 text-green-400 sm:block" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Ficha técnica · {productName}</p>
            <p className="truncate text-xs text-gray-400">{fileName}</p>
          </div>
        </div>

        <div className="order-3 flex w-full items-center justify-center gap-0.5 sm:order-none sm:w-auto">
          <span
            className="mr-1 min-w-[3.5rem] text-center text-xs tabular-nums text-gray-300"
            aria-live="polite"
            data-testid="viewer-page"
          >
            {ready ? `${currentPage} / ${numPages}` : '–'}
          </span>
          <button type="button" className={btn} onClick={zoomOut} disabled={!ready || zoom <= MIN_ZOOM} aria-label="Alejar" title="Alejar (−)">
            <ZoomOut className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={fitWidth}
            disabled={!ready}
            className="h-9 min-w-[3.75rem] rounded-md px-1.5 text-xs font-medium tabular-nums text-gray-200 hover:bg-white/10 disabled:opacity-40"
            aria-label="Ajustar al ancho"
            title="Ajustar al ancho"
            data-testid="viewer-zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button type="button" className={btn} onClick={zoomIn} disabled={!ready || zoom >= MAX_ZOOM} aria-label="Acercar" title="Acercar (+)">
            <ZoomIn className="h-5 w-5" />
          </button>
          <button type="button" className={`${btn} hidden sm:inline-flex`} onClick={fitWidth} disabled={!ready} aria-label="Ajustar al ancho" title="Ajustar al ancho">
            <Maximize2 className="h-4 w-4" />
          </button>
          <span className="mx-1 h-5 w-px bg-white/15" />
          <button type="button" className={btn} onClick={rotateLeft} disabled={!ready} aria-label="Rotar a la izquierda" title="Rotar a la izquierda">
            <RotateCcw className="h-5 w-5" />
          </button>
          <button type="button" className={btn} onClick={rotateRight} disabled={!ready} aria-label="Rotar a la derecha" title="Rotar a la derecha (R)">
            <RotateCw className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={download}
            disabled={!ready}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-green-600 px-3 text-sm font-medium text-white hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Descargar</span>
          </button>
          <button ref={closeRef} type="button" className={btn} onClick={onClose} aria-label="Cerrar" title="Cerrar (Esc)">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Documento */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        className="relative min-h-0 flex-1 overflow-auto"
        style={{ touchAction: 'pan-x pan-y' }}
      >
        {status === 'loading' && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-300">
            <Loader2 className="h-8 w-8 animate-spin text-green-400" />
            <p className="text-sm">Abriendo ficha técnica…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center text-gray-200">
            <AlertTriangle className="h-10 w-10 text-amber-400" />
            <p className="max-w-sm text-sm">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="rounded-md border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
            >
              Reintentar
            </button>
          </div>
        )}

        {ready && (
          <div
            className="mx-auto flex w-max min-w-full flex-col items-center gap-4 px-2 py-4 sm:px-6 sm:py-6"
            style={
              pinchScale !== 1
                ? { transform: `scale(${pinchScale})`, transformOrigin: 'center top' }
                : undefined
            }
          >
            {pageSizes.map((size, i) => {
              const w = (rotated ? size.height : size.width) * scales[i];
              const h = (rotated ? size.width : size.height) * scales[i];
              return (
                <div
                  key={i}
                  className="bg-white shadow-lg"
                  style={{ width: w, height: h }}
                  data-testid="viewer-pagebox"
                >
                  <canvas
                    ref={(el) => {
                      canvasRefs.current[i] = el;
                    }}
                    style={{ width: w, height: h, display: 'block' }}
                    aria-label={`Página ${i + 1} de ${numPages}`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
