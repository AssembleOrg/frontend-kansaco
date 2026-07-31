'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

interface FormSuccessPanelProps {
  nombre: string;
  /** Qué va a pasar después, en concreto. */
  description?: string;
  /**
   * Acción de cierre. Se elige una de las tres, en este orden:
   *
   * 1. `onClose` — dentro de un modal: cierra y deja al visitante donde estaba.
   *    Navegar a `/` desde un modal se siente como un salto inesperado.
   * 2. `onReset` — cuando repetir el envío tiene sentido (consultas técnicas).
   * 3. Ninguna — link a la home, el caso por defecto.
   */
  onClose?: () => void;
  onReset?: () => void;
  resetLabel?: string;
}

/**
 * Confirmación visible de que la solicitud quedó registrada.
 *
 * Reemplaza al formulario en vez de sólo mostrar un toast: el toast se
 * desvanece y deja al visitante sin saber si su envío llegó.
 */
export function FormSuccessPanel({
  nombre,
  description = 'Nuestro equipo va a revisar tu solicitud y te contacta a la brevedad.',
  onClose,
  onReset,
  resetLabel = 'Enviar otra consulta',
}: FormSuccessPanelProps) {
  const primerNombre = nombre.trim().split(/\s+/)[0];

  const actionClass =
    'inline-block rounded-lg border border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-200 transition-colors hover:border-gray-500 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#16a245]/50';

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl border border-[#16a245]/40 bg-[#16a245]/10 p-8 text-center"
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#16a245]/20">
        <CheckCircle2 className="h-8 w-8 text-[#16a245]" aria-hidden="true" />
      </div>

      <h3 className="mb-2 text-xl font-semibold text-white">
        ¡Listo{primerNombre ? `, ${primerNombre}` : ''}! Recibimos tu solicitud
      </h3>

      <p className="mx-auto mb-6 max-w-md text-sm text-gray-300">{description}</p>

      {onClose ? (
        <button type="button" onClick={onClose} className={actionClass}>
          Cerrar
        </button>
      ) : onReset ? (
        <button type="button" onClick={onReset} className={actionClass}>
          {resetLabel}
        </button>
      ) : (
        <Link href="/" className={actionClass}>
          Volver al inicio
        </Link>
      )}
    </div>
  );
}
