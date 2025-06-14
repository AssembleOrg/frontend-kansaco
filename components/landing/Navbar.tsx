'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShoppingCart, Menu, X, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCart } from '@/features/cart/hooks/useCart';
import { useRouter, usePathname } from 'next/navigation';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { user, token, isAuthReady } = useAuth();
  const { logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  
  // Manejar useCart con fallback para cuando no hay CartProvider
  let cart, openCart, totalItems = 0;
  try {
    const cartHook = useCart();
    cart = cartHook.cart;
    openCart = cartHook.openCart;
    totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  } catch {
    cart = null;
    openCart = () => {}; 
    totalItems = 0;
  }
  
  // Solo mostrar estado de autenticación después de la hidratación
  const isAuthenticated = isHydrated && isAuthReady && !!token;

  useEffect(() => {
    // Marcar como hidratado después del primer render en el cliente
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const productCategories = [
    { name: 'Aceites Sintéticos', href: '/productos?category=Sintéticos' },
    { name: 'Aceites Minerales', href: '/productos?category=Minerales' },
    { name: 'Aceites para Vehículos', href: '/productos?category=Vehículos' },
    { name: 'Aceites Industriales', href: '/productos?category=Industrial' },
    { name: 'Aceites para Motos', href: '/productos?category=Motos' },
    {
      name: 'Derivados y Aditivos',
      href: '/productos?category=Derivados Y Aditivos',
    },
  ];

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'border-b border-gray-800/50 bg-black/95 shadow-2xl backdrop-blur-md'
          : 'border-b border-gray-900/30 bg-black/60 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg shadow-lg transition-all duration-200 group-hover:scale-105">
              <Image
                src="/landing/kansaco-logo.png"
                alt="KANSACO Logo"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-wider text-white group-hover:text-[#16a245] transition-colors duration-200">
                KANSACO
              </h3>
              <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-200">Ingeniería Líquida</p>
            </div>
          </Link>

          <div className="hidden items-center space-x-8 lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setIsProductsDropdownOpen(true)}
              onMouseLeave={() => setIsProductsDropdownOpen(false)}
            >
              <button className="flex items-center space-x-1 font-medium text-white transition-colors duration-200 hover:text-[#16a245]">
                <span>Productos</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isProductsDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isProductsDropdownOpen && (
                  <motion.div
                    className="absolute left-0 top-full mt-2 w-64 rounded-lg border border-gray-800/50 bg-black/95 shadow-xl backdrop-blur-md"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="py-2">
                      {productCategories.map((category) => (
                        <Link
                          key={category.name}
                          href={category.href}
                          className="block px-4 py-2 text-gray-300 transition-colors duration-200 hover:bg-[#16a245]/10 hover:text-[#16a245]"
                        >
                          {category.name}
                        </Link>
                      ))}
                      <div className="mt-2 border-t border-gray-700 pt-2">
                        <Link
                          href="/productos"
                          className="block px-4 py-2 font-medium text-[#16a245] transition-colors duration-200 hover:bg-[#16a245]/10"
                        >
                          Ver Todos los Productos
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/lineas-de-productos"
              className="font-medium text-white transition-colors duration-200 hover:text-[#16a245]"
            >
              Ver Nuestra Línea
            </Link>

            <Link
              href="/sobre-nosotros"
              className="font-medium text-white transition-colors duration-200 hover:text-[#16a245]"
            >
              Sobre Nosotros
            </Link>

            <Link
              href="/contacto"
              className="font-medium text-white transition-colors duration-200 hover:text-[#16a245]"
            >
              Contacto
            </Link>
          </div>

          <div className="flex items-center space-x-4">

            {!isHydrated ? (
              // Estado neutral durante la hidratación para evitar mismatch
              <div className="flex items-center p-2 text-white">
                <User className="h-5 w-5" />
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/cuenta"
                  className="flex items-center p-2 text-white transition-colors duration-200 hover:text-[#16a245]"
                >
                  <User className="h-5 w-5" />
                  <span className="ml-2 hidden text-sm font-medium sm:block">
                    {user?.fullName?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    router.push('/');
                  }}
                  className="flex items-center p-2 text-white transition-colors duration-200 hover:text-red-400"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center p-2 text-white transition-colors duration-200 hover:text-[#16a245]"
              >
                <User className="h-5 w-5" />
              </Link>
            )}

            <div className="relative">
              <button
                onClick={() => {
                  if (totalItems > 0) {
                    if (!pathname.startsWith('/productos')) {
                      router.push('/productos?openCart=true');
                    } else {
                      openCart();
                    }
                  } else {
                    router.push('/productos');
                  }
                }}
                className="p-2 text-white transition-colors duration-200 hover:text-[#16a245]"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#16a245] text-xs font-bold text-white">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>
            </div>

            <button
              className="p-2 text-white transition-colors duration-200 hover:text-[#16a245] lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="border-t border-gray-800/50 bg-black/95 backdrop-blur-md lg:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4 px-4 py-6">
              <div>
                <button
                  onClick={() =>
                    setIsProductsDropdownOpen(!isProductsDropdownOpen)
                  }
                  className="flex w-full items-center justify-between py-2 font-medium text-white"
                >
                  <span>Productos</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isProductsDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isProductsDropdownOpen && (
                    <motion.div
                      className="mt-2 space-y-2 pl-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {productCategories.map((category) => (
                        <Link
                          key={category.name}
                          href={category.href}
                          className="block py-1 text-gray-300 transition-colors duration-200 hover:text-[#16a245]"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/lineas-de-productos"
                className="block py-2 font-medium text-white transition-colors duration-200 hover:text-[#16a245]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Ver Nuestra Línea
              </Link>

              <Link
                href="/sobre-nosotros"
                className="block py-2 font-medium text-white transition-colors duration-200 hover:text-[#16a245]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sobre Nosotros
              </Link>

              <Link
                href="/contacto"
                className="block py-2 font-medium text-white transition-colors duration-200 hover:text-[#16a245]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contacto
              </Link>

              <div className="border-t border-gray-700 pt-4">
                {!isHydrated ? (
                  // Estado neutral durante la hidratación
                  <div className="py-2 text-gray-400">
                    Cargando...
                  </div>
                ) : isAuthenticated ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300">
                      Hola, {user?.fullName?.split(' ')[0]}
                    </p>
                    <Link
                      href="/cuenta"
                      className="block py-2 font-medium text-white transition-colors duration-200 hover:text-[#16a245]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Mi Cuenta
                    </Link>
                    <button
                      onClick={async () => {
                        await logout();
                        setIsMobileMenuOpen(false);
                        router.push('/');
                      }}
                      className="flex items-center py-2 font-medium text-white transition-colors duration-200 hover:text-red-400"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="block py-2 font-medium text-white transition-colors duration-200 hover:text-[#16a245]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
