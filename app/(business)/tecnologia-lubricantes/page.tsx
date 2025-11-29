'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Atom,
  Zap,
  Shield,
  Settings,
  FlaskConical,
  Cog,
  ArrowRight,
  Beaker,
  Gauge,
  Layers,
  Target,
  TrendingUp,
} from 'lucide-react';
import { NeonBorders } from '@/components/landing/HeroBanner';
import BackToHomeButton from '@/components/ui/BackToHomeButton';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';

function TecnologiaLubricantesContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const section = searchParams.get('section');

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    if (section) {
      setTimeout(() => {
        const element = document.getElementById(`section-${section}`);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 300);
    }
  }, [section]);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div ref={containerRef} className="bg-black">
        {/* Hero Section - Oil Video Background */}
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
              <source src="/landing/kansaco-oil.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
          </div>

          {/* Animated Oil Molecules */}
          <div className="absolute inset-0 overflow-hidden">
            {[
              { left: 12, top: 25, delay: 0, duration: 7.2, moveX: 5 },
              { left: 88, top: 35, delay: 0.8, duration: 8.1, moveX: -8 },
              { left: 22, top: 65, delay: 1.5, duration: 6.8, moveX: 3 },
              { left: 75, top: 18, delay: 2.2, duration: 8.5, moveX: -6 },
              { left: 42, top: 82, delay: 0.4, duration: 7.6, moveX: 7 },
              { left: 95, top: 55, delay: 1.8, duration: 6.9, moveX: -4 },
              { left: 8, top: 45, delay: 1.1, duration: 8.2, moveX: 9 },
              { left: 65, top: 38, delay: 0.3, duration: 7.4, moveX: -7 },
              { left: 38, top: 12, delay: 2.5, duration: 6.7, moveX: 4 },
              { left: 82, top: 78, delay: 0.9, duration: 8.3, moveX: -5 },
              { left: 55, top: 28, delay: 1.7, duration: 7.1, moveX: 6 },
              { left: 18, top: 88, delay: 0.6, duration: 7.8, moveX: -3 },
              { left: 72, top: 52, delay: 2.1, duration: 6.6, moveX: 8 },
              { left: 28, top: 15, delay: 1.3, duration: 8.4, moveX: -9 },
              { left: 48, top: 72, delay: 0.7, duration: 7.3, moveX: 2 },
            ].map((molecule, i) => (
              <motion.div
                key={i}
                className="absolute h-3 w-3 rounded-full bg-gradient-to-br from-[#16a245] to-[#0d7a32]"
                style={{
                  left: `${molecule.left}%`,
                  top: `${molecule.top}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, molecule.moveX, 0],
                  opacity: [0.2, 1, 0.2],
                  scale: [0.5, 1.2, 0.5],
                }}
                transition={{
                  duration: molecule.duration,
                  repeat: Infinity,
                  delay: molecule.delay,
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
              <Atom className="h-5 w-5" />
              <span>TECNOLOGÍA MOLECULAR AVANZADA</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="mb-6 text-4xl font-black leading-none text-white sm:text-5xl md:text-7xl lg:text-8xl"
            >
              EL
              <span className="block text-[#16a245] drop-shadow-[0_0_30px_rgba(22,162,69,0.5)]">
                LUBRICANTE
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="mx-auto mb-8 max-w-4xl text-xl leading-relaxed text-gray-300 md:text-2xl"
            >
              La función principal del lubricante es disminuir el coeficiente de
              rozamiento entre dos piezas metálicas que están en constante
              movimiento
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1 }}
              className="flex flex-col justify-center gap-4 sm:flex-row"
            >
              <Link href="/productos">
                <Button
                  size="lg"
                  className="bg-[#16a245] px-8 py-4 text-lg text-white transition-all duration-300 hover:bg-[#0d7a32] hover:shadow-[0_0_20px_rgba(22,162,69,0.5)]"
                >
                  VER PRODUCTOS
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sobre-nosotros">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#16a245] px-8 py-4 text-lg text-[#16a245] transition-all duration-300 hover:bg-[#16a245] hover:text-white"
                >
                  CONOCER LA EMPRESA
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

        {/* Function Section */}
        <section id="section-funcion-principal" className="relative bg-gradient-to-b from-black to-gray-950 py-24">
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
                  <Cog className="h-5 w-5" />
                  <span>FUNCIÓN PRINCIPAL</span>
                </div>
                <h2 className="mb-6 text-4xl font-black text-white md:text-6xl">
                  PROTECCIÓN
                  <span className="block text-[#16a245]">MOLECULAR</span>
                </h2>
              </motion.div>

              <div className="grid items-center gap-16 lg:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  className="space-y-8"
                >
                  <p className="text-lg leading-relaxed text-gray-300 md:text-xl">
                    La función principal del lubricante es disminuir el
                    coeficiente de rozamiento entre dos piezas metálicas que
                    están en constante movimiento.
                  </p>

                  <div className="rounded-2xl border border-[#16a245]/30 bg-gradient-to-r from-[#16a245]/10 via-[#16a245]/5 to-transparent p-8">
                    <h3 className="mb-4 text-2xl font-bold text-[#16a245]">
                      Motores de Competición
                    </h3>
                    <p className="leading-relaxed text-gray-300">
                      El aceite lubricante cumple las mismas funciones básicas
                      en un motor de calle como en uno de carrera, pero en
                      competición, el motor exige al máximo al aceite
                      lubricante, lo que hace posible verificar y demostrar
                      mejor sus cualidades. Los motores de carrera tienen el
                      mismo origen que los convencionales pero llevados a su
                      máxima exigencia.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Temperatura', value: '150°C+', icon: Gauge },
                      { label: 'Presión', value: '300 Bar', icon: TrendingUp },
                      { label: 'RPM', value: '8000+', icon: Zap },
                      { label: 'Rendimiento', value: 'Premium', icon: Target },
                    ].map((spec, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-gray-800 bg-gray-900/30 p-4"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <spec.icon className="h-4 w-4 text-[#16a245]" />
                          <div className="text-sm font-medium text-[#16a245]">
                            {spec.label}
                          </div>
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
                      src="/landing/carrera-kansaco.png"
                      alt="Motor de competición Kansaco"
                      width={600}
                      height={400}
                      className="h-[400px] w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Performance Indicator */}
                    <div className="absolute left-6 top-6 rounded-lg border border-[#16a245]/30 bg-black/80 p-4 backdrop-blur-sm">
                      <div className="mb-1 text-sm font-medium text-[#16a245]">
                        Rendimiento
                      </div>
                      <div className="font-bold text-white">Competición</div>
                    </div>
                  </div>

                  {/* Animated Border Elements */}
                  <div className="absolute -right-3 -top-3 h-6 w-6 border-r-2 border-t-2 border-[#16a245]"></div>
                  <div className="absolute -bottom-3 -left-3 h-6 w-6 border-b-2 border-l-2 border-[#16a245]"></div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Protection Science Section */}
        <section id="section-proteccion-desgaste" className="relative bg-gradient-to-b from-gray-950 to-black py-24">
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
                  <Shield className="h-5 w-5" />
                  <span>PROTECCIÓN AVANZADA</span>
                </div>
                <h2 className="mb-6 text-4xl font-black text-white md:text-6xl">
                  CONTRA EL
                  <span className="block text-[#16a245]">DESGASTE</span>
                </h2>
              </motion.div>

              <div className="grid items-center gap-16 lg:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  className="relative order-2 lg:order-1"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-gray-800/50">
                    <Image
                      src="/landing/piezas-motor-automovil-aceite-lubricante-reparacion.png"
                      alt="Piezas mecánicas protegidas"
                      width={600}
                      height={400}
                      className="h-[400px] w-full bg-gradient-to-br from-gray-900 to-black object-cover p-4"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>

                  {/* Floating Tech Indicators */}
                  <div className="absolute -left-6 top-8 rounded-lg border border-[#16a245]/30 bg-black/90 p-4 backdrop-blur-sm">
                    <div className="text-sm font-medium text-[#16a245]">
                      Viscosidad
                    </div>
                    <div className="font-bold text-white">Óptima</div>
                  </div>

                  <div className="absolute bottom-8 right-2 rounded-lg border border-[#16a245]/30 bg-black/90 p-4 backdrop-blur-sm md:-right-6 md:right-6">
                    <div className="text-sm font-medium text-[#16a245]">
                      Protección
                    </div>
                    <div className="font-bold text-white">Máxima</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  className="order-1 space-y-8 lg:order-2"
                >
                  <p className="text-lg leading-relaxed text-gray-300 md:text-xl">
                    El aceite protege las piezas contra el desgaste sufrido de
                    acuerdo a las cargas mecánicas, por lo que{' '}
                    <strong className="text-[#16a245]">
                      la primera función del aceite lubricante
                    </strong>
                    consiste en{' '}
                    <strong className="text-[#16a245]">
                      interponerse entre las piezas en movimiento
                    </strong>
                    , para evitar los contactos directos entre los metales.
                  </p>

                  <p className="text-lg leading-relaxed text-gray-300">
                    Cualquier contacto directo de las piezas mecánicas puede
                    generar, en el peor de los casos, una avería o el desgaste
                    acelerado del motor o la maquinaria en cuestión.
                  </p>

                  <div className="rounded-lg border-l-4 border-[#16a245] bg-gradient-to-r from-black to-gray-900 p-6">
                    <p className="font-medium leading-relaxed text-white">
                      Separar las superficies en movimiento relativo significa
                      interponer &quot;algo&quot; entre ellas, con un espesor
                      mínimo que las mantenga a distancia, lo que se logra con
                      <span className="font-bold text-[#16a245]">
                        {' '}
                        EL LUBRICANTE
                      </span>
                      .
                    </p>
                  </div>

                  {/* Tech Cards */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-gray-800/50 bg-gray-900/30 backdrop-blur-sm transition-all duration-300 hover:border-[#16a245]/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-[#16a245]">
                          <Layers className="h-5 w-5" />
                          Viscosidad
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-gray-300">
                          Fundamental para asegurar que el aceite forme una
                          película resistente a temperatura de régimen del motor
                          para reducir el desgaste al mínimo.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-800/50 bg-gray-900/30 backdrop-blur-sm transition-all duration-300 hover:border-[#16a245]/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-[#16a245]">
                          <Zap className="h-5 w-5" />
                          Modificador de Fricción
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-gray-300">
                          Incrementa la resistencia de la película lubricante e
                          impide que se rompa bajo condiciones extremas de
                          funcionamiento.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Polymer's Protection Film Section */}
        <section id="section-polymers-protection" className="relative bg-gradient-to-b from-black to-gray-950 py-24">
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
                  <Beaker className="h-5 w-5" />
                  <span>TECNOLOGÍA EXCLUSIVA</span>
                </div>

                <Badge className="mb-6 bg-gradient-to-r from-[#16a245] to-[#0d7a32] px-8 py-3 text-lg text-white shadow-[0_0_20px_rgba(22,162,69,0.3)]">
                  El orgullo de nuestra empresa
                </Badge>

                <h2 className="mb-6 text-4xl font-black text-white md:text-6xl">
                  POLYMER&apos;S
                  <span className="block text-[#16a245]">PROTECTION FILM</span>
                </h2>
              </motion.div>

              <div className="mb-16 grid items-center gap-16 lg:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <p className="text-lg leading-relaxed text-gray-300 md:text-xl">
                    Todas nuestras formulaciones están desarrolladas con
                    <strong className="text-[#16a245]">
                      {' '}
                      Polymer&apos;s Protection Film
                    </strong>
                    , el orgullo de nuestra empresa. Un aditivo que nos
                    diferencia por su funcionalidad única ya que actúa por
                    absorción física sobre las superficies metálicas.
                  </p>

                  <p className="text-lg leading-relaxed text-gray-300">
                    Es una película micro delgada que actúa desde que se
                    enciende el motor, protegiéndolo en ese momento crítico. Por
                    sus características químicas, permanece aún cuando el motor
                    se detiene hasta el momento del arranque nuevamente, espacio
                    de tiempo de mayor desgaste.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Espesor', value: 'Nano', icon: Atom },
                      { label: 'Adherencia', value: 'Molecular', icon: Layers },
                      { label: 'Duración', value: 'Permanente', icon: Shield },
                      { label: 'Activación', value: 'Inmediata', icon: Zap },
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-gray-800 bg-gray-900/30 p-4"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <feature.icon className="h-4 w-4 text-[#16a245]" />
                          <div className="text-sm font-medium text-[#16a245]">
                            {feature.label}
                          </div>
                        </div>
                        <div className="font-bold text-white">
                          {feature.value}
                        </div>
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
                      src="/landing/Logo-Polymers.png"
                      alt="Polymer's Protection Film"
                      width={600}
                      height={400}
                      className="h-[400px] w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 object-contain p-8"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  </div>

                  {/* Animated Glow Effect */}
                  <div className="absolute inset-0 animate-pulse rounded-2xl border-2 border-[#16a245]/20"></div>
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#16a245]/10 via-transparent to-[#16a245]/10 blur-sm"></div>
                </motion.div>
              </div>

              {/* Benefits Section */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-[#16a245]/30 bg-gradient-to-r from-[#16a245]/10 via-[#16a245]/5 to-transparent p-8"
              >
                <h3 className="mb-8 text-center text-3xl font-bold text-[#16a245]">
                  Beneficios del Polymer&apos;s Protection Film
                </h3>

                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-6">
                    <h4 className="mb-4 text-xl font-bold text-white">
                      Protección Crítica:
                    </h4>
                    <p className="leading-relaxed text-gray-300">
                      Las características de los materiales de los cojinetes son
                      críticas en aquellos momentos donde el contacto metálico
                      es inevitable, debiendo soportar estas condiciones sin
                      deteriorarse hasta que la película de aceite se
                      restablezca.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="mb-4 text-xl font-bold text-white">
                      Resultados Excepcionales:
                    </h4>
                    <div className="space-y-3">
                      {[
                        { text: 'Gran retroceso del desgaste', icon: Shield },
                        {
                          text: 'Baja interesante en el consumo del aceite',
                          icon: TrendingUp,
                        },
                        {
                          text: 'Reducción en el consumo del carburante',
                          icon: Gauge,
                        },
                      ].map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.2 }}
                          viewport={{ once: true }}
                          className="flex items-center gap-3 text-gray-300"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#16a245]/30 bg-[#16a245]/20">
                            <benefit.icon className="h-4 w-4 text-[#16a245]" />
                          </div>
                          {benefit.text}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="section-como-funciona" className="relative bg-gradient-to-b from-gray-950 to-black py-24">
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
                  <Settings className="h-5 w-5" />
                  <span>PROCESO DETALLADO</span>
                </div>
                <h2 className="mb-6 text-4xl font-black text-white md:text-6xl">
                  CÓMO FUNCIONA
                  <span className="block text-[#16a245]">NUESTRO SISTEMA</span>
                </h2>
              </motion.div>

              <div className="space-y-12">
                {[
                  {
                    step: '1',
                    title: 'Momento del Arranque',
                    description:
                      'La película micro delgada actúa desde que se enciende el motor, protegiéndolo en ese momento crítico del arranque, cuando las piezas están más vulnerables al desgaste.',
                    image:
                      '/landing/cerca-gota-aceite-sobre-fondo-amarillo.jpg',
                    side: 'left',
                  },
                  {
                    step: '2',
                    title: 'Durante el Funcionamiento',
                    description:
                      'El Polymer&apos;s Protection Film se adhiere físicamente a las superficies metálicas, creando una barrera protectora que complementa la acción del lubricante tradicional.',
                    image:
                      '/landing/piezas-motor-automovil-aceite-lubricante-reparacion.png',
                    side: 'right',
                  },
                  {
                    step: '3',
                    title: 'Motor Detenido',
                    description:
                      'Por sus características químicas, la película permanece aún cuando el motor se detiene, manteniendo la protección hasta el próximo arranque, que es el momento de mayor desgaste.',
                    image: '/landing/hand-cleaning-engine.jpg.webp',
                    side: 'left',
                  },
                ].map((process, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <Card className="overflow-hidden border-gray-800/50 bg-gray-900/30 backdrop-blur-sm transition-all duration-300 hover:border-[#16a245]/50">
                      <CardContent className="p-0">
                        <div
                          className={`grid items-center gap-6 lg:grid-cols-3 ${process.side === 'right' ? 'lg:grid-flow-dense' : ''}`}
                        >
                          <div
                            className={`relative h-64 overflow-hidden lg:h-80 ${process.side === 'right' ? 'lg:col-start-3' : ''}`}
                          >
                            <Image
                              src={process.image}
                              alt={process.title}
                              width={400}
                              height={300}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            {/* Step Number Overlay */}
                            <div className="absolute left-6 top-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#16a245] to-[#0d7a32] shadow-[0_0_20px_rgba(22,162,69,0.5)]">
                              <span className="text-2xl font-black text-white">
                                {process.step}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`p-8 lg:col-span-2 ${process.side === 'right' ? 'lg:col-start-1' : ''}`}
                          >
                            <h3 className="mb-4 text-2xl font-bold text-white lg:text-3xl">
                              {process.title}
                            </h3>
                            <p className="text-lg leading-relaxed text-gray-300">
                              {process.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Evolution Section */}
        <section id="section-evolucion" className="relative bg-gradient-to-b from-black to-gray-950 py-24">
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
                  <span>INVESTIGACIÓN Y DESARROLLO</span>
                </div>
                <h2 className="mb-6 text-4xl font-black text-white md:text-6xl">
                  CONSTANTE
                  <span className="block text-[#16a245]">EVOLUCIÓN</span>
                </h2>
              </motion.div>

              <div className="grid items-center gap-16 lg:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  className="space-y-8"
                >
                  <p className="text-lg leading-relaxed text-gray-300 md:text-xl">
                    Los fabricantes de motores y maquinarias están desarrollando
                    productos con nuevas tecnologías que requieren de
                    lubricantes cada vez más complejos y que puedan cumplir con
                    las exigencias de lubricación en condiciones cada vez más
                    exigentes.
                  </p>

                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-[#16a245]">
                      Exigencias Actuales:
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        'Mínimo desgaste',
                        'Aceleración',
                        'Economía',
                        'Cuidado del medio ambiente',
                      ].map((exigencia, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          viewport={{ once: true }}
                          className="flex items-center gap-3 text-gray-300"
                        >
                          <div className="h-2 w-2 rounded-full bg-[#16a245]"></div>
                          {exigencia}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#16a245]/30 bg-gradient-to-r from-[#16a245]/10 to-transparent p-6">
                    <p className="leading-relaxed text-gray-300">
                      Nuestro sector de{' '}
                      <strong className="text-[#16a245]">I&D</strong> se
                      encuentra en la búsqueda constante de nuevos productos,
                      fórmulas y optimización de productos existentes para
                      abastecer las necesidades de todos los sectores de la
                      industria.
                    </p>
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
                      src="/landing/grupo-frascos-laboratorio-llenos.jpg"
                      alt="Sector I&D Kansaco"
                      width={600}
                      height={400}
                      className="h-[400px] w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* R&D Indicator */}
                    <div className="absolute bottom-6 left-6 right-6 rounded-lg border border-[#16a245]/30 bg-black/80 p-4 backdrop-blur-sm">
                      <div className="mb-1 text-sm font-medium text-[#16a245]">
                        Investigación & Desarrollo
                      </div>
                      <div className="font-bold text-white">
                        Innovación Continua
                      </div>
                    </div>
                  </div>

                  {/* Corner Elements */}
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
                DESCUBRE EL PODER DEL
                <span className="block text-[#16a245]">
                  POLYMER&apos;S PROTECTION FILM
                </span>
              </h2>
              <p className="mb-8 text-xl text-gray-300">
                Experimenta la diferencia que hace nuestra tecnología exclusiva
                en tus motores y maquinarias
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/productos">
                  <Button
                    size="lg"
                    className="bg-[#16a245] px-8 py-4 text-lg text-white transition-all duration-300 hover:bg-[#0d7a32] hover:shadow-[0_0_20px_rgba(22,162,69,0.5)]"
                  >
                    VER PRODUCTOS
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/sobre-nosotros">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[#16a245] px-8 py-4 text-lg text-[#16a245] transition-all duration-300 hover:bg-[#16a245] hover:text-white"
                  >
                    CONOCER LA EMPRESA
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

export default function TecnologiaLubricantesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <TecnologiaLubricantesContent />
    </Suspense>
  );
}
