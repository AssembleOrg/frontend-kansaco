'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackToHomeButton from '@/components/ui/BackToHomeButton';

export default function PrivacidadPage() {
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

        <div className="container mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#16a245]/20">
              <Shield className="h-10 w-10 text-[#16a245]" />
            </div>
            <h1 className="mb-6 text-5xl font-black text-white md:text-6xl">
              POLÍTICA DE
              <span className="block text-[#16a245]">PRIVACIDAD</span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-300">
              En KANSACO respetamos y protegemos tu privacidad. Conoce cómo recopilamos, 
              utilizamos y protegemos tu información personal.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-24 bg-gradient-to-b from-gray-950 to-black">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            
            {/* Introduction */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-12 rounded-2xl border border-gray-800 bg-gray-900/50 p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16a245]/20">
                  <UserCheck className="h-6 w-6 text-[#16a245]" />
                </div>
                <h2 className="text-3xl font-bold text-white">Compromiso con tu Privacidad</h2>
              </div>
              <p className="text-lg text-gray-300 leading-relaxed">
                En KANSACO, nos comprometemos a proteger y respetar tu privacidad. Esta política 
                de privacidad explica cuándo y por qué recopilamos información personal, cómo la 
                utilizamos, las condiciones bajo las cuales podemos divulgarla y cómo la mantenemos segura.
              </p>
            </motion.div>

            {/* Information Collection */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-12 rounded-2xl border border-gray-800 bg-gray-900/50 p-8"
            >
              <h2 className="mb-6 text-3xl font-bold text-white">Información que Recopilamos</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-3 text-xl font-semibold text-[#16a245]">Información Personal</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Nombre completo y datos de contacto</li>
                    <li>• Información de la empresa (CUIT, razón social)</li>
                    <li>• Dirección de facturación y envío</li>
                    <li>• Información de contacto (teléfono, email)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-3 text-xl font-semibold text-[#16a245]">Información de Navegación</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Datos de uso del sitio web</li>
                    <li>• Dirección IP y información del navegador</li>
                    <li>• Páginas visitadas y tiempo de permanencia</li>
                    <li>• Preferencias y configuraciones del usuario</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* How We Use Information */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-12 rounded-2xl border border-gray-800 bg-gray-900/50 p-8"
            >
              <h2 className="mb-6 text-3xl font-bold text-white">Cómo Utilizamos tu Información</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-xl font-semibold text-[#16a245]">Servicios al Cliente</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Procesar pedidos y solicitudes</li>
                    <li>• Brindar soporte técnico</li>
                    <li>• Gestionar cuentas de usuarios</li>
                    <li>• Responder consultas y comunicaciones</li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-4 text-xl font-semibold text-[#16a245]">Mejora de Servicios</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Mejorar la experiencia del usuario</li>
                    <li>• Desarrollar nuevos productos</li>
                    <li>• Análisis de uso y rendimiento</li>
                    <li>• Personalizar contenido y ofertas</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Data Protection */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-12 rounded-2xl border border-gray-800 bg-gray-900/50 p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16a245]/20">
                  <Lock className="h-6 w-6 text-[#16a245]" />
                </div>
                <h2 className="text-3xl font-bold text-white">Protección de Datos</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>
                  Implementamos medidas de seguridad técnicas y organizativas apropiadas para 
                  proteger tu información personal contra el acceso no autorizado, alteración, 
                  divulgación o destrucción.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold text-white">Medidas Técnicas:</h4>
                    <ul className="space-y-1">
                      <li>• Encriptación de datos sensibles</li>
                      <li>• Sistemas de autenticación seguros</li>
                      <li>• Monitoreo de seguridad continuo</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-white">Medidas Organizativas:</h4>
                    <ul className="space-y-1">
                      <li>• Acceso limitado a información personal</li>
                      <li>• Capacitación del personal en privacidad</li>
                      <li>• Políticas internas de seguridad</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* User Rights */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-12 rounded-2xl border border-gray-800 bg-gray-900/50 p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16a245]/20">
                  <Eye className="h-6 w-6 text-[#16a245]" />
                </div>
                <h2 className="text-3xl font-bold text-white">Tus Derechos</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>
                  Tienes derecho a controlar cómo utilizamos tu información personal. 
                  Puedes ejercer los siguientes derechos:
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <ul className="space-y-2">
                    <li>• <strong>Acceso:</strong> Solicitar una copia de tu información</li>
                    <li>• <strong>Rectificación:</strong> Corregir información inexacta</li>
                    <li>• <strong>Eliminación:</strong> Solicitar la eliminación de datos</li>
                  </ul>
                  <ul className="space-y-2">
                    <li>• <strong>Portabilidad:</strong> Transferir datos a otro servicio</li>
                    <li>• <strong>Objeción:</strong> Oponerte al procesamiento</li>
                    <li>• <strong>Limitación:</strong> Restringir el uso de datos</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-12 rounded-2xl border border-[#16a245]/30 bg-gradient-to-r from-[#16a245]/10 to-[#0d7a32]/10 p-8 text-center"
            >
              <h2 className="mb-6 text-3xl font-bold text-white">¿Tienes Preguntas sobre Privacidad?</h2>
              <p className="mb-6 text-lg text-gray-300">
                Si tienes preguntas sobre esta política de privacidad o deseas ejercer 
                tus derechos, no dudes en contactarnos.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href="/contacto">
                  <Button
                    size="lg"
                    className="bg-[#16a245] text-white hover:bg-[#0d7a32] transition-all duration-300"
                  >
                    Contactar sobre Privacidad
                  </Button>
                </Link>
                <Link href="/">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[#16a245] text-[#16a245] hover:bg-[#16a245] hover:text-white transition-all duration-300"
                  >
                    Volver al Inicio
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Last Updated */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center text-gray-400"
            >
              <p>
                <strong>Última actualización:</strong> Enero 2025
              </p>
              <p className="mt-2">
                Nos reservamos el derecho de actualizar esta política de privacidad 
                periódicamente para reflejar cambios en nuestras prácticas.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />
      <BackToHomeButton />
    </div>
  );
} 