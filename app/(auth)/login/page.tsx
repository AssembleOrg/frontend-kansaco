// /app/(auth)/login/page.tsx
'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/authStore';
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
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';


const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValidEmail(validateEmail(newEmail) || newEmail === '');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setIsValidEmail(false);
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }
    if (!password) {
      setError('Por favor, ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await login({ email, password });

      const redirectUrl = searchParams.get('redirect') || '/productos';
      router.push(redirectUrl);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const apiErrorMessage =
        error.response?.data?.message ||
        error.message ||
        'Error al iniciar sesión. Verifica tus credenciales.';
      setError(apiErrorMessage);
      console.error('LoginPage: Error en handleSubmit:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-900 to-black p-12 items-center justify-center overflow-hidden">
        {/* Decorative orbs */}
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

      {/* Right Panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
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
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert className="bg-red-950/60 border border-red-800/60">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertTitle className="text-red-300">Error de autenticación</AlertTitle>
                    <AlertDescription className="text-gray-300">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300 font-medium">
                    Correo Electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@empresa.com"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      disabled={isLoading}
                      className={`pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#16a245] focus:ring-[#16a245]/30 ${
                        !isValidEmail && email ? 'border-red-500' : ''
                      }`}
                    />
                    {!isValidEmail && email && (
                      <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-400" />
                    )}
                  </div>
                  {!isValidEmail && email && (
                    <p className="text-sm text-red-400">
                      Por favor ingresa un correo válido
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300 font-medium">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#16a245] focus:ring-[#16a245]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-[#16a245] hover:bg-[#0d7a32] text-white"
                  disabled={isLoading || (!isValidEmail && !!email)}
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
                {/* Nivel 1: Acción Primaria - Ver productos sin login */}
                <Link
                  href="/productos"
                  className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-[#16a245]/10 border border-[#16a245]/30 rounded-lg text-[#16a245] font-semibold text-sm hover:bg-[#16a245]/20 hover:border-[#16a245]/60 hover:scale-[1.02] transition-all duration-200 group"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Ver productos sin iniciar sesión</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Nivel 2: Acción Secundaria - Registro */}
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

                {/* Nivel 3: Legal - Términos y Condiciones */}
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
