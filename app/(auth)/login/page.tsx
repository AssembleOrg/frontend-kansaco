// /app/(auth)/login/page.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
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
  LucideShieldCheck,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(true);

  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
      validateEmail(savedEmail);
    }
  }, []);

  const validateEmail = (emailToValidate: string): boolean => {
    if (!emailToValidate) {
      setIsValidEmail(true);
      return true;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = regex.test(emailToValidate);
    setIsValidEmail(isValid);
    return isValid;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    if (error) clearError();

    try {
      const loginSuccess = await login({ email, password });

      if (loginSuccess) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        router.push('/');
      }
    } catch (err) {
      console.error('Login submit error caught in component:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Panel izquierdo */}
      <div className="hidden flex-col items-center justify-center bg-green-600 p-12 text-white lg:flex lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8 text-center">
            {' '}
            <Image
              src="/sauberatras.jpg"
              alt="Kansaco Logo"
              width={180}
              height={180}
              className="mx-auto mb-6 rounded-lg shadow-lg"
            />{' '}
            <h1 className="mb-2 text-4xl font-bold">KANSACO</h1>{' '}
            <p className="text-xl opacity-90">
              Especialistas en Lubricantes
            </p>{' '}
          </div>
          <div className="mx-auto mt-12 max-w-md space-y-6">
            {' '}
            <div className="flex items-start space-x-4">
              {' '}
              <div className="bg-opacity-20 rounded-full bg-white p-2">
                <LucideShieldCheck className="h-6 w-6" />
              </div>{' '}
              <div>
                {' '}
                <h3 className="text-lg font-semibold">
                  Calidad Garantizada
                </h3>{' '}
                <p className="opacity-80">
                  Productos certificados para el máximo rendimiento.
                </p>{' '}
              </div>{' '}
            </div>{' '}
            <div className="flex items-start space-x-4">
              {' '}
              <div className="bg-opacity-20 rounded-full bg-white p-2">
                <LucideShieldCheck className="h-6 w-6" />
              </div>{' '}
              <div>
                {' '}
                <h3 className="text-lg font-semibold">Soporte Técnico</h3>{' '}
                <p className="opacity-80">Asesoramiento especializado.</p>{' '}
              </div>{' '}
            </div>{' '}
            <div className="flex items-start space-x-4">
              {' '}
              <div className="bg-opacity-20 rounded-full bg-white p-2">
                <LucideShieldCheck className="h-6 w-6" />
              </div>{' '}
              <div>
                {' '}
                <h3 className="text-lg font-semibold">Entregas Rápidas</h3>{' '}
                <p className="opacity-80">
                  Distribución eficiente para mayoristas.
                </p>{' '}
              </div>{' '}
            </div>{' '}
          </div>
        </motion.div>
      </div>

      {/* Panel derecho */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-4">
              {' '}
              <div className="mb-2 text-center">
                <div className="mb-6 lg:hidden">
                  {' '}
                  <Image
                    src="/sauberatras.jpg"
                    alt="Kansaco Logo"
                    width={100}
                    height={100}
                    className="mx-auto rounded-lg"
                  />{' '}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                  {' '}
                  Bienvenido a KANSACO{' '}
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  {' '}
                  Accede a nuestra plataforma mayorista{' '}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="animate-shake">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error de autenticación</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center text-gray-700 dark:text-gray-300"
                  >
                    {' '}
                    <Mail className="mr-2 h-4 w-4" /> Correo Electrónico{' '}
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="tucorreo@empresa.com"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      disabled={isLoading}
                      className={`pl-3 ${!isValidEmail && email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {!isValidEmail && email && (
                      <div className="absolute top-1/2 right-3 -translate-y-1/2 transform text-red-500">
                        {' '}
                        <AlertCircle className="h-4 w-4" />{' '}
                      </div>
                    )}
                  </div>
                  {!isValidEmail && email && (
                    <p className="mt-1 text-xs text-red-500">
                      {' '}
                      Por favor ingresa un correo válido{' '}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="flex items-center text-gray-700 dark:text-gray-300"
                  >
                    {' '}
                    <Lock className="mr-2 h-4 w-4" /> Contraseña{' '}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Recordarme y Olvidé Contraseña */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="remember"
                      className="cursor-pointer text-sm text-gray-600 dark:text-gray-400"
                    >
                      {' '}
                      Recordarme{' '}
                    </Label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400"
                  >
                    {' '}
                    ¿Olvidaste tu contraseña?{' '}
                  </Link>
                </div>

                {/* Botón de Envío */}
                <Button
                  type="submit"
                  className="w-full bg-green-600 text-white transition-all hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                      Verificando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      {' '}
                      Iniciar Sesión{' '}
                      <ChevronRight className="ml-1 h-4 w-4" />{' '}
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>

            {/* Footer con enlace a Registro */}
            <CardFooter className="flex flex-col space-y-2 pt-4">
              {' '}
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                ¿No tienes una cuenta?
                <Link
                  href="/register"
                  className="ml-1 font-medium text-green-600 hover:text-green-700 hover:underline dark:text-green-400"
                >
                  {' '}
                  Regístrate aquí{' '}
                </Link>
              </div>
              {/* Falta Links a Términos y Privacidad*/}
              <div className="text-center text-xs text-gray-500">
                {' '}
                Al iniciar sesión, aceptas nuestros{' '}
                <Link
                  href="/terms"
                  className="ml-1 text-green-600 hover:underline"
                >
                  {' '}
                  Términos{' '}
                </Link>{' '}
                y{' '}
                <Link
                  href="/privacy"
                  className="ml-1 text-green-600 hover:underline"
                >
                  {' '}
                  Privacidad{' '}
                </Link>{' '}
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
