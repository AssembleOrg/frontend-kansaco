'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { submitPublicForm, SubmissionError } from '../api';
import type { PublicSubmissionInput } from '../types';

interface UsePublicSubmissionResult {
  submit: (input: PublicSubmissionInput) => Promise<boolean>;
  /** Nombre enviado, para personalizar el panel de éxito. */
  submittedName: string | null;
  errorMessage: string | null;
  isSuccess: boolean;
  reset: () => void;
}

/**
 * Mecánica de envío compartida por los 3 formularios públicos.
 *
 * El estado de éxito es explícito y sólo se activa cuando el backend confirmó
 * la recepción: el problema que originó este trabajo era mostrar éxito sin que
 * la solicitud hubiera llegado a ningún lado.
 */
export function usePublicSubmission(): UsePublicSubmissionResult {
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = useCallback(async (input: PublicSubmissionInput) => {
    setErrorMessage(null);
    try {
      await submitPublicForm(input);
      setSubmittedName(input.nombre);
      toast.success('¡Recibimos tu solicitud!', {
        description: 'Te vamos a contactar a la brevedad.',
      });
      return true;
    } catch (error) {
      const message =
        error instanceof SubmissionError
          ? error.message
          : 'No pudimos enviar tu solicitud. Intentá de nuevo.';
      setErrorMessage(message);
      toast.error('No pudimos enviar tu solicitud', { description: message });
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setSubmittedName(null);
    setErrorMessage(null);
  }, []);

  return {
    submit,
    submittedName,
    errorMessage,
    isSuccess: submittedName !== null,
    reset,
  };
}
