'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Flame,
  Droplets,
  Shield,
  Gauge,
  Settings,
  ArrowRight,
  CheckCircle2,
  Factory,
  Pickaxe,
  Building2,
  Tractor,
  Ship,
  Waves,
  Zap,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NeonBorders } from '@/components/landing/HeroBanner';
import BackToHomeButton from '@/components/ui/BackToHomeButton';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const disenosVentajas = [
  {
    icon: Flame,
    title: 'Punto de goteo extremadamente alto',
    desc: 'Típicamente superior a 320°C, lo que le permite operar en ambientes de alta temperatura.',
  },
  {
    icon: Gauge,
    title: 'Resistencia excepcional EP',
    desc: 'En el ensayo a 4 bolas en la resistencia EP de su cuña lubricante.',
  },
  {
    icon: Droplets,
    title: 'Insuperable resistencia al lavado por agua',
    desc: 'Protección contra la corrosión, incluso en ambientes salinos o con alta humedad.',
  },
  {
    icon: Settings,
    title: 'Excelente estabilidad mecánica',
    desc: 'Manteniendo su consistencia y propiedades bajo trabajo continuo y vibraciones.',
  },
  {
    icon: Shield,
    title: 'Propiedades intrínsecas EP y antidesgaste',
    desc: 'Minimizando el deterioro de componentes.',
  },
];

const clasificacion = [
  'Soporta un amplio rango de temperaturas, desde bajas [-3 °C] hasta muy altas temperaturas [>200 °C].',
  'Es altamente resistente al agua fría y caliente, así como al vapor.',
  'Mantiene su consistencia y estructura sin ablandarse con el trabajo continuo, ofreciendo un poder anticorrosivo superior.',
  'Excelente estabilidad estructural y capacidad de bombeo para sistemas centralizados.',
];

const usos = [
  'Altas cargas y presiones.',
  'Temperaturas elevadas y extremas.',
  'Ambientes húmedos o con presencia de agua (lavado por agua, inmersión).',
  'Vibraciones y choques.',
  'Condiciones de suciedad y contaminación.',
];

const premiumPara = [
  'Ambientes húmedos.',
  'Temperaturas elevadas.',
  'Donde se busque prolongar intervalos de lubricación y evitar corrosión.',
];

const industrias = [
  {
    name: 'Minería',
    image: '/kancore/minera.webp',
    icon: Pickaxe,
  },
  {
    name: 'Siderurgia',
    image: '/kancore/siderurgia.webp',
    icon: Factory,
  },
  {
    name: 'Cementeras',
    image: '/kancore/cementera.webp',
    icon: Building2,
  },
  {
    name: 'Papel y Celulosa',
    image: '/kancore/papel-celulosa.webp',
    icon: Factory,
  },
  {
    name: 'Maquinaria Agrícola y Vial',
    image: '/kancore/agricola.webp',
    icon: Tractor,
  },
];

const equiposPetroleros = [
  'Válvulas y bridas en superficie',
  'Rodamientos de bombas de inyección o transferencia',
  'Unidades de perforación (top drive, winches, etc.)',
  'Equipos de mantenimiento, como camiones o grúas',
  'Ambientes offshore (plataformas)',
];

const presentaciones = [
  { formato: '9 kg (Balde)', codigo: '02800015890', estiba: '64 x Pallet' },
  { formato: '18 kg (Balde)', codigo: '01900015890', estiba: '48 x Pallet' },
  { formato: '180 kg (Tambor)', codigo: '01700015890', estiba: '4 x Pallet' },
];

