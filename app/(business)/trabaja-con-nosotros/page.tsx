'use client';

import { motion } from 'framer-motion';
import { Users, TrendingUp, Heart, Shield } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackToHomeButton from '@/components/ui/BackToHomeButton';
import WorkWithUsForm from '@/components/forms/WorkWithUsForm';

const VALORES = [
  {
    icon: TrendingUp,
    title: 'Crecimiento',
    description: 'Apostamos al desarrollo profesional de cada integrante del equipo.',
  },
  {
    icon: Heart,
    title: 'Compromiso',
    description: 'Valoramos la dedicación y el trabajo en equipo por encima de todo.',
  },
  {
    icon: Shield,
    title: 'Calidad',
    description: 'Más de 30 años de experiencia en la industria lubricante argentina.',
  },
  {
    icon: Users,
    title: 'Equipo',
    description: 'Un ambiente de trabajo colaborativo donde cada voz importa.',
  },
];

export default function TrabajaConNosotrosPage() {
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
              TRABAJÁ CON NOSOTROS
            </h1>
            <p className="mx-auto max-w-4xl text-xl text-gray-300">
              Sumate al equipo de Kansaco y sé parte de una empresa con más de 30
              años liderando la industria lubricante en Argentina.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Valores */}
      <section className="bg-gradient-to-b from-gray-900 to-black py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-white">
              ¿Por qué trabajar en Kansaco?
            </h2>
            <p className="mx-auto max-w-2xl text-gray-400">
              Somos una empresa familiar con valores sólidos, comprometida con el
              crecimiento de nuestros colaboradores.
            </p>
          </motion.div>

          <div className="mx-auto mb-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALORES.map((valor, i) => (
              <motion.div
                key={valor.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 text-center backdrop-blur-sm"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#16a245]/20">
                  <valor.icon className="h-7 w-7 text-[#16a245]" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{valor.title}</h3>
                <p className="text-sm text-gray-400">{valor.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Formulario */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl"
          >
            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
              <h3 className="mb-2 text-center text-2xl font-bold text-white">
                Envianos tu postulación
              </h3>
              <p className="mb-8 text-center text-gray-400">
                Completá el formulario y nos pondremos en contacto con vos a la
                brevedad.
              </p>
              <WorkWithUsForm />
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <BackToHomeButton />
    </div>
  );
}
