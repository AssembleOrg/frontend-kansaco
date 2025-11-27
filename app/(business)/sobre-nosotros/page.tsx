'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  Factory,
  Users,
  Award,
  Settings,
  FlaskConical,
  Zap,
  Shield,
  Target,
  ArrowRight,
  Microscope,
  Building,
  TrendingUp,
} from 'lucide-react';
import { NeonBorders } from '@/components/landing/HeroBanner';
import BackToHomeButton from '@/components/ui/BackToHomeButton';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';

export default function SobreNosotrosPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div ref={containerRef} className="bg-black">
        {/* Hero Section - Video Background */}
        <motion.section
          className="relative flex min-h-screen items-center justify-center overflow-hidden"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          {/* Video Background */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            >
              <source
                src="/landing/presentacion-kansaco.mp4"
                type="video/mp4"
              />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
          </div>

          {/* Floating Molecules */}
          <div className="absolute inset-0 overflow-hidden">
            {[
              { left: 15, top: 20, delay: 0, duration: 4.5 },
              { left: 85, top: 30, delay: 0.5, duration: 5 },
              { left: 25, top: 70, delay: 1, duration: 4.2 },
              { left: 70, top: 15, delay: 1.5, duration: 5.5 },
              { left: 45, top: 85, delay: 0.3, duration: 4.8 },
              { left: 90, top: 60, delay: 1.2, duration: 4.3 },
              { left: 10, top: 50, delay: 0.8, duration: 5.2 },
              { left: 60, top: 40, delay: 0.2, duration: 4.7 },
              { left: 35, top: 10, delay: 1.8, duration: 4.4 },
              { left: 80, top: 80, delay: 0.7, duration: 5.1 },
              { left: 50, top: 25, delay: 1.3, duration: 4.6 },
              { left: 20, top: 90, delay: 0.4, duration: 4.9 },
            ].map((particle, i) => (
              <motion.div
                key={i}
                className="absolute h-2 w-2 rounded-full bg-[#16a245]"
                style={{
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Infinity,
                  delay: particle.delay,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Hero Content */}
          <div className="relative z-10 mx-auto max-w-6xl px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative mb-6 inline-flex items-center gap-3 rounded-lg border border-[#16a245]/30 bg-black/30 px-6 py-3 text-sm font-medium text-[#16a245] backdrop-blur-sm"
            >
              <NeonBorders intensity={0.4} />
              <Factory className="h-5 w-5" />
              <span>PLANTA DE ELABORACIÓN PROPIA</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="mb-6 text-4xl font-black leading-none text-white sm:text-5xl md:text-7xl lg:text-8xl"
            >
              MÁS DE
              <span className="block text-[#16a245] drop-shadow-[0_0_30px_rgba(22,162,69,0.5)]">
                300 PRODUCTOS
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="mx-auto mb-8 max-w-4xl text-xl leading-relaxed text-gray-300 md:text-2xl"
            >
              Más de medio siglo dedicados al desarrollo de tecnologías
              dirigidas a los sistemas de lubricación
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1 }}
              className="flex flex-col justify-center gap-4 sm:flex-row"
            >
              <Link href="/tecnologia-lubricantes">
                <Button
                  size="lg"
                  className="bg-[#16a245] px-8 py-4 text-lg text-white transition-all duration-300 hover:bg-[#0d7a32] hover:shadow-[0_0_20px_rgba(22,162,69,0.5)]"
                >
                  VER NUESTRA TECNOLOGÍA
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/productos">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#16a245] px-8 py-4 text-lg text-[#16a245] transition-all duration-300 hover:bg-[#16a245] hover:text-white"
                >
                  VER PRODUCTOS
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 transform"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="flex h-10 w-6 justify-center rounded-full border-2 border-[#16a245]">
              <div className="mt-2 h-3 w-1 rounded-full bg-[#16a245]"></div>
            </div>
          </motion.div>
        </motion.section>

        {/* Stats Section */}
        <section className="relative bg-gradient-to-b from-black to-gray-950 py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { number: 'Medio siglo', label: 'de Experiencia', icon: Award },
                {
                  number: '300+',
                  label: 'Productos Desarrollados',
                  icon: Target,
                },
                { number: '5 millones', label: 'de Litros Anuales', icon: Factory },
                {
                  number: '700.000',
                  label: 'Toneladas de Grasas',
                  icon: TrendingUp,
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="group text-center"
                >
                  <div className="relative mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-[#16a245]/30 bg-[#16a245]/10 transition-all duration-300 group-hover:bg-[#16a245]/20">
                    <stat.icon className="h-8 w-8 text-[#16a245]" />
                    <div className="absolute inset-0 animate-pulse rounded-full border border-[#16a245]/50"></div>
                  </div>
                  <div className="mb-2 text-3xl font-black text-white md:text-4xl">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Nosotros Section */}
        <section className="relative bg-gradient-to-b from-gray-950 to-black py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="mb-16 text-center"
              >
                <div className="relative mb-6 inline-flex items-center gap-3 rounded-lg border border-[#16a245]/30 bg-gray-900/30 px-6 py-3 text-sm font-medium text-[#16a245] backdrop-blur-sm">
                  <NeonBorders intensity={0.3} />
                  <Users className="h-5 w-5" />
                  <span>NUESTRA HISTORIA</span>
                </div>
                <h2 className="mb-6 text-3xl font-black text-white sm:text-4xl md:text-6xl">
                  NOSOTROS
                </h2>
              </motion.div>

              <div className="grid items-center gap-16 lg:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <p className="text-lg leading-relaxed text-gray-300 md:text-xl">
                    Desde hace más de medio siglo, nos encontramos abocados al
                    desarrollo de tecnologías dirigidas a los sistemas de
                    lubricación. Con gran dedicación, nuestro equipo de
                    desarrollo trabaja en la búsqueda constante de nuevas y
                    diversas formas de lubricar automotores de calle y
                    competición, transporte, maquinarias agrícolas, industria,
                    transporte marítimo y aéreo.
                  </p>
                  <p className="text-lg leading-relaxed text-gray-300 md:text-xl">
                    Día a día, nos capacitamos para atender y satisfacer las
                    demandas de los más variados sectores productivos del país y
                    el Mercosur, cubriendo las necesidades de lubricación de
                    todo tipo de motores, máquinas, mecanismos y sistemas.
                  </p>

                  <div className="mt-8 grid grid-cols-2 gap-4">
                    {[
                      { label: 'Sectores Atendidos', value: 'Mercosur' },
                      { label: 'Especialización', value: 'Lubricación' },
                      { label: 'Investigación', value: 'Constante' },
                      { label: 'Calidad', value: 'Premium' },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-gray-800 bg-gray-900/30 p-4"
                      >
                        <div className="text-sm font-medium text-[#16a245]">
                          {item.label}
                        </div>
                        <div className="font-bold text-white">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-gray-800/50">
                    <Image
                      src="/landing/mano-cientifico-guante.jpg"
                      alt="Equipo científico Kansaco"
                      width={600}
                      height={400}
                      className="h-[400px] w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Floating Info Card */}
                    <div className="absolute bottom-6 left-6 right-6 rounded-lg border border-[#16a245]/30 bg-black/80 p-4 backdrop-blur-sm">
                      <div className="mb-1 text-sm font-medium text-[#16a245]">
                        Equipo de Desarrollo
                      </div>
                      <div className="font-bold text-white">
                        Investigación y Innovación Constante
                      </div>
                    </div>
                  </div>

                  {/* Corner Accents */}
                  <div className="absolute -right-3 -top-3 h-6 w-6 border-r-2 border-t-2 border-[#16a245]"></div>
                  <div className="absolute -bottom-3 -left-3 h-6 w-6 border-b-2 border-l-2 border-[#16a245]"></div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="relative bg-gradient-to-b from-black to-gray-950 py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="mb-16 text-center"
              >
                <div className="relative mb-6 inline-flex items-center gap-3 rounded-lg border border-[#16a245]/30 bg-gray-900/30 px-6 py-3 text-sm font-medium text-[#16a245] backdrop-blur-sm">
                  <NeonBorders intensity={0.3} />
                  <FlaskConical className="h-5 w-5" />
                  <span>INNOVACIÓN CIENTÍFICA</span>
                </div>
                <h2 className="mb-6 text-4xl font-black text-white md:text-6xl">
                  TECNOLOGÍA
                  <span className="block text-[#16a245]">
                    POLYMER&apos;S PROTECTION
                  </span>
                </h2>
              </motion.div>

              <div className="grid items-center gap-16 lg:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-gray-800/50">
                    <Image
                      src="/landing/Logo-Polymers.png"
                      alt="Polymers Protection Film"
                      width={600}
                      height={400}
                      className="h-[400px] w-full bg-gradient-to-br from-gray-900 to-black object-cover p-8"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>

                  {/* Tech Specs Cards */}
                  <div className="absolute left-2 top-8 rounded-lg border border-[#16a245]/30 bg-black/90 p-4 backdrop-blur-sm md:-left-6 md:left-6">
                    <div className="text-sm font-medium text-[#16a245]">
                      Tecnología
                    </div>
                    <div className="font-bold text-white">
                      Polymer&apos;s Film
                    </div>
                  </div>

                  <div className="absolute bottom-8 right-2 rounded-lg border border-[#16a245]/30 bg-black/90 p-4 backdrop-blur-sm md:-right-6 md:right-6">
                    <div className="text-sm font-medium text-[#16a245]">
                      Protección
                    </div>
                    <div className="font-bold text-white">Avanzada</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  className="space-y-8"
                >
                  <p className="text-lg leading-relaxed text-gray-300 md:text-xl">
                    Desarrollamos la fórmula del{' '}
                    <strong className="text-[#16a245]">
                      Polymers Protection Film
                    </strong>{' '}
                    que utilizamos en toda nuestra línea de lubricantes. Esta
                    fórmula exclusiva aporta:
                  </p>

                  <div className="space-y-4">
                    {[
                      {
                        icon: Shield,
                        title: 'Película lubricante óptima',
                        desc: 'Protección superior para todas las superficies',
                      },
                      {
                        icon: Zap,
                        title: 'Máxima protección contra el desgaste',
                        desc: 'Tecnología avanzada de protección molecular',
                      },
                      {
                        icon: Settings,
                        title: 'Ahorro en el consumo de combustible',
                        desc: 'Eficiencia energética comprobada',
                      },
                    ].map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.2 }}
                        viewport={{ once: true }}
                        className="group flex items-start gap-4"
                      >
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-[#16a245]/30 bg-[#16a245]/10 transition-all duration-300 group-hover:bg-[#16a245]/20">
                          <benefit.icon className="h-6 w-6 text-[#16a245]" />
                        </div>
                        <div>
                          <h3 className="mb-1 text-lg font-bold text-white">
                            {benefit.title}
                          </h3>
                          <p className="text-gray-400">{benefit.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-[#16a245]/30 bg-gradient-to-r from-[#16a245]/10 to-transparent p-6">
                    <p className="text-center text-lg font-bold text-[#16a245]">
                      Generando así el máximo nivel de calidad en nuestros
                      productos
                    </p>
                  </div>

                  {/* Normas de Control */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">
                      Normas de Control
                    </h3>
                    <p className="text-gray-400">
                      Cumplimos con las más estrictas normas de control
                      internacionales:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['API', 'NLGI', 'AGMA', 'ISO', 'MIL', 'SAE'].map(
                        (norma) => (
                          <Badge
                            key={norma}
                            variant="outline"
                            className="border-[#16a245] px-4 py-2 text-[#16a245] transition-all duration-300 hover:bg-[#16a245] hover:text-white"
                          >
                            {norma}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Production Section */}
        <section className="relative bg-gradient-to-b from-gray-950 to-black py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="mb-16 text-center"
              >
                <div className="relative mb-6 inline-flex items-center gap-3 rounded-lg border border-[#16a245]/30 bg-gray-900/30 px-6 py-3 text-sm font-medium text-[#16a245] backdrop-blur-sm">
                  <NeonBorders intensity={0.3} />
                  <Building className="h-5 w-5" />
                  <span>CAPACIDAD INDUSTRIAL</span>
                </div>
                <h2 className="mb-6 text-4xl font-black text-white md:text-6xl">
                  ELABORACIÓN
                  <span className="block text-[#16a245]">PROPIA</span>
                </h2>
                <p className="mx-auto max-w-4xl text-xl text-gray-300">
                  Contamos con una planta de elaboración propia de Aceite,
                  Derivados y Grasas que cumplen con los más altos
                  requerimientos de calidad.
                </p>
              </motion.div>

              {/* Unified Production Section */}
              <div className="mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  className="grid items-center gap-8 lg:grid-cols-3"
                >
                  {/* Aceites Section */}
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="order-1"
                  >
                    <Card className="h-full border-gray-800/50 bg-gray-900/30 backdrop-blur-sm transition-all duration-300 hover:border-[#16a245]/50">
                      <CardContent className="p-8 text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#16a245]/30 bg-[#16a245]/10">
                          <Factory className="h-8 w-8 text-[#16a245]" />
                        </div>
                        <h3 className="mb-6 text-2xl font-bold text-white">
                          Elaboración de Aceites
                        </h3>
                        <div className="space-y-4">
                          <div className="rounded-lg bg-gray-800/50 p-4">
                            <div className="text-sm font-medium text-[#16a245]">
                              Superficie
                            </div>
                            <div className="text-xl font-bold text-white">
                              2,500 m²
                            </div>
                            <div className="text-xs text-gray-400">
                              cubiertos
                            </div>
                          </div>
                          <div className="rounded-lg bg-gray-800/50 p-4">
                            <div className="text-sm font-medium text-[#16a245]">
                              Producción
                            </div>
                            <div className="text-xl font-bold text-white">
                              5M litros
                            </div>
                            <div className="text-xs text-gray-400">al año</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Central Image */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="relative order-2"
                  >
                    <div className="group relative overflow-hidden rounded-2xl border border-gray-800/50">
                      <Image
                        src="/landing/business-kansaco.png"
                        alt="Planta industrial Kansaco"
                        width={500}
                        height={400}
                        className="h-[400px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Industrial Indicator */}
                      <div className="absolute bottom-6 left-6 right-6 rounded-lg border border-[#16a245]/30 bg-black/80 p-4 text-center backdrop-blur-sm">
                        <div className="mb-1 text-sm font-medium text-[#16a245]">
                          Planta Industrial
                        </div>
                        <div className="font-bold text-white">
                          Elaboración Propia
                        </div>
                      </div>

                      {/* Corner Accents */}
                      <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-[#16a245]/60"></div>
                      <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-[#16a245]/60"></div>
                      <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-[#16a245]/60"></div>
                      <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-[#16a245]/60"></div>
                    </div>

                    {/* Animated Glow */}
                    <div className="absolute inset-0 animate-pulse rounded-2xl border-2 border-[#16a245]/20"></div>
                  </motion.div>

                  {/* Grasas Section */}
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="order-3"
                  >
                    <Card className="h-full border-gray-800/50 bg-gray-900/30 backdrop-blur-sm transition-all duration-300 hover:border-[#16a245]/50">
                      <CardContent className="p-8 text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#16a245]/30 bg-[#16a245]/10">
                          <Microscope className="h-8 w-8 text-[#16a245]" />
                        </div>
                        <h3 className="mb-6 text-2xl font-bold text-white">
                          Elaboración de Grasas
                        </h3>
                        <div className="space-y-4">
                          <div className="rounded-lg bg-gray-800/50 p-4">
                            <div className="text-sm font-medium text-[#16a245]">
                              Superficie
                            </div>
                            <div className="text-xl font-bold text-white">
                              2,000 m²
                            </div>
                            <div className="text-xs text-gray-400">
                              cubiertos
                            </div>
                          </div>
                          <div className="rounded-lg bg-gray-800/50 p-4">
                            <div className="text-sm font-medium text-[#16a245]">
                              Producción
                            </div>
                            <div className="text-xl font-bold text-white">
                              700K ton
                            </div>
                            <div className="text-xs text-gray-400">al año</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </div>

              {/* Quality Recognition */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-[#16a245]/30 bg-gradient-to-r from-[#16a245]/10 via-[#16a245]/5 to-transparent p-8 text-center"
              >
                <h3 className="mb-4 text-2xl font-bold text-white">
                  Más de <span className="text-[#16a245]">300 productos</span>{' '}
                  desarrollados
                </h3>
                <p className="mb-6 text-gray-300">
                  Nuestra calidad es reconocida por profesionales de toda la
                  industria:
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {[
                    'Usuarios de vehículos de calle',
                    'Talleristas especializados',
                    'Preparadores de autos de competición',
                    'Industria pesada',
                  ].map((reconocimiento, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Badge className="bg-[#16a245] px-4 py-2 text-sm text-white transition-colors duration-300 hover:bg-[#0d7a32]">
                        {reconocimiento}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Analysis Section */}
        <section className="relative bg-gradient-to-b from-black to-gray-950 py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="mb-16 text-center"
              >
                <div className="relative mb-6 inline-flex items-center gap-3 rounded-lg border border-[#16a245]/30 bg-gray-900/30 px-6 py-3 text-sm font-medium text-[#16a245] backdrop-blur-sm">
                  <NeonBorders intensity={0.3} />
                  <Microscope className="h-5 w-5" />
                  <span>LABORATORIO ESPECIALIZADO</span>
                </div>
                <h2 className="mb-6 text-4xl font-black text-white md:text-6xl">
                  ANÁLISIS Y
                  <span className="block text-[#16a245]">ENSAYOS</span>
                </h2>
                <p className="mx-auto max-w-4xl text-xl text-gray-300">
                  Ofrecemos servicios especializados de análisis para el
                  seguimiento completo de lubricantes
                </p>
              </motion.div>

              {/* Analysis Steps */}
              <div className="mb-16 grid gap-6 md:grid-cols-4">
                {[
                  {
                    number: '1',
                    title: 'Nivel de desgaste de los motores',
                    icon: Settings,
                  },
                  { number: '2', title: 'Órganos mecánicos', icon: Factory },
                  { number: '3', title: 'Caja de cambios', icon: Zap },
                  { number: '4', title: 'Sistema hidráulico', icon: Shield },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="group text-center"
                  >
                    <div className="relative mb-6">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#16a245] to-[#0d7a32] text-2xl font-black text-white shadow-[0_0_30px_rgba(22,162,69,0.3)] transition-all duration-300 group-hover:shadow-[0_0_50px_rgba(22,162,69,0.5)]">
                        {item.number}
                      </div>
                      <div className="absolute inset-0 mx-auto h-20 w-20 animate-pulse rounded-full border-2 border-[#16a245]/30"></div>
                    </div>
                    <div className="space-y-2">
                      <item.icon className="mx-auto mb-2 h-6 w-6 text-[#16a245]" />
                      <p className="font-medium text-white">{item.title}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Portable Lab Section */}
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <h3 className="mb-4 text-3xl font-bold text-white">
                    Laboratorio Portátil -{' '}
                    <span className="text-[#16a245]">Pórtala</span>
                  </h3>
                  <p className="text-lg leading-relaxed text-gray-300">
                    Nuestro equipo utiliza el{' '}
                    <strong className="text-[#16a245]">pórtala</strong>, un
                    laboratorio portátil que permite analizar lubricantes in
                    situ y determinar los metales presentes procedentes del
                    desgaste.
                  </p>
                  <p className="text-lg leading-relaxed text-gray-300">
                    Esta práctica ofrece datos certeros para anticiparse a
                    fallas y determinar umbrales de alerta, permitiendo{' '}
                    <strong className="text-[#16a245]">
                      parar motores antes de roturas mecánicas
                    </strong>{' '}
                    y monitorear la evolución del contenido de metales.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Análisis', value: 'In Situ' },
                      { label: 'Precisión', value: '99.9%' },
                      { label: 'Tiempo', value: 'Inmediato' },
                      { label: 'Prevención', value: 'Predictiva' },
                    ].map((spec, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-gray-800 bg-gray-900/30 p-4"
                      >
                        <div className="text-sm font-medium text-[#16a245]">
                          {spec.label}
                        </div>
                        <div className="font-bold text-white">{spec.value}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-gray-800/50">
                    <Image
                      src="/landing/hand-cleaning-engine.jpg.webp"
                      alt="Laboratorio portátil Pórtala"
                      width={600}
                      height={400}
                      className="h-[400px] w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Analysis Results Overlay */}
                    <div className="absolute bottom-6 left-6 right-6 rounded-lg border border-[#16a245]/30 bg-black/80 p-4 backdrop-blur-sm">
                      <div className="mb-1 text-sm font-medium text-[#16a245]">
                        Análisis en Tiempo Real
                      </div>
                      <div className="font-bold text-white">
                        Prevención de Fallas Mecánicas
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute -left-3 -top-3 h-6 w-6 border-l-2 border-t-2 border-[#16a245]"></div>
                  <div className="absolute -bottom-3 -right-3 h-6 w-6 border-b-2 border-r-2 border-[#16a245]"></div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="relative bg-gradient-to-b from-gray-950 to-black py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="mx-auto max-w-4xl text-center"
            >
              <h2 className="mb-6 text-4xl font-black text-white md:text-6xl">
                ¿LISTO PARA EXPERIMENTAR
                <span className="block text-[#16a245]">
                  LA DIFERENCIA KANSACO?
                </span>
              </h2>
              <p className="mb-8 text-xl text-gray-300">
                Descubre cómo nuestro más de medio siglo de experiencia puede
                proteger y optimizar tus motores
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/tecnologia-lubricantes">
                  <Button
                    size="lg"
                    className="bg-[#16a245] px-8 py-4 text-lg text-white transition-all duration-300 hover:bg-[#0d7a32] hover:shadow-[0_0_20px_rgba(22,162,69,0.5)]"
                  >
                    VER NUESTRA TECNOLOGÍA
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/productos">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[#16a245] px-8 py-4 text-lg text-[#16a245] transition-all duration-300 hover:bg-[#16a245] hover:text-white"
                  >
                    VER PRODUCTOS
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Back to Home Button */}
        <BackToHomeButton />
      </div>
      <Footer />
    </div>
  );
}