export default function KancorePage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black" />

        {/* Background  */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#16a245]/30 blur-[100px]" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative mb-6 inline-flex items-center gap-3 rounded-lg border border-[#16a245]/30 bg-gray-900/30 px-6 py-3 text-sm font-medium text-[#16a245] backdrop-blur-sm">
                <NeonBorders intensity={0.4} />
                <span>NUEVO PRODUCTO PREMIUM</span>
              </div>

              <h1 className="mb-2 text-4xl font-black leading-none text-white sm:text-5xl md:text-6xl">
                <motion.span
                  className="block text-[#16a245]"
                  animate={{
                    textShadow: [
                      '0 0 20px rgba(22, 162, 69, 0.5)',
                      '0 0 40px rgba(22, 162, 69, 0.8)',
                      '0 0 20px rgba(22, 162, 69, 0.5)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  KANCORE
                </motion.span>
                <span className="mt-2 block text-xl font-bold text-gray-300 sm:text-2xl md:text-3xl">
                  Grasa Sulfonato de Calcio
                </span>
              </h1>

              <p className="mb-4 max-w-xl text-base leading-relaxed text-gray-400 md:text-lg">
                Grasa de alta performance de color marrón dorado elaborada con
                aceites minerales viscosos refinados ISO 460. Formulada con un
                sistema espesante de sulfonato de calcio complejo y aditivos de
                última generación que le confieren excepcionales propiedades
                antioxidantes, anticorrosivas, extrema presión (EP) y
                antidesgaste (AW), así como una sobresaliente resistencia al
                agua y estabilidad térmica.
              </p>

              <p className="mb-6 text-sm font-medium text-[#16a245]">
                Los jabones son de Sulfonato de Calcio Complejo.
              </p>

              {/* Producto */}
              <div className="mb-8 rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                <p className="mb-3 font-semibold text-white">
                  Kancore es nuestro producto premium para:
                </p>
                <ul className="space-y-2">
                  {premiumPara.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-400"
                    >
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#16a245]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/contacto">
                  <Button
                    size="lg"
                    className="bg-[#16a245] px-8 py-4 text-lg font-semibold text-black transition-all duration-300 hover:bg-[#0d7a32] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]"
                  >
                    Solicitar información
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/productos">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[#16a245] px-8 py-4 text-lg text-[#16a245] transition-all duration-300 hover:bg-[#16a245] hover:text-black"
                  >
                    Ver productos
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-2xl border border-gray-800/50">
                <Image
                  src="/kancore/aplicacion.webp"
                  alt="Kancore - Grasa Sulfonato de Calcio"
                  width={600}
                  height={400}
                  className="h-[400px] w-full object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              <div className="absolute -right-3 -top-3 h-6 w-6 border-r-2 border-t-2 border-[#16a245]"></div>
              <div className="absolute -bottom-3 -left-3 h-6 w-6 border-b-2 border-l-2 border-[#16a245]"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Diseños y Ventajas */}
      <section className="relative bg-gradient-to-b from-black to-gray-950 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-black text-white md:text-4xl">
              DISEÑOS Y <span className="text-[#16a245]">VENTAJAS</span>
            </h2>
          </motion.div>

          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {disenosVentajas.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-xl border border-gray-800/50 bg-gray-900/30 p-5 transition-all duration-300 hover:border-[#16a245]/50"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#16a245]/30 bg-[#16a245]/10">
                  <item.icon className="h-5 w-5 text-[#16a245]" />
                </div>
                <h3 className="mb-2 font-bold text-white">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Clasificación */}
      <section className="relative bg-gradient-to-b from-gray-950 to-black py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-3xl font-black text-white md:text-4xl">
                CLASIFICACIÓN
              </h2>
            </motion.div>

            <div className="space-y-4">
              {clasificacion.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 rounded-lg border border-gray-800/50 bg-gray-900/30 p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#16a245]" />
                  <span className="text-gray-300">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Usos Recomendados */}
      <section className="relative bg-gradient-to-b from-black to-gray-950 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-3xl font-black text-white md:text-4xl">
                USOS <span className="text-[#16a245]">RECOMENDADOS</span>
              </h2>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              {usos.map((uso, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 rounded-lg border border-gray-800/50 bg-gray-900/30 p-4"
                >
                  <Target className="h-5 w-5 flex-shrink-0 text-[#16a245]" />
                  <span className="text-sm text-gray-300">{uso}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Aplicaciones */}
      <section className="relative bg-gradient-to-b from-gray-950 to-black py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <h2 className="mb-4 text-3xl font-black text-white md:text-4xl">
              APLICACIONES
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto mb-12 max-w-4xl"
          >
            <div className="rounded-xl border border-gray-800/50 bg-gray-900/30 p-6">
              <p className="mb-4 leading-relaxed text-gray-300">
                Nuestra grasa lubricante está especialmente formulada para el
                mantenimiento y protección de componentes industriales sometidos
                a condiciones exigentes. Su desempeño sobresale en la
                lubricación de{' '}
                <span className="font-medium text-[#16a245]">
                  rodamientos, cojinetes, engranajes abiertos, chasis
                </span>{' '}
                y otros mecanismos expuestos a:
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#16a245]" />
                  <span>
                    <strong className="text-white">
                      Altas cargas y presiones
                    </strong>
                    , garantizando una película lubricante estable.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#16a245]" />
                  <span>
                    <strong className="text-white">
                      Temperaturas elevadas o extremas
                    </strong>
                    , sin pérdida de consistencia ni propiedades.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#16a245]" />
                  <span>
                    <strong className="text-white">
                      Ambientes húmedos o con presencia de agua
                    </strong>
                    , incluso en procesos de lavado o inmersión.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#16a245]" />
                  <span>
                    <strong className="text-white">
                      Vibraciones y choques mecánicos
                    </strong>
                    , ofreciendo máxima adherencia y resistencia al desgaste.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#16a245]" />
                  <span>
                    <strong className="text-white">
                      Entornos con polvo, suciedad o contaminantes
                    </strong>
                    , manteniendo la protección y el rendimiento del equipo.
                  </span>
                </li>
              </ul>
              <p className="mt-4 text-sm text-gray-300">
                Su formulación avanzada asegura una lubricación confiable,
                duradera y eficiente, reduciendo el desgaste y extendiendo la
                vida útil de los componentes.
              </p>
            </div>
          </motion.div>

          {/* Industrias Grid */}
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {industrias.map((industria) => (
              <div
                key={industria.name}
                className="group relative overflow-hidden rounded-xl border border-gray-800/50 bg-gray-900/30 transition-all duration-300 hover:border-[#16a245]/50"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={industria.image}
                    alt={industria.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16a245]/10">
                      <industria.icon className="h-4 w-4 text-[#16a245]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {industria.name}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industria Petrolera */}
      <section className="relative bg-gradient-to-b from-black to-gray-950 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-8 text-center"
            >
              <h2 className="mb-4 text-3xl font-black text-white md:text-4xl">
                ¿POR QUÉ ES ÚTIL KANCORE EN LA{' '}
                <span className="text-[#16a245]">INDUSTRIA DEL PETRÓLEO</span>?
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="rounded-xl border border-gray-800/50 bg-gray-900/30 p-6">
                <div className="mb-3 flex items-center gap-3">
                  <Waves className="h-6 w-6 text-[#16a245]" />
                  <h3 className="text-lg font-bold text-white">
                    Ambientes extremadamente agresivos
                  </h3>
                </div>
                <p className="text-sm text-gray-400">
                  Agua salada, vapor, productos químicos, lodo, polvo,
                  vibraciones → todas condiciones que el sulfonato de calcio
                  tolera mejor que litio o poliurea.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800/50 bg-gray-900/30 p-6">
                <div className="mb-3 flex items-center gap-3">
                  <Shield className="h-6 w-6 text-[#16a245]" />
                  <h3 className="text-lg font-bold text-white">
                    Película de protección superior
                  </h3>
                </div>
                <p className="text-sm text-gray-400">
                  La película de protección del sulfonato de calcio protege
                  incluso metales parcialmente sumergidos o expuestos a la
                  intemperie costera o marina.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800/50 bg-gray-900/30 p-6">
                <div className="mb-3 flex items-center gap-3">
                  <Ship className="h-6 w-6 text-[#16a245]" />
                  <h3 className="text-lg font-bold text-white">
                    Aplicación en equipos críticos
                  </h3>
                </div>
                <p className="mb-4 text-sm text-gray-400">
                  Las grasas EP convencionales pueden fallar por lavado o
                  degradación térmica. El sulfonato complejo tiene estabilidad
                  térmica y mecánica superior, ideal para:
                </p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {equiposPetroleros.map((equipo, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-300"
                    >
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#16a245]" />
                      {equipo}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-[#16a245]/30 bg-[#16a245]/5 p-6">
                <div className="mb-3 flex items-center gap-3">
                  <Target className="h-6 w-6 text-[#16a245]" />
                  <h3 className="text-lg font-bold text-[#16a245]">
                    Reducción de paradas
                  </h3>
                </div>
                <p className="text-sm text-gray-300">
                  En sitios remotos, cada intervención es costosa. Una grasa que
                  dura más entre relubricaciones es una ventaja estratégica.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative bg-gradient-to-b from-gray-950 to-black py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-black text-white md:text-4xl">
              PRESENTACIONES
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl"
          >
            <div className="overflow-hidden rounded-xl border border-gray-800/50 bg-gray-900/30">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#16a245]">
                      Formato
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#16a245]">
                      Código
                    </th>
                    <th className="hidden px-6 py-4 text-left text-sm font-bold text-[#16a245] sm:table-cell">
                      Estiba
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {presentaciones.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-800/50 last:border-0"
                    >
                      <td className="px-6 py-4 font-medium text-white">
                        {item.formato}
                      </td>
                      <td className="px-6 py-4 text-gray-400">{item.codigo}</td>
                      <td className="hidden px-6 py-4 text-gray-400 sm:table-cell">
                        {item.estiba}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-gradient-to-b from-black to-gray-950 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="mb-6 text-3xl font-black text-white md:text-4xl">
              ¿INTERESADO EN <span className="text-[#16a245]">KANCORE</span>?
            </h2>
            <p className="mb-8 text-xl text-gray-400">
              Contactanos para más información sobre este producto premium de
              alto rendimiento
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/contacto">
                <Button
                  size="lg"
                  className="bg-[#16a245] px-8 py-4 text-lg font-semibold text-black transition-all duration-300 hover:bg-[#0d7a32] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]"
                >
                  Contactar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/productos">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#16a245] px-8 py-4 text-lg text-[#16a245] transition-all duration-300 hover:bg-[#16a245] hover:text-black"
                >
                  Ver más productos
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <BackToHomeButton />
      <Footer />
    </div>
  );
}
