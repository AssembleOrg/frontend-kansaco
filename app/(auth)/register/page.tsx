// /app/(auth)/register/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { registerUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRole } from '@/types/auth';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
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
  Building2,
  Store,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState<string | undefined>(undefined);
  const [direccion, setDireccion] = useState('');
  const [rol, setRol] = useState<UserRole>('CLIENTE_MINORISTA');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validatePassword = (): boolean => {
    setPasswordError(null);
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

    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    if (!telefono || !isValidPhoneNumber(telefono)) {
      setError('Por favor ingresa un numero de telefono valido.');
      return;
    }

    setIsRegistering(true);

    const telefonoWhatsapp = telefono.replace(/\D/g, '');

    try {
      const payload = {
        email,
        password,
        nombre,
        apellido,
        telefono: telefonoWhatsapp,
        direccion: direccion || undefined,
        rol,
      };
      await registerUser(payload);

      setSuccessMessage(
        '¡Registro exitoso! Ya puedes iniciar sesión con tus credenciales.'
      );
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setNombre('');
      setApellido('');
      setTelefono(undefined);
      setDireccion('');
      setRol('CLIENTE_MINORISTA');
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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black py-12 px-4 relative overflow-hidden">
      {/* Page-level ambient orbs */}
      <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-[#16a245]/[0.08] blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-[10%] w-56 h-56 rounded-full bg-[#16a245]/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-md relative z-10">
        {/* Main Form Card */}
        <Card className="bg-gray-900 shadow-2xl border border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-8 border-b border-gray-800">
            {/* Decorative glow circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#16a245]/15 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#16a245]/[0.12] rounded-full translate-y-12 -translate-x-12 blur-2xl"></div>

            <CardHeader className="text-center pb-0 relative z-10">
              <div className="mb-6 inline-block">
                <div className="relative">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-950 rounded-2xl shadow-lg p-6 border border-gray-700">
                    <Image
                      src="/logo-kansaco.webp"
                      quality={90}
                      alt="Kansaco"
                      width={100}
                      height={100}
                      className="mx-auto"
                    />
                  </div>
                  {/* Accent dot */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#16a245] rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              <CardTitle className="text-3xl font-bold text-white mb-2">
                Crear Cuenta
              </CardTitle>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="h-px bg-gradient-to-r from-transparent via-[#16a245] to-transparent w-16"></div>
                <span className="text-[#16a245] font-semibold text-sm tracking-wider">KANSACO</span>
                <div className="h-px bg-gradient-to-r from-transparent via-[#16a245] to-transparent w-16"></div>
              </div>
              <CardDescription className="text-gray-300 text-lg">
                Únete a nuestra comunidad de clientes
              </CardDescription>
            </CardHeader>
          </div>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Success Message */}
              {successMessage && (
                <Alert className="border-[#16a245]/40 bg-[#16a245]/10">
                  <CheckCircle className="h-4 w-4 text-[#16a245]" />
                  <AlertTitle className="text-white">¡Éxito!</AlertTitle>
                  <AlertDescription className="text-gray-300">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {error && (
                <Alert className="bg-red-950/60 border border-red-800/60">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertTitle className="text-red-300">Error de Registro</AlertTitle>
                  <AlertDescription className="text-gray-300">{error}</AlertDescription>
                </Alert>
              )}

              {/* Tipo de Cliente - Toggle */}
              <div className="space-y-2">
                <Label className="text-gray-300 font-medium">
                  Tipo de Cliente
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRol('CLIENTE_MINORISTA')}
                    disabled={isRegistering}
                    className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      rol === 'CLIENTE_MINORISTA'
                        ? 'border-[#16a245] bg-[#16a245]/10 text-[#16a245]'
                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <Store className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Minorista</div>
                      <div className="text-xs text-gray-400">Compra individual</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRol('CLIENTE_MAYORISTA')}
                    disabled={isRegistering}
                    className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      rol === 'CLIENTE_MAYORISTA'
                        ? 'border-[#16a245] bg-[#16a245]/10 text-[#16a245]'
                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <Building2 className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Mayorista</div>
                      <div className="text-xs text-gray-400">Compra al por mayor</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-gray-300 font-medium">
                  Nombre
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Tu nombre"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    disabled={isRegistering}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#16a245] focus:ring-[#16a245]/30"
                  />
                </div>
              </div>

              {/* Apellido */}
              <div className="space-y-2">
                <Label htmlFor="apellido" className="text-gray-300 font-medium">
                  Apellido
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="apellido"
                    type="text"
                    placeholder="Tu apellido"
                    required
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    disabled={isRegistering}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#16a245] focus:ring-[#16a245]/30"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-gray-300 font-medium">
                  Teléfono
                </Label>
                <PhoneInput
                  international
                  defaultCountry="AR"
                  countryCallingCodeEditable={false}
                  value={telefono}
                  onChange={setTelefono}
                  disabled={isRegistering}
                  className="phone-input-custom phone-input-dark"
                />
                {telefono && !isValidPhoneNumber(telefono) && (
                  <p className="text-xs text-red-400">Numero de telefono invalido</p>
                )}
              </div>

              {/* Dirección */}
              <div className="space-y-2">
                <Label htmlFor="direccion" className="text-gray-300 font-medium">
                  Dirección (Opcional)
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="direccion"
                    type="text"
                    placeholder="Tu dirección"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    disabled={isRegistering}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#16a245] focus:ring-[#16a245]/30"
                  />
                </div>
              </div>

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
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isRegistering}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#16a245] focus:ring-[#16a245]/30"
                  />
                </div>
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
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isRegistering}
                    className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#16a245] focus:ring-[#16a245]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300 font-medium">
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isRegistering}
                    className={`pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#16a245] focus:ring-[#16a245]/30 ${
                      passwordError ? 'border-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-400">{passwordError}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#16a245] hover:bg-[#0d7a32] text-white"
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </span>
                ) : (
                  'Crear Cuenta'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col items-stretch border-t border-gray-800 pt-8">
            <div className="w-full">
              {/* Nivel 1: Acción Primaria - Ver productos sin registro */}
              <Link
                href="/productos"
                className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-[#16a245]/10 border border-[#16a245]/30 rounded-lg text-[#16a245] font-semibold text-sm hover:bg-[#16a245]/20 hover:border-[#16a245]/60 hover:scale-[1.02] transition-all duration-200 group"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Ver productos sin registrarse</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Nivel 2: Acción Secundaria - Login */}
              <div className="mt-6">
                <p className="text-sm text-gray-300 text-center">
                  ¿Ya tienes cuenta?{' '}
                  <Link
                    href="/login"
                    className="text-[#16a245] hover:text-[#0d7a32] font-medium hover:underline transition-colors"
                  >
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
