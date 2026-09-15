'use client';

import { ReactNode } from 'react';
import { errorTextClass, labelClass } from './formStyles';

interface FormFieldProps {
  /** Debe coincidir con el `id` del control que se renderiza adentro. */
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  /** Recibe los atributos ARIA ya calculados para pasarlos al input. */
  children: (aria: {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby': string | undefined;
  }) => ReactNode;
}

/**
 * Envuelve label + control + mensaje de error, cableando los atributos ARIA
 * en un solo lugar en vez de repetirlos en ~20 campos.
 */
export function FormField({
  id,
  label,
  required = false,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && (
          <span className="text-red-500" aria-hidden="true">
            {' '}
            *
          </span>
        )}
        {required && <span className="sr-only"> (obligatorio)</span>}
      </label>

      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy,
      })}

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-gray-500">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className={errorTextClass}>
          {error}
        </p>
      )}
    </div>
  );
}
