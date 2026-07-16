'use client';

import { useState, useMemo, useCallback, Suspense, type FormEvent, type ChangeEvent } from 'react';
import { REGISTRATION_ENABLED } from '@/lib/flags';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/authStore';
import { LoginError } from '@/lib/api';
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
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  ShoppingCart,
  Users,
  Truck,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
  WifiOff,
  ServerCrash,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = {
  email?: string;
  password?: string;
};

type SubmitError = {
  title: string;
  message: string;
  code: LoginError['code'] | 'UNKNOWN';
};

const isSafeRedirect = (value: string | null): value is string => {
  if (!value) return false;
  // Only allow internal paths; reject protocol/protocol-relative/back-paths.
  return value.startsWith('/') && !value.startsWith('//') && !value.includes('..');
};

const mapLoginError = (err: unknown): SubmitError => {
  if (err instanceof LoginError) {
    switch (err.code) {
      case 'INVALID_CREDENTIALS':
        return {
          title: 'Credenciales incorrectas',
          message: err.message,
          code: err.code,
        };
      case 'VALIDATION':
        return {
          title: 'Datos inválidos',
          message: err.message,
          code: err.code,
        };
      case 'RATE_LIMITED':
        return {
          title: 'Demasiados intentos',
          message: err.message,
          code: err.code,
        };
      case 'NETWORK':
        return {
          title: 'Sin conexión',
          message: err.message,
          code: err.code,
        };
      case 'SERVER':
        return {
          title: 'Servidor no disponible',
          message: err.message,
          code: err.code,
        };
      default:
        return {
          title: 'No se pudo iniciar sesión',
          message: err.message,
          code: 'UNKNOWN',
        };
    }
  }
  return {
    title: 'No se pudo iniciar sesión',
    message:
      err instanceof Error
        ? err.message
        : 'Ocurrió un error inesperado. Intentá nuevamente.',
    code: 'UNKNOWN',
  };
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);

  const fieldErrors = useMemo<FieldErrors>(() => {
    const errors: FieldErrors = {};
    if (touched.email) {
      if (!email.trim()) errors.email = 'Ingresá tu correo electrónico.';
      else if (!EMAIL_REGEX.test(email.trim()))
        errors.email = 'El formato del correo no es válido.';
    }
    if (touched.password) {
      if (!password) errors.password = 'Ingresá tu contraseña.';
      else if (password.length < 8)
        errors.password = 'La contraseña debe tener al menos 8 caracteres.';
    }
    return errors;
  }, [email, password, touched]);

  const isFormValid =
    EMAIL_REGEX.test(email.trim()) && password.length >= 8;

  const handleEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (submitError) setSubmitError(null);
  }, [submitError]);

  const handlePasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (submitError) setSubmitError(null);
  }, [submitError]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setTouched({ email: true, password: true });

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail) || password.length < 8) {
      return;
    }

    setIsLoading(true);
    setSubmitError(null);

    try {
      const result = await login({ email: normalizedEmail, password });
      // El store devuelve { token, user } en el nivel superior.
      const loggedUser = (result as { user?: { rol?: string } })?.user;

      const requested = searchParams.get('redirect');
      // ADMIN sin redirect explícito → dashboard. El resto → productos.
      const defaultUrl =
        loggedUser?.rol === 'ADMIN' ? '/admin/dashboard' : '/productos';
      const redirectUrl = isSafeRedirect(requested) ? requested : defaultUrl;
      router.push(redirectUrl);
    } catch (err) {
      setSubmitError(mapLoginError(err));
    } finally {
      setIsLoading(false);
    }
  }, [email, password, login, router, searchParams]);

  const ErrorIcon =
    submitError?.code === 'NETWORK'
      ? WifiOff
      : submitError?.code === 'SERVER'
        ? ServerCrash
        : AlertCircle;

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-900 to-black p-12 items-center justify-center overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#16a245]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-[#16a245]/15 blur-2xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(22,162,69,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(22,162,69,0.15) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-white relative z-10"
        >
          <div className="text-center mb-12">
            <Image
              src="/logo-kansaco.webp"
              quality={90}
              alt="Kansaco Logo"
              width={200}
              height={200}
              className="mx-auto mb-6"
              priority
            />
            <h1 className="text-3xl font-bold mb-2">Bienvenido a KANSACO</h1>
            <p className="text-lg text-gray-300">Tu plataforma de compras</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="rounded-full bg-[#16a245]/15 border border-[#16a245]/30 p-3 flex-shrink-0">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Compra Fácil</h3>
                <p className="text-sm text-gray-300">
                  Arma tu carrito y compra con un solo click.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="rounded-full bg-[#16a245]/15 border border-[#16a245]/30 p-3 flex-shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Productos Exclusivos</h3>
                <p className="text-sm text-gray-300">
                  Accede a nuestra línea completa de productos con precios especiales.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="rounded-full bg-[#16a245]/15 border border-[#16a245]/30 p-3 flex-shrink-0">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Entregas Rápidas</h3>
                <p className="text-sm text-gray-300">
                  Distribución a todo el territorio nacional.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <Image
              src="/logo-kansaco.webp"
              quality={90}
              alt="Kansaco Logo"
              width={120}
              height={120}
              className="mx-auto"
            />
          </div>

          <Card className="bg-gray-900 shadow-2xl border border-gray-800">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-white">
                Iniciar Sesión
              </CardTitle>
              <CardDescription className="text-gray-300">
                Accede a tu cuenta para realizar tus compras
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    role="alert"
                    aria-live="assertive"
                  >
                    <Alert className="bg-red-950/60 border border-red-800/60 text-red-300">
                      <ErrorIcon className="h-4 w-4 text-red-400" aria-hidden="true" />
                      <AlertTitle className="text-red-300 font-semibold">
                        {submitError.title}
                      </AlertTitle>
                      <AlertDescription className="text-gray-300">
                        {submitError.message}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300 font-medium">
                    Correo Electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="tu@empresa.com"
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                      disabled={isLoading}
                      aria-invalid={!!fieldErrors.email}
                      aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                      className={`pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#16a245] focus:ring-[#16a245]/30 ${
                        fieldErrors.email ? 'border-red-500' : ''
                      }`}
                    />
                    {fieldErrors.email && (
                      <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-400" />
                    )}
                  </div>
                  {fieldErrors.email && (
                    <p id="email-error" className="text-sm text-red-400">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300 font-medium">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                      disabled={isLoading}
                      aria-invalid={!!fieldErrors.password}
                      aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                      className={`pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#16a245] focus:ring-[#16a245]/30 ${
                        fieldErrors.password ? 'border-red-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p id="password-error" className="text-sm text-red-400">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#16a245] hover:bg-[#0d7a32] text-white"
                  disabled={isLoading || !isFormValid}
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Iniciar Sesión
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex-col items-stretch border-t border-gray-800 pt-8">
              <div className="w-full">
                <Link
                  href="/productos"
                  className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-[#16a245]/10 border border-[#16a245]/30 rounded-lg text-[#16a245] font-semibold text-sm hover:bg-[#16a245]/20 hover:border-[#16a245]/60 hover:scale-[1.02] transition-all duration-200 group"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Ver productos sin iniciar sesión</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* REGISTRATION_ENABLED: ocultar link de registro mientras no esté habilitado */}
                {REGISTRATION_ENABLED ? (
                  <div className="mt-6">
                    <p className="text-sm text-gray-300 text-center">
                      ¿No tienes una cuenta?{' '}
                      <Link
                        href="/register"
                        className="text-[#16a245] hover:text-[#0d7a32] font-medium hover:underline transition-colors"
                      >
                        Regístrate aquí
                      </Link>
                    </p>
                  </div>
                ) : (
                  <div className="mt-6">
                    <p className="text-sm text-gray-500 text-center">
                      El registro de nuevos usuarios estará disponible próximamente.
                    </p>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-800">
                  <p className="text-xs text-gray-300 text-center leading-relaxed">
                    Al iniciar sesión, aceptas nuestros{' '}
                    <Link
                      href="/terminos-y-condiciones"
                      className="text-[#16a245] hover:underline transition-colors"
                    >
                      Términos y Condiciones
                    </Link>
                  </p>
                </div>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16a245] mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
