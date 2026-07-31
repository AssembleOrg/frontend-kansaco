'use client';

import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { FormField } from './FormField';

interface PhoneFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

/**
 * Campo de teléfono con el prefijo del país visible y fijo.
 *
 * Mismo componente y clases que usa el registro (`app/(auth)/register/page.tsx`):
 * muestra la bandera y el `+54` no editable, así que la persona escribe sólo su
 * número. Antes era un input de texto con placeholder "+54 9 11 XXXX-XXXX", que
 * daba a entender que había que tipear el prefijo.
 *
 * `PhoneInput` entrega el valor ya en E.164 (`+541123456789`), que es lo que se
 * guarda y lo que `wa.me/` necesita.
 */
export function PhoneField<T extends FieldValues>({
  control,
  name,
  id,
  label,
  required = false,
  error,
  disabled = false,
}: PhoneFieldProps<T>) {
  return (
    <FormField id={id} label={label} required={required} error={error}>
      {(aria) => (
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <PhoneInput
              international
              defaultCountry="AR"
              countryCallingCodeEditable={false}
              // `PhoneInput` emite `undefined` al vaciarse; el esquema espera
              // string, y así el campo queda controlado en todo momento.
              value={(field.value as string) || undefined}
              onChange={(value) => field.onChange(value ?? '')}
              onBlur={field.onBlur}
              disabled={disabled}
              id={aria.id}
              aria-invalid={aria['aria-invalid']}
              aria-describedby={aria['aria-describedby']}
              placeholder="11 2345-6789"
              className="phone-input-custom phone-input-dark"
            />
          )}
        />
      )}
    </FormField>
  );
}
