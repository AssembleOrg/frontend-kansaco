'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { FormField } from '@/components/forms/shared/FormField';
import { PhoneField } from '@/components/forms/shared/PhoneField';
import { FormSuccessPanel } from '@/components/forms/shared/FormSuccessPanel';
import { HoneypotField } from '@/components/forms/shared/HoneypotField';
import { SubmitButton } from '@/components/forms/shared/SubmitButton';
import { controlClass } from '@/components/forms/shared/formStyles';
import { usePublicSubmission } from '@/features/submissions/hooks/usePublicSubmission';
import {
  trabajoSchema,
  type TrabajoFormValues,
} from '@/features/submissions/schemas';
import { PUESTO_OPTIONS } from '@/features/submissions/types';

export default function WorkWithUsForm() {
  const { submit, submittedName, isSuccess } = usePublicSubmission();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TrabajoFormValues>({
    resolver: zodResolver(trabajoSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
      puesto: undefined,
      mensaje: '',
      website: '',
    },
  });

  const onSubmit = async (values: TrabajoFormValues) => {
    const ok = await submit({
      tipo: 'TRABAJO',
      nombre: values.nombre,
      email: values.email,
      telefono: values.telefono || undefined,
      mensaje: values.mensaje,
      payload: { puesto: values.puesto },
      website: values.website,
    });

    if (ok) reset();
  };

  if (isSuccess && submittedName) {
    return (
      <FormSuccessPanel
        nombre={submittedName}
        description="Guardamos tu postulación. Si tu perfil encaja con una búsqueda abierta, te contactamos y ahí te pedimos el CV."
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-6" noValidate>
      <HoneypotField registration={register('website')} />

      <div className="grid gap-6 md:grid-cols-2">
        <FormField id="nombre" label="Nombre completo" required error={errors.nombre?.message}>
          {(aria) => (
            <input
              {...register('nombre')}
              {...aria}
              type="text"
              autoComplete="name"
              disabled={isSubmitting}
              className={controlClass(Boolean(errors.nombre))}
              placeholder="Tu nombre completo"
            />
          )}
        </FormField>

        <FormField id="email" label="Email" required error={errors.email?.message}>
          {(aria) => (
            <input
              {...register('email')}
              {...aria}
              type="email"
              autoComplete="email"
              disabled={isSubmitting}
              className={controlClass(Boolean(errors.email))}
              placeholder="tu@email.com"
            />
          )}
        </FormField>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PhoneField
          control={control}
          name="telefono"
          id="telefono"
          label="Teléfono (opcional)"
          error={errors.telefono?.message}
          disabled={isSubmitting}
        />

        <FormField
          id="puesto"
          label="Puesto de interés"
          required
          error={errors.puesto?.message}
        >
          {(aria) => (
            <select
              {...register('puesto')}
              {...aria}
              disabled={isSubmitting}
              defaultValue=""
              className={controlClass(Boolean(errors.puesto))}
            >
              <option value="" disabled>
                Seleccioná un área
              </option>
              {PUESTO_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}
        </FormField>
      </div>

      <FormField
        id="mensaje"
        label="Presentación breve"
        required
        error={errors.mensaje?.message}
      >
        {(aria) => (
          <textarea
            {...register('mensaje')}
            {...aria}
            rows={5}
            disabled={isSubmitting}
            className={controlClass(Boolean(errors.mensaje))}
            placeholder="Contanos sobre tu experiencia, habilidades y por qué te gustaría sumarte al equipo..."
          />
        )}
      </FormField>

      <SubmitButton
        isSubmitting={isSubmitting}
        label="Enviar Postulación"
        icon={Send}
      />

      <p className="text-center text-xs text-gray-400">
        Si querés adjuntar tu CV, te lo pedimos cuando te contactemos.
      </p>
    </form>
  );
}
