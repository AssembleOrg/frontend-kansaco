'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  ArrowUp,
} from 'lucide-react';
import OilDropEffect from './OilDropEffect';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const companyLinks = [
    { name: 'Sobre Nosotros', href: '/sobre-nosotros' },
    { name: 'Nuestra Tecnología', href: '/tecnologia-lubricantes' },
    { name: 'Ser Mayorista', href: '/mayorista' },
  ];

  const supportLinks = [
    { name: 'Contacto', href: '/contacto' },
    { name: 'Guía de Compra', href: '/guia-compra' },
    { name: 'Términos y Condiciones', href: '/terminos-y-condiciones' },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/kansacolubs/', label: 'Facebook' },
    { icon: Instagram, href: 'https://www.instagram.com/kansaco', label: 'Instagram' },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-black via-gray-950 to-gray-900 text-white">
      <OilDropEffect x="25%" y="65%" size="medium" intensity="normal" />
      <OilDropEffect x="15%" y="74.5%" size="small" intensity="normal" />
      <OilDropEffect x="35%" y="58%" size="small" intensity="normal" />

      <div className="absolute left-0 right-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent"></div>

      <div className="relative z-10 h-1 bg-gradient-to-r from-transparent via-[#16a245] to-transparent"></div>

      <div className="container relative z-10 mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
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
                <h3 className="text-2xl font-black tracking-wider group-hover:text-[#16a245] transition-colors duration-200">KANSACO</h3>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-200">Ingeniería Líquida</p>
              </div>
            </Link>

            <p className="leading-relaxed text-gray-400">
              Más de 15 años desarrollando tecnologías avanzadas en lubricación
              para maximizar el rendimiento y protección de motores y
              maquinarias.
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400">
                <MapPin className="h-5 w-5 flex-shrink-0 text-[#16a245]" />
                <span className="text-sm">Buenos Aires, Argentina</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Phone className="h-5 w-5 flex-shrink-0 text-[#16a245]" />
                <span className="text-sm">4237-2636/1365/0813</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail className="h-5 w-5 flex-shrink-0 text-[#16a245]" />
                <span className="text-sm">info@kansaco.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Clock className="h-5 w-5 flex-shrink-0 text-[#16a245]" />
                <span className="text-sm">Lun - Vie: 8:00 - 18:00</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="mb-6 text-lg font-bold text-white">Productos</h4>
            <ul className="space-y-3">
              {productCategories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="text-sm text-gray-400 transition-colors duration-200 hover:text-[#16a245]"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="mb-6 text-lg font-bold text-white">Empresa</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors duration-200 hover:text-[#16a245]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="mb-6 text-lg font-bold text-white">Soporte</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors duration-200 hover:text-[#16a245]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="pt-6">
              <h5 className="mb-4 text-sm font-semibold text-white">
                Síguenos
              </h5>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-all duration-300 hover:bg-[#16a245] hover:text-white"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-center text-sm text-gray-400">
              © 2025 KANSACO. Todos los derechos reservados.
            </div>

            <div className="flex flex-col items-center justify-center space-y-3 md:flex-row md:space-x-6 md:space-y-0">
              <div className="text-center text-sm text-gray-400">
                Desarrollado por{' '}
                <a
                  href="https://wa.me/5491138207230"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-yellow-400 transition-colors duration-200 hover:text-yellow-300"
                >
                  Pistech
                </a>
              </div>

              <Link
                href="/privacidad"
                className="text-sm text-gray-400 transition-colors duration-200 hover:text-[#16a245]"
              >
                Política de Privacidad
              </Link>

              <button
                onClick={scrollToTop}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#16a245] text-white transition-colors duration-300 hover:bg-[#0d7a32]"
                aria-label="Volver arriba"
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.01]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(22, 162, 69, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(22, 162, 69, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>
    </footer>
  );
};

export default Footer;
