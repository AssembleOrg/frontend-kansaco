'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { FormField } from '@/components/forms/shared/FormField';
import { FormSuccessPanel } from '@/components/forms/shared/FormSuccessPanel';
import { HoneypotField } from '@/components/forms/shared/HoneypotField';
import { SubmitButton } from '@/components/forms/shared/SubmitButton';
import { controlClass } from '@/components/forms/shared/formStyles';
import { usePublicSubmission } from '@/features/submissions/hooks/usePublicSubmission';
import {
  lubriExpertoSchema,
  type LubriExpertoFormValues,
} from '@/features/submissions/schemas';

export default function LubriExpertoForm() {
  const { submit, submittedName, isSuccess, reset: resetStatus } =
    usePublicSubmission();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LubriExpertoFormValues>({
    resolver: zodResolver(lubriExpertoSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      nombre: '',
      email: '',
      vehiculo: '',
      mensaje: '',
      website: '',
    },
  });

  const onSubmit = async (values: LubriExpertoFormValues) => {
    const ok = await submit({
      tipo: 'LUBRI_EXPERTO',
      nombre: values.nombre,
      email: values.email,
      mensaje: values.mensaje,
      payload: { vehiculo: values.vehiculo ?? '' },
      website: values.website,
    });

    // En caso de error se conservan los valores para que el visitante
    // pueda reintentar sin volver a escribir todo.
    if (ok) reset();
  };

  if (isSuccess && submittedName) {
    return (
      <FormSuccessPanel
        nombre={submittedName}
        description="Un asesor técnico va a revisar tu consulta y responderte por email a la brevedad."
        onReset={resetStatus}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-5" noValidate>
      <HoneypotField registration={register('website')} />

      <div className="grid gap-5 md:grid-cols-2">
        <FormField id="le-nombre" label="Tu nombre" required error={errors.nombre?.message}>
          {(aria) => (
            <input
              {...register('nombre')}
              {...aria}
              type="text"
              autoComplete="name"
              disabled={isSubmitting}
              className={controlClass(Boolean(errors.nombre))}
              placeholder="Juan García"
            />
          )}
        </FormField>

        <FormField
          id="le-email"
          label="Tu correo electrónico"
          required
          error={errors.email?.message}
        >
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

      <FormField id="le-vehiculo" label="Vehículo o equipo" error={errors.vehiculo?.message}>
        {(aria) => (
          <input
            {...register('vehiculo')}
            {...aria}
            type="text"
            disabled={isSubmitting}
            className={controlClass(Boolean(errors.vehiculo))}
            placeholder="Ej: Honda CB 190, Renault Kangoo 1.6, compresor industrial..."
          />
        )}
      </FormField>

      <FormField
        id="le-consulta"
        label="¿Qué necesitás?"
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
            placeholder="Ej: Necesito un aceite para mi moto de uso urbano, hago unos 50 km diarios por ciudad..."
          />
        )}
      </FormField>

      <SubmitButton isSubmitting={isSubmitting} label="Enviar consulta" icon={Mail} />

      <p className="text-center text-xs text-gray-500">
        Te respondemos por email. No compartimos tus datos con terceros.
      </p>
    </form>
  );
}
