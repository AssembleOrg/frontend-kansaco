/**
 * Estilos de los formularios públicos (tema oscuro + verde de marca).
 *
 * Estaban triplicados en los 3 formularios y ya habían divergido entre sí.
 */

export const BRAND_GREEN = '#16a245';

export const inputClass =
  'w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/50 disabled:cursor-not-allowed disabled:opacity-60';

/** Mismo control, en estado inválido. */
export const inputErrorClass =
  'w-full rounded-lg border border-red-500 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-60';

export const labelClass = 'mb-2 block text-sm font-medium text-gray-300';

export const errorTextClass = 'mt-1.5 text-sm text-red-400';

export function controlClass(hasError: boolean): string {
  return hasError ? inputErrorClass : inputClass;
}
