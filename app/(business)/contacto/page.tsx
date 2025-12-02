'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackToHomeButton from '@/components/ui/BackToHomeButton';
import ContactFormMailto from '@/components/forms/ContactFormMailto';

export default function ContactoPage() {
  const socialLinks = [
    {
      icon: Facebook,
      href: 'https://www.facebook.com/kansacolubs/',
      label: 'Facebook',
      color: 'hover:bg-blue-600',
    },
    {
      icon: Instagram,
      href: 'https://www.instagram.com/kansaco',
      label: 'Instagram',
      color: 'hover:bg-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-black via-gray-950 to-gray-900 pt-20">
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(22, 162, 69, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(22, 162, 69, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="mb-2 text-5xl font-black text-[#16a245] md:text-6xl">
              CONTÁCTANOS
            </h1>
            <p className="mx-auto max-w-4xl text-xl text-gray-300">
              ¿Necesitas ayuda o asesoramiento? Comunícate con nosotros por los
              medios que prefieras.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="bg-gradient-to-b from-gray-900 to-black py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            {/* Contact Information Grid */}
            <div className="mb-12 grid gap-6 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm"
              >
                <h3 className="mb-6 text-2xl font-bold text-white">
                  Información de Contacto
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-[#16a245]/20 p-3">
                      <MapPin className="h-6 w-6 text-[#16a245]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Dirección</h4>
                      <p className="text-gray-300">Buenos Aires, Argentina</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-[#16a245]/20 p-3">
                      <Phone className="h-6 w-6 text-[#16a245]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Teléfonos</h4>
                      <p className="text-gray-300">4237-2636 / 1365 / 0813</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-[#16a245]/20 p-3">
                      <Mail className="h-6 w-6 text-[#16a245]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Email</h4>
                      <a
                        href="mailto:info@kansaco.com"
                        className="text-gray-300 transition-colors hover:text-[#16a245]"
                      >
                        info@kansaco.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-[#16a245]/20 p-3">
                      <Clock className="h-6 w-6 text-[#16a245]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Horarios</h4>
                      <p className="text-gray-300">
                        Lunes a Viernes: 9:00hs - 17:00hs
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm"
              >
                <h3 className="mb-6 text-2xl font-bold text-white">
                  Síguenos en Redes Sociales
                </h3>
                <p className="mb-6 text-gray-300">
                  Mantente actualizado con nuestras novedades, promociones y
                  consejos técnicos sobre lubricación.
                </p>
                <div className="flex gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gray-800 text-gray-400 transition-all duration-300 ${social.color} hover:scale-110 hover:text-white`}
                      aria-label={social.label}
                    >
                      <social.icon className="h-7 w-7" />
                    </a>
                  ))}
                </div>

                {/* Quick Links */}
                <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900/30 p-6">
                  <h4 className="mb-4 text-lg font-semibold text-white">
                    Enlaces Rápidos
                  </h4>
                  <div className="space-y-3">
                    <Link
                      href="/productos"
                      className="block text-gray-300 transition-colors hover:text-[#16a245]"
                    >
                      → Ver catálogo de productos
                    </Link>
                    <Link
                      href="/tecnologia-lubricantes"
                      className="block text-gray-300 transition-colors hover:text-[#16a245]"
                    >
                      → Conocer nuestra tecnología
                    </Link>
                    <Link
                      href="/sobre-nosotros"
                      className="block text-gray-300 transition-colors hover:text-[#16a245]"
                    >
                      → Sobre KANSACO
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Contact Form Section - Nueva */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mx-auto mt-8 max-w-5xl"
            >
              <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
                <h3 className="mb-4 text-2xl font-bold text-white text-center">
                  ¿Quieres trabajar con nosotros?
                </h3>
                <p className="mb-6 text-center text-gray-300">
                  Completa el formulario y te contactaremos
                </p>

                <ContactFormMailto />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
      <BackToHomeButton />
    </div>
  );
}
