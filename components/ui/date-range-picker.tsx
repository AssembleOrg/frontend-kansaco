'use client';

import { useState, useRef, useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import 'react-day-picker/style.css';

type Range = { from: Date | undefined; to: Date | undefined };

interface DateRangePickerProps {
  value: Range;
  onChange: (range: Range) => void;
  placeholder?: string;
  className?: string;
  /** Sin botón ni popover: presets + calendario directo (p. ej. dentro de un sheet). */
  inline?: boolean;
  /** Lado del botón al que se alinea el popover en desktop ('end' si el botón está a la derecha). */
  align?: 'start' | 'end';
}

const PRESETS = [
  { label: 'Este mes', key: 'month' },
  { label: 'Mes pasado', key: 'lastMonth' },
  { label: 'Últimos 30 días', key: 'last30' },
  { label: 'Este año', key: 'year' },
];

export function formatRangeLabel(value: Range, placeholder = 'Seleccionar fechas') {
  const f = (d: Date) => format(d, 'dd MMM yyyy', { locale: es });
  if (!value.from) return placeholder;
  return value.to ? `${f(value.from)} — ${f(value.to)}` : `${f(value.from)} — ...`;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Seleccionar fechas',
  className = '',
  inline = false,
  align = 'start',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const range: DateRange | undefined =
    value.from ? { from: value.from, to: value.to } : undefined;

  const close = (delay: number) => {
    if (!inline) setTimeout(() => setOpen(false), delay);
  };

  const handleSelect = (selected: DateRange | undefined) => {
    onChange({ from: selected?.from, to: selected?.to });
    // Auto-close when both dates selected
    if (selected?.from && selected?.to) close(200);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ from: undefined, to: undefined });
  };

  const panel = (
    <>
      {/* Presets */}
      <div className="mb-3 flex flex-wrap gap-2 border-b border-gray-100 pb-3">
        {PRESETS.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => {
              onChange(getPresetRange(preset.key));
              close(150);
            }}
            className="rounded-full border border-green-200 bg-green-50 px-3.5 py-1.5 text-sm font-medium text-green-800 transition-colors hover:border-green-400 hover:bg-green-100"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <DayPicker
        mode="range"
        selected={range}
        onSelect={handleSelect}
        locale={es}
        numberOfMonths={isMobile || inline ? 1 : 2}
        showOutsideDays
        // Solo className (se suma a rdp-root). `classNames` reemplaza las clases
        // rdp-* y rompe el layout de react-day-picker/style.css.
        className="drp"
      />

      {/* Footer */}
      {value.from && (
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <p className="text-sm text-gray-500">
            {value.from && value.to
              ? `${Math.round((value.to.getTime() - value.from.getTime()) / (1000 * 60 * 60 * 24)) + 1} días seleccionados`
              : 'Tocá la fecha de fin'}
          </p>
          <button
            type="button"
            onClick={() => onChange({ from: undefined, to: undefined })}
            className="text-sm text-gray-500 transition-colors hover:text-red-500"
          >
            Limpiar
          </button>
        </div>
      )}
    </>
  );

  if (inline) return <div className={className}>{panel}</div>;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          flex h-10 w-full items-center gap-2 rounded-md border bg-white px-3 text-sm
          shadow-sm transition-all hover:border-gray-400
          ${open ? 'border-green-500 ring-2 ring-green-500/20' : value.from ? 'border-green-500' : 'border-gray-300'}
          ${value.from ? 'bg-green-50 text-green-800 font-medium' : 'text-gray-500'}
        `}
      >
        <Calendar className="h-4 w-4 text-green-600 shrink-0" />
        <span className="truncate">{formatRangeLabel(value, placeholder)}</span>
        {value.from ? (
          <X
            className="h-4 w-4 text-gray-400 hover:text-gray-600 shrink-0 ml-auto"
            onClick={handleClear}
          />
        ) : (
          <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Dropdown: en celular se ancla al viewport para no desbordar */}
      {open && (
        <div className={`fixed inset-x-4 top-24 z-50 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150 md:absolute md:inset-x-auto md:top-full md:mt-2 md:max-h-none md:w-max md:p-5 ${align === 'end' ? 'md:right-0' : 'md:left-0'}`}>
          {panel}
        </div>
      )}
    </div>
  );
}

function getPresetRange(preset: string): { from: Date; to: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'month':
      return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: today };
    case 'lastMonth':
      return {
        from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        to: new Date(today.getFullYear(), today.getMonth(), 0),
      };
    case 'year':
      return { from: new Date(today.getFullYear(), 0, 1), to: today };
    case 'last30': {
      const from = new Date(today);
      from.setDate(today.getDate() - 29);
      return { from, to: today };
    }
    default:
      return { from: today, to: today };
  }
}
