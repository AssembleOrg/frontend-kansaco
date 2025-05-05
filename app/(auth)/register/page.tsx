// /app/(auth)/register/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { registerUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  User as UserIcon,
  Mail,
  Lock,
} from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Validación simple de contraseña en el frontend
  const validatePassword = (): boolean => {
    if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.');
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (!validatePassword()) {
      return;
    }

    setIsRegistering(true);

    try {
      const payload = { email, password, fullName };
      const response = await registerUser(payload);

      if (response.status === 'success') {
        setSuccessMessage(
          '¡Registro exitoso! Revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión.'
        );
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
      } else {
        setError('Ocurrió un error inesperado durante el registro.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7faf8] px-4">
      <Card className="w-full max-w-md border-[#e6f5eb] shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#4a4a4a]">
            Crear Cuenta
          </CardTitle>
          <CardDescription className="text-[#4a4a4a]">
            Regístrate en Kansaco.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mensaje de Éxito */}
            {successMessage && (
              <Alert
                variant="default"
                className="border-[#16a245] bg-[#e6f5eb] text-[#0d7a32]"
              >
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Éxito</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            {/* Mensaje de Error API */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error de Registro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Input Full Name */}
            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="flex items-center text-[#4a4a4a]"
              >
                <UserIcon className="mr-2 h-4 w-4 text-[#16a245]" />
                Nombre Completo
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Tu nombre completo"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isRegistering}
                className="border-[#e6f5eb] focus:border-[#16a245] focus:ring-[#16a245]"
              />
            </div>

            {/* Input Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="flex items-center text-[#4a4a4a]"
              >
                <Mail className="mr-2 h-4 w-4 text-[#16a245]" />
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isRegistering}
                className="border-[#e6f5eb] focus:border-[#16a245] focus:ring-[#16a245]"
              />
            </div>

            {/* Input Contraseña */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="flex items-center text-[#4a4a4a]"
              >
                <Lock className="mr-2 h-4 w-4 text-[#16a245]" />
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (confirmPassword) validatePassword();
                  }}
                  disabled={isRegistering}
                  className="border-[#e6f5eb] pr-10 focus:border-[#16a245] focus:ring-[#16a245]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#16a245]"
                  tabIndex={-1}
                >
                  {' '}
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}{' '}
                </button>
              </div>
            </div>

            {/* Input Confirmar Contraseña */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="flex items-center text-[#4a4a4a]"
              >
                <Lock className="mr-2 h-4 w-4 text-[#16a245]" />
                Confirmar Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    validatePassword();
                  }}
                  disabled={isRegistering}
                  className={`border-[#e6f5eb] pr-10 focus:border-[#16a245] focus:ring-[#16a245] ${passwordError ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#16a245]"
                  tabIndex={-1}
                >
                  {' '}
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}{' '}
                </button>
              </div>
              {/* Mensaje de Error Contraseña */}
              {passwordError && (
                <p className="mt-1 text-xs text-red-500">{passwordError}</p>
              )}
            </div>

            {/* Botón Registrarse */}
            <Button
              type="submit"
              className="w-full bg-[#16a245] text-white hover:bg-[#0d7a32]"
              disabled={isRegistering}
            >
              {isRegistering ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                  Registrando...
                </span>
              ) : (
                'Registrarse'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-[#4a4a4a]">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="text-[#16a245] underline hover:text-[#0d7a32]"
          >
            Inicia sesión aquí
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
