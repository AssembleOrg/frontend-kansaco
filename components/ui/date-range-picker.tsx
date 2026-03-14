'use client';

import { useState, useRef, useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, ChevronDown, X } from 'lucide-react';
import 'react-day-picker/style.css';

interface DateRangePickerProps {
  value: { from: Date | undefined; to: Date | undefined };
  onChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Seleccionar fechas',
  className = '',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const label = value.from
    ? value.to
      ? `${format(value.from, 'dd MMM yyyy', { locale: es })} — ${format(value.to, 'dd MMM yyyy', { locale: es })}`
      : `${format(value.from, 'dd MMM yyyy', { locale: es })} — ...`
    : placeholder;

  const handleSelect = (selected: DateRange | undefined) => {
    onChange({ from: selected?.from, to: selected?.to });
    // Auto-close when both dates selected
    if (selected?.from && selected?.to) {
      setTimeout(() => setOpen(false), 200);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ from: undefined, to: undefined });
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm
          shadow-sm transition-all hover:border-gray-400
          ${open ? 'border-green-500 ring-2 ring-green-500/20' : 'border-gray-300'}
          ${value.from ? 'text-gray-900 font-medium' : 'text-gray-500'}
        `}
      >
        <Calendar className="h-4 w-4 text-green-600 shrink-0" />
        <span className="truncate">{label}</span>
        {value.from ? (
          <X
            className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 shrink-0 ml-1"
            onClick={handleClear}
          />
        ) : (
          <ChevronDown className={`h-3.5 w-3.5 text-gray-400 shrink-0 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 z-50 mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Presets */}
          <div className="flex flex-wrap gap-1.5 mb-3 pb-3 border-b border-gray-100">
            {[
              { label: 'Esta semana', getValue: () => getPresetRange('week') },
              { label: 'Este mes', getValue: () => getPresetRange('month') },
              { label: 'Este año', getValue: () => getPresetRange('year') },
              { label: 'Ultimos 7 dias', getValue: () => getPresetRange('last7') },
              { label: 'Ultimos 30 dias', getValue: () => getPresetRange('last30') },
              { label: 'Ultimos 90 dias', getValue: () => getPresetRange('last90') },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  const r = preset.getValue();
                  onChange(r);
                  setTimeout(() => setOpen(false), 150);
                }}
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-green-50 hover:border-green-300 hover:text-green-700"
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
            numberOfMonths={2}
            showOutsideDays
            classNames={{
              root: 'drp-root',
              months: 'drp-months',
              month_caption: 'drp-caption',
              nav: 'drp-nav',
              day: 'drp-day',
              today: 'drp-today',
              selected: 'drp-selected',
              range_start: 'drp-range-start',
              range_end: 'drp-range-end',
              range_middle: 'drp-range-middle',
            }}
          />

          {/* Footer */}
          {value.from && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {value.from && value.to
                  ? `${Math.ceil((value.to.getTime() - value.from.getTime()) / (1000 * 60 * 60 * 24)) + 1} dias seleccionados`
                  : 'Selecciona la fecha de fin'}
              </p>
              <button
                type="button"
                onClick={() => {
                  onChange({ from: undefined, to: undefined });
                }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getPresetRange(preset: string): { from: Date; to: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'week': {
      const day = today.getDay();
      const diff = day === 0 ? 6 : day - 1; // Monday start
      const from = new Date(today);
      from.setDate(today.getDate() - diff);
      return { from, to: today };
    }
    case 'month':
      return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: today };
    case 'year':
      return { from: new Date(today.getFullYear(), 0, 1), to: today };
    case 'last7': {
      const from = new Date(today);
      from.setDate(today.getDate() - 6);
      return { from, to: today };
    }
    case 'last30': {
      const from = new Date(today);
      from.setDate(today.getDate() - 29);
      return { from, to: today };
    }
    case 'last90': {
      const from = new Date(today);
      from.setDate(today.getDate() - 89);
      return { from, to: today };
    }
    default:
      return { from: today, to: today };
  }
}
