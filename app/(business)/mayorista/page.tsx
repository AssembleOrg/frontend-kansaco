'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MapPin,
  Users,
  FileText,
  Building2,
  Calculator,
  CheckCircle,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackToHomeButton from '@/components/ui/BackToHomeButton';

export default function MayoristaPage() {
  const requirements = [
    {
      icon: FileText,
      title: 'CUIT Activo',
      description: 'Número de CUIT válido y activo ante AFIP',
    },
    {
      icon: CheckCircle,
      title: 'Constancia AFIP',
      description: 'Documentación que acredite situación fiscal vigente',
    },
    {
      icon: Building2,
      title: 'Domicilio Comercial',
      description: 'Dirección comercial verificable con local o depósito',
    },
    {
      icon: MapPin,
      title: 'Zona de Distribución',
      description: 'Área geográfica definida donde realizarás la distribución',
    },
    {
      icon: Calculator,
      title: 'Capacidad de Compra',
      description: 'Compra mínima por pedido',
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

        <div className="container mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="mb-6 text-5xl font-black text-white md:text-6xl">
              CONVERTITE EN
              <span className="block text-[#16a245]">MAYORISTA KANSACO</span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-300">
              Únete a nuestra red de distribuidores con el respaldo de más de
              medio siglo de experiencia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="bg-gradient-to-b from-gray-950 to-black py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-[#16a245]">
              Requisitos
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-300">
              Lo que necesitas para formar parte de nuestra red de
              distribuidores
            </p>
          </motion.div>

          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 md:grid-cols-2">
              {requirements.map((req, index) => (
                <motion.div
                  key={req.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4 rounded-xl border border-gray-800 bg-gray-900/30 p-6"
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#16a245]/20">
                      <req.icon className="h-6 w-6 text-[#16a245]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-white">
                      {req.title}
                    </h3>
                    <p className="text-gray-400">{req.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-b from-gray-900 to-black py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl rounded-3xl border border-[#16a245]/50 bg-gradient-to-br from-[#16a245]/10 to-gray-900/50 p-12 text-center backdrop-blur-sm"
          >
            <h2 className="mb-6 text-4xl font-bold text-white">
              ¿Listo para unirte a nuestra red?
            </h2>
            <p className="mb-8 text-xl text-gray-300">
              Crea tu cuenta ahora y comienza a disfrutar de los beneficios
              exclusivos para mayoristas KANSACO
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-[#16a245] text-white transition-all duration-300 hover:scale-105 hover:bg-[#0d7a32]"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Crear Cuenta de Mayorista
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contacto">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#16a245] text-[#16a245] transition-all duration-300 hover:bg-[#16a245] hover:text-white"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  ¿Tienes dudas? Contáctanos
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-400">
              Al crear tu cuenta, selecciona &quot;Cliente Mayorista&quot; para
              acceder a precios especiales
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
      <BackToHomeButton />
    </div>
  );
}
