// /app/(auth)/login/page.tsx
'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '@/features/cart/store/cartStore';
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
import { Checkbox } from '@/components/ui/checkbox';
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
  const loginFromAuthStore = useAuthStore((state) => state.login);
  const mergeLocalCartToServer = useCartStore(
    (state) => state.mergeLocalCartToServer
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
      await loginFromAuthStore({ email, password });
      console.log('LoginPage: Login exitoso desde authStore.');

      await mergeLocalCartToServer();
      console.log('LoginPage: Fusión del carrito intentada después del login.');

      const redirectUrl = searchParams.get('redirect') || '/productos';
      router.push(redirectUrl);
    } catch (err: unknown) {
      // Handle API errors
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#16a245] to-[#0d7a32] p-12 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-white"
        >
          <div className="text-center mb-12">
            <Image
              src="/landing/kansaco-logo.png"
              alt="Kansaco Logo"
              width={200}
              height={200}
              className="mx-auto mb-6"
              priority
            />
            <h1 className="text-3xl font-bold mb-2">Bienvenido a KANSACO</h1>
            <p className="text-lg opacity-90">Plataforma Mayorista</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="rounded-full bg-white/20 p-3 flex-shrink-0">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Catálogo Completo</h3>
                <p className="opacity-80 text-sm">
                  Accede a todos nuestros productos con precios mayoristas exclusivos.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="rounded-full bg-white/20 p-3 flex-shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Soporte Especializado</h3>
                <p className="opacity-80 text-sm">
                  Asesoramiento técnico personalizado para tu negocio.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="rounded-full bg-white/20 p-3 flex-shrink-0">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Entregas Rápidas</h3>
                <p className="opacity-80 text-sm">
                  Distribución eficiente en todo el territorio nacional.
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
              src="/landing/kansaco-logo.png"
              alt="Kansaco Logo"
              width={120}
              height={120}
              className="mx-auto"
            />
          </div>

          <Card className="bg-white shadow-lg border-gray-200">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Iniciar Sesión
              </CardTitle>
              <CardDescription className="text-gray-600">
                Accede a tu cuenta mayorista
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error de autenticación</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
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
                      className={`pl-10 border-gray-200 focus:border-[#16a245] focus:ring-[#16a245] ${
                        !isValidEmail && email ? 'border-red-300' : ''
                      }`}
                    />
                    {!isValidEmail && email && (
                      <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {!isValidEmail && email && (
                    <p className="text-sm text-red-600">
                      Por favor ingresa un correo válido
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
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
                      className="pl-10 pr-10 border-gray-200 focus:border-[#16a245] focus:ring-[#16a245]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                      Recordarme
                    </Label>
                  </div>
                  <Link
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-sm text-gray-400 cursor-not-allowed"
                    title="Funcionalidad no disponible"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
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

            <CardFooter className="text-center border-t border-gray-100 pt-6">
              <div className="space-y-3 w-full">
                <div className="text-center">
                  <Link
                    href="/productos"
                    className="text-sm text-[#16a245] hover:text-[#0d7a32] font-medium hover:underline"
                  >
                    Ver productos sin iniciar sesión →
                  </Link>
                </div>
                <p className="text-sm text-gray-600">
                  ¿No tienes una cuenta?{' '}
                  <Link
                    href="/register"
                    className="text-[#16a245] hover:text-[#0d7a32] font-medium hover:underline"
                  >
                    Regístrate aquí
                  </Link>
                </p>
                <p className="text-xs text-gray-500">
                  Al iniciar sesión, aceptas nuestros{' '}
                  <Link
                    href="/terminos-y-condiciones"
                    className="text-[#16a245] hover:underline"
                  >
                    Términos y Condiciones
                  </Link>
                </p>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16a245] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
