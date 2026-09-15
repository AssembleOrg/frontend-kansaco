'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { FormField } from '@/components/forms/shared/FormField';
import { PhoneField } from '@/components/forms/shared/PhoneField';
import { FormSuccessPanel } from '@/components/forms/shared/FormSuccessPanel';
import { HoneypotField } from '@/components/forms/shared/HoneypotField';
import { SubmitButton } from '@/components/forms/shared/SubmitButton';
import { controlClass } from '@/components/forms/shared/formStyles';
import { usePublicSubmission } from '@/features/submissions/hooks/usePublicSubmission';
import {
  mayoristaSchema,
  type MayoristaFormValues,
} from '@/features/submissions/schemas';
import { AFIP_OPTIONS } from '@/features/submissions/types';

type Props = {
  /**
   * Cierra el contenedor. Sólo lo pasa el modal: ahí la confirmación ofrece
   * "Cerrar" en vez de "Volver al inicio", porque navegar a la home desde un
   * modal se siente como un salto inesperado. En la página suelta se omite.
   */
  onClose?: () => void;
};

export default function MayoristaApplicationForm({ onClose }: Props = {}) {
  const { submit, submittedName, isSuccess } = usePublicSubmission();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MayoristaFormValues>({
    resolver: zodResolver(mayoristaSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
      cuit: '',
      domicilio: '',
      codigoPostal: '',
      zonaDistribucion: '',
      afip: undefined,
      mensaje: '',
      website: '',
    },
  });

  const onSubmit = async (values: MayoristaFormValues) => {
    const ok = await submit({
      tipo: 'MAYORISTA',
      nombre: values.nombre,
      email: values.email,
      telefono: values.telefono || undefined,
      mensaje: values.mensaje || undefined,
      payload: {
        cuit: values.cuit ?? '',
        domicilio: values.domicilio ?? '',
        codigoPostal: values.codigoPostal ?? '',
        zonaDistribucion: values.zonaDistribucion ?? '',
        afip: values.afip,
      },
      website: values.website,
    });

    if (ok) reset();
  };

  if (isSuccess && submittedName) {
    return (
      <FormSuccessPanel
        nombre={submittedName}
        description="Nuestro equipo comercial va a revisar tu solicitud y se contacta con vos para avanzar con la cuenta de mayorista."
        onClose={onClose}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-5" noValidate>
      <HoneypotField registration={register('website')} />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="nombre" label="Tu nombre" required error={errors.nombre?.message}>
          {(aria) => (
            <input
              {...register('nombre')}
              {...aria}
              type="text"
              autoComplete="organization"
              disabled={isSubmitting}
              className={controlClass(Boolean(errors.nombre))}
              placeholder="Nombre completo o razón social"
            />
          )}
        </FormField>

        <FormField
          id="email"
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

        <FormField id="cuit" label="Tu CUIT" error={errors.cuit?.message}>
          {(aria) => (
            <input
              {...register('cuit')}
              {...aria}
              type="text"
              inputMode="numeric"
              disabled={isSubmitting}
              className={controlClass(Boolean(errors.cuit))}
              placeholder="XX-XXXXXXXX-X"
            />
          )}
        </FormField>

        <PhoneField
          control={control}
          name="telefono"
          id="telefono"
          label="Teléfono"
          error={errors.telefono?.message}
          disabled={isSubmitting}
        />
      </div>

      <FormField
        id="domicilio"
        label="Domicilio completo (Localidad y Provincia)"
        error={errors.domicilio?.message}
      >
        {(aria) => (
          <input
            {...register('domicilio')}
            {...aria}
            type="text"
            autoComplete="street-address"
            disabled={isSubmitting}
            className={controlClass(Boolean(errors.domicilio))}
            placeholder="Calle 123, Ciudad, Provincia"
          />
        )}
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="codigoPostal"
          label="Código Postal"
          error={errors.codigoPostal?.message}
        >
          {(aria) => (
            <input
              {...register('codigoPostal')}
              {...aria}
              type="text"
              autoComplete="postal-code"
              disabled={isSubmitting}
              className={controlClass(Boolean(errors.codigoPostal))}
              placeholder="XXXX"
            />
          )}
        </FormField>

        <FormField
          id="zonaDistribucion"
          label="Zona de distribución"
          error={errors.zonaDistribucion?.message}
        >
          {(aria) => (
            <input
              {...register('zonaDistribucion')}
              {...aria}
              type="text"
              disabled={isSubmitting}
              className={controlClass(Boolean(errors.zonaDistribucion))}
              placeholder="Ej: GBA Norte, Córdoba Capital, etc."
            />
          )}
        </FormField>
      </div>

      <FormField
        id="afip"
        label="Situación ante AFIP"
        required
        error={errors.afip?.message}
      >
        {(aria) => (
          <select
            {...register('afip')}
            {...aria}
            disabled={isSubmitting}
            defaultValue=""
            className={controlClass(Boolean(errors.afip))}
          >
            <option value="" disabled>
              Seleccioná una opción
            </option>
            {AFIP_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <FormField
        id="mensaje"
        label="Información adicional o carta de presentación"
        error={errors.mensaje?.message}
      >
        {(aria) => (
          <textarea
            {...register('mensaje')}
            {...aria}
            rows={5}
            disabled={isSubmitting}
            className={controlClass(Boolean(errors.mensaje))}
            placeholder="Contanos sobre tu negocio, qué productos te interesan, tu experiencia en el rubro..."
          />
        )}
      </FormField>

      <SubmitButton
        isSubmitting={isSubmitting}
        label="Enviar Solicitud"
        icon={Mail}
      />

      <p className="text-center text-xs text-gray-400">
        Te contactamos por email o teléfono para avanzar con tu cuenta.
      </p>
    </form>
  );
}
