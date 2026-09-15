'use client';

import type { UseFormRegisterReturn } from 'react-hook-form';

interface HoneypotFieldProps {
  registration: UseFormRegisterReturn;
}

/**
 * Campo trampa: invisible para las personas, atractivo para los bots que
 * autocompletan todo lo que encuentran. Si llega con contenido, el backend
 * descarta la solicitud en silencio.
 *
 * Se oculta con posicionamiento y no con `display:none`, porque muchos bots
 * detectan esa propiedad y salteán el campo.
 */
export function HoneypotField({ registration }: HoneypotFieldProps) {
  return (
    <div
      aria-hidden="true"
      className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden opacity-0"
    >
      <label htmlFor="website">No completar este campo</label>
      <input
        {...registration}
        type="text"
        id="website"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
