'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  Shield,
  Car,
  Truck,
  Trophy,
  Settings,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Thermometer,
  Award,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

// Datos de productos basados en la web actual
const heroProduct = {
  name: 'POLYMER´s PROTECTION FILM',
  tagline: 'El orgullo de nuestra empresa',
  description:
    'Un aditivo especial y exclusivo que nos diferencia por su funcionalidad única',
  features: [
    'Actúa por absorción física sobre superficies metálicas',
    'Película micro delgada que protege desde el encendido',
    'Permanece en el motor aún cuando se detiene',
    'Protege en el momento crítico del arranque',
  ],
  image: '/linea/Polymers-Protection-Film.png.webp',
  icon: Shield,
};

const productLines = [
  {
    category: 'LÍNEAS VEHÍCULOS',
    icon: Car,
    gradient: 'from-[#16a245] to-[#0d7a32]',
    description: 'Tecnología avanzada para vehículos modernos y clásicos',
    products: [
      {
        name: 'LÍNEA SINTÉTICA',
        subtitle: 'Synthetic Evolution Oil',
        image: '/linea/Linea_Sintetica-removebg-preview.png.webp',
        description:
          'Línea totalmente renovada para motores modernos de alto rendimiento. Formulada con bases sintéticas de última generación para máxima protección.',
        benefits: [
          'Intervalos de cambio extendidos hasta 15,000 km',
          'Mejor rendimiento en temperaturas extremas (-40°C a +150°C)',
          'Protección mejorada bajo estrés extremo',
          'Máxima ganancia de potencia y eficiencia',
          'Reducción de emisiones contaminantes',
          'Excelente fluidez en arranques en frío',
        ],
        technical:
          'Formulados con polialfaolefina (PAO), ésteres sintéticos y aditivos de última generación. Viscosidades: 0W-20, 5W-30, 5W-40, 10W-40.',
        applications: 'Autos de alta gama, deportivos, motores turbo, GDI, híbridos',
        certifications: ['API SN Plus', 'ACEA C3', 'BMW LL-04', 'MB 229.51'],
      },
      {
        name: 'LÍNEA PREMIUM',
        subtitle: 'Semi-sintético de alta performance',
        image: '/linea/linea-premium.webp',
        description:
          'Equilibrio perfecto entre economía y rendimiento superior. Tecnología semi-sintética que combina lo mejor de ambos mundos.',
        benefits: [
          'Extiende período de reemplazo hasta 10,000 km',
          'Mayor eficiencia y economía de combustible',
          'Óptima performance en condiciones severas',
          'Balance costo-beneficio ideal',
          'Protección antidesgaste superior',
          'Limpieza interna del motor',
        ],
        technical: 'Bases parafínicas altamente refinadas con sintéticas. Tecnología de dispersantes avanzados.',
        applications: 'Vehículos familiares, flotas comerciales, taxis, remises',
        certifications: ['API SN', 'ACEA A3/B4', 'VW 502.00/505.00'],
      },
      {
        name: 'LÍNEA MINERAL',
        subtitle: 'Opción económica de alta calidad',
        image: '/linea/linea-mineral.webp',
        description:
          'Desarrollada específicamente para servicios severos en condiciones rigurosas. Calidad premium a precio accesible.',
        benefits: [
          'Ideal para transporte público y comercial',
          'Perfecto para taxis, remises, patrulleros',
          'Resistencia en marchas extendidas diarias',
          'Altos estándares de calidad garantizados',
          'Protección confiable y duradera',
          'Formulación probada por décadas',
        ],
        technical:
          'Aceites parafínicos altamente refinados con paquete de aditivos premium. Tecnología antioxidante mejorada.',
        applications: 'Vehículos de alto kilometraje, uso intensivo, flotillas',
        certifications: ['API SL/CF', 'ACEA A3/B3'],
      },
    ],
  },
  {
    category: 'INDUSTRIA PESADA',
    icon: Truck,
    gradient: 'from-[#0d7a32] to-[#16a245]',
    description: 'Soluciones robustas para maquinaria pesada y industrial',
    products: [
      {
        name: 'DIESEL HEAVY LINE',
        subtitle: 'Para pick ups 4x4, ómnibus, camiones',
        image: '/linea/Linea_Diesel_Heavy_Line.png',
        description: 'Niveles superiores de protección para maquinaria pesada que opera en condiciones extremas 24/7.',
        benefits: [
          'Óptima lubricación en condiciones extremas',
          'Economía en consumo de combustible hasta 5%',
          'Prolonga vida útil del lubricante 50% más',
          'Bajo costo de mantenimiento',
          'Resistencia a la formación de hollín',
          'Control superior de la viscosidad',
        ],
        technical: 'Formulación especial para motores diesel de alta exigencia. Aditivos antiespumantes y dispersantes.',
        applications: 'Camiones, ómnibus, maquinaria vial, generadores',
        certifications: ['API CJ-4', 'ACEA E9', 'Caterpillar ECF-3', 'Cummins CES 20081'],
      },
      {
        name: 'LUBRICANTES INDUSTRIALES',
        subtitle: 'Para maquinaria industrial',
        image: '/linea/Lubricantes-Industriales.png.webp',
        description: 'Soluciones especializadas para aplicaciones industriales de alto rendimiento y durabilidad extrema.',
        benefits: [
          'Protección antidesgaste excepcional',
          'Resistencia a cargas extremas',
          'Estabilidad térmica superior',
          'Vida útil extendida',
          'Compatibilidad con sellos',
          'Protección anticorrosiva',
        ],
        technical: 'Aceites hidráulicos, de engranajes, compresores y turbinas. ISO VG 32-680.',
        applications: 'Industria manufacturera, minería, construcción, energía',
        certifications: ['ISO 6743', 'DIN 51517', 'AGMA 9005-E02'],
      },
    ],
  },
  {
    category: 'ESPECIALIDADES',
    icon: Trophy,
    gradient: 'from-[#16a245] to-[#0d7a32]',
    description: 'Productos especializados para aplicaciones específicas',
    products: [
      {
        name: 'LÍNEA CAJA Y DIFERENCIAL',
        subtitle: 'Transmisiones y diferenciales',
        image: '/linea/LINEA-CAJA-Y-DIFERENCIAL.png',
        description: 'Lubricantes especializados para cajas de cambio y diferenciales con tecnología EP extrema presión.',
        benefits: [
          'Protección EP (extrema presión)',
          'Suavidad en cambios',
          'Resistencia al desgaste',
          'Estabilidad térmica',
          'Compatible con sincronizadores',
          'Protección de engranajes',
        ],
        technical: 'Aceites SAE 75W-90, 80W-90, 85W-140 con aditivos EP y modificadores de fricción.',
        applications: 'Cajas manuales, automáticas, diferenciales, transferencias',
        certifications: ['API GL-4/GL-5', 'SAE J306', 'ZF TE-ML'],
      },
      {
        name: 'LUBRICANTES PARA EL AGRO',
        subtitle: 'Maquinaria agrícola y vial',
        image: '/linea/Lina-Agro.png.webp',
        description: 'Lubricación especializada para el sector agropecuario con resistencia a contaminación.',
        benefits: [
          'Resistencia a condiciones extremas',
          'Protección contra desgaste y corrosión',
          'Óptimo rendimiento en campo',
          'Intervalos extendidos',
          'Resistencia a contaminación',
          'Protección en almacenamiento',
        ],
        technical: 'Formulación específica para maquinaria agrícola con aditivos antioxidantes.',
        applications: 'Tractores, cosechadoras, implementos agrícolas',
        certifications: ['API CK-4', 'ACEA E9', 'John Deere JDM J20C'],
      },
      {
        name: 'LUBRICANTES PARA COMPETICIÓN',
        subtitle: 'Alto rendimiento deportivo',
        image: '/linea/Linea-Competicion.png.webp',
        description: 'Para motores de competición y alto rendimiento donde cada segundo cuenta.',
        benefits: [
          'Máxima protección a altas RPM',
          'Rendimiento extremo sostenido',
          'Resistencia térmica superior',
          'Mínima fricción interna',
          'Protección antidesgaste',
          'Respuesta inmediata',
        ],
        technical: 'Bases sintéticas 100% con ésteres. Viscosidades racing específicas.',
        applications: 'Motores de carrera, track days, alto rendimiento',
        certifications: ['FIA homologated', 'SAE J300'],
      },
      {
        name: 'LUBRICANTES PARA MOTOS',
        subtitle: 'Especial motocicletas',
        image: '/linea/Linea-Moto-1.png.webp',
        description: 'Formulación específica para motores de moto que integran motor, caja y embrague.',
        benefits: [
          'Protección de embrague húmedo',
          'Resistencia al corte por engranajes',
          'Estabilidad térmica superior',
          'Protección antidesgaste',
          'Suavidad en cambios',
          'Protección anticorrosiva',
        ],
        technical: 'Compatible con embragues húmedos. Especificación JASO MA2.',
        applications: 'Motocicletas, scooters, ATVs, motos de agua',
        certifications: ['JASO MA2', 'API SL', 'ACEA A3'],
      },
      {
        name: 'LUBRICANTES LÍNEA NÁUTICA',
        subtitle: 'Para aplicaciones marítimas',
        image: '/linea/Linea-Nautica.png.webp',
        description: 'Resistencia superior a ambiente marino, humedad y corrosión salina.',
        benefits: [
          'Anticorrosivo marino superior',
          'Resistencia al agua salada',
          'Protección extrema contra humedad',
          'Estabilidad en condiciones marinas',
          'Protección de metales',
          'Resistencia a emulsificación',
        ],
        technical: 'Formulación resistente a ambiente marino con inhibidores de corrosión.',
        applications: 'Motores marinos, embarcaciones, equipos portuarios',
        certifications: ['NMMA FC-W', 'API CF', 'ACEA A3/B4'],
      },
    ],
  },
  {
    category: 'COMPLEMENTOS',
    icon: Settings,
    gradient: 'from-[#0d7a32] to-[#16a245]',
    description: 'Productos complementarios para mantenimiento integral',
    products: [
      {
        name: 'GRASAS LUBRICANTES',
        subtitle: 'Lubricación sólida de alta duración',
        image: '/linea/Linea-Grasas.png.webp',
        description: 'Grasas de alta calidad para múltiples aplicaciones industriales y automotrices.',
        benefits: [
          'Larga duración en servicio',
          'Resistencia al agua y humedad',
          'Múltiples viscosidades disponibles',
          'Estabilidad mecánica',
          'Protección anticorrosiva',
          'Amplio rango de temperatura',
        ],
        technical: 'Bases de jabón de litio complejo y sintéticas. Grados NLGI 0, 1, 2, 3.',
        applications: 'Rodamientos, chassis, equipos industriales',
        certifications: ['DIN 51825', 'ISO 6743-9'],
      },
      {
        name: 'DERIVADOS Y ADITIVOS',
        subtitle: 'Productos complementarios especializados',
        image: '/linea/Linea-Derivados-Y-Aditivos.png.webp',
        description: 'Línea completa de productos especializados: Kanfren, Glicina C-300, Desengrin, W-Kan, KOG, QP47.',
        benefits: [
          'Líquido de frenos DOT 3/4',
          'Anticongelantes concentrados',
          'Desengrasantes biodegradables',
          'Aditivos especiales multifunción',
          'Productos de limpieza',
          'Tratamientos especializados',
        ],
        technical: 'Productos especializados complementarios formulados según normas internacionales.',
        applications: 'Mantenimiento automotriz e industrial integral',
        certifications: ['DOT 3/4', 'ASTM D3306', 'ISO 4925'],
      },
    ],
  },
];

const ProductLinesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const neonIntensity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.1, 0.6, 0.6, 0.1]
  );

  return (
    <section
      ref={sectionRef}
      id="product-lines"
      className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-20"
    >
      {/* Background Effects */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ opacity: neonIntensity }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#16a245]/10 via-transparent to-transparent"></div>
      </motion.div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Product - POLYMER´s PROTECTION FILM */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="relative rounded-3xl border border-[#16a245]/30 bg-gradient-to-r from-[#16a245]/20 to-[#0d7a32]/20 p-8 backdrop-blur-sm md:p-12">
            {/* Neon border effect */}
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 border-[#16a245]/50"
              animate={{
                boxShadow: [
                  '0 0 20px #16a24550',
                  '0 0 40px #16a24580',
                  '0 0 20px #16a24550',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <div className="relative z-10 grid items-center gap-12 lg:grid-cols-2">
              <div>
                <motion.div
                  className="mb-6 flex items-center gap-4"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#16a245] to-[#0d7a32] p-4">
                    <heroProduct.icon className="h-full w-full text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#16a245]">
                      {heroProduct.name}
                    </h3>
                    <p className="italic text-gray-400">
                      {heroProduct.tagline}
                    </p>
                  </div>
                </motion.div>

                <motion.p
                  className="mb-6 text-xl text-gray-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {heroProduct.description}
                </motion.p>

                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  {heroProduct.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                    >
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#16a245]" />
                      <span className="text-gray-300">{feature}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="relative">
                  <Image
                    src={heroProduct.image}
                    alt={heroProduct.name}
                    width={600}
                    height={400}
                    className="h-80 w-full object-contain drop-shadow-2xl lg:h-96"
                  />
                  {/* Glow effect behind image */}
                  <div className="absolute inset-0 -z-10 blur-3xl">
                    <div className="h-full w-full bg-gradient-to-r from-[#16a245]/30 to-[#0d7a32]/30 rounded-full"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-6 text-5xl font-black md:text-6xl">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              LÍNEAS DE
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#16a245] via-[#0d7a32] to-[#16a245] bg-clip-text text-transparent">
              PRODUCTOS
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-400">
            Más de medio siglo desarrollando tecnologías de lubricación para cada necesidad
          </p>
        </motion.div>

        {/* Product Lines */}
        <div className="space-y-8">
          {productLines.map((line, lineIndex) => (
            <motion.div
              key={line.category}
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: lineIndex * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Category Header */}
              <motion.button
                className="w-full rounded-2xl border border-gray-700/50 bg-black/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#16a245]/50"
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === line.category ? null : line.category
                  )
                }
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-full bg-gradient-to-r ${line.gradient} p-3`}
                    >
                      <line.icon className="h-full w-full text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-white">
                        {line.category}
                      </h3>
                      <p className="text-sm text-gray-400">{line.description}</p>
                    </div>
                    <span className="rounded-full bg-[#16a245]/20 px-3 py-1 text-sm text-[#16a245]">
                      {line.products.length} productos
                    </span>
                  </div>
                  <motion.div
                    animate={{
                      rotate: expandedCategory === line.category ? 180 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-6 w-6 text-gray-400" />
                  </motion.div>
                </div>
              </motion.button>

              {/* Expanded Products */}
              <motion.div
                initial={false}
                animate={{
                  height: expandedCategory === line.category ? 'auto' : 0,
                  opacity: expandedCategory === line.category ? 1 : 0,
                }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="space-y-8 pt-6">
                  {line.products.map((product, productIndex) => (
                    <motion.div
                      key={product.name}
                      className="ml-4 rounded-xl border border-gray-600/30 bg-gray-900/50 p-8"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: productIndex * 0.1 }}
                    >
                      <div className="grid gap-8 lg:grid-cols-5">
                        {/* Product Image - Más grande y sin recuadro */}
                        <div className="lg:col-span-2">
                          <div className="relative">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={400}
                              height={320}
                              className="h-64 w-full object-contain drop-shadow-2xl lg:h-80"
                            />
                            {/* Glow effect behind image */}
                            <div className="absolute inset-0 -z-10 blur-2xl">
                              <div className="h-full w-full bg-gradient-to-r from-[#16a245]/20 to-[#0d7a32]/20 rounded-full"></div>
                            </div>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="lg:col-span-3">
                          <button
                            className="w-full text-left"
                            onClick={() =>
                              setExpandedProduct(
                                expandedProduct === product.name
                                  ? null
                                  : product.name
                              )
                            }
                          >
                            <div className="mb-6 flex items-center justify-between">
                              <div>
                                <h4 className="mb-2 text-2xl font-bold text-[#16a245] lg:text-3xl">
                                  {product.name}
                                </h4>
                                <p className="text-lg italic text-gray-400">
                                  {product.subtitle}
                                </p>
                              </div>
                              <ChevronRight
                                className={`h-6 w-6 text-gray-400 transition-transform ${
                                  expandedProduct === product.name
                                    ? 'rotate-90'
                                    : ''
                                }`}
                              />
                            </div>
                          </button>

                          <p className="mb-6 text-lg text-gray-300 leading-relaxed">
                            {product.description}
                          </p>

                          {/* Benefits Preview */}
                          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                            {product.benefits
                              .slice(0, 4)
                              .map((benefit, benefitIndex) => (
                                <div
                                  key={benefitIndex}
                                  className="flex items-center gap-3"
                                >
                                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-[#16a245]" />
                                  <span className="text-gray-400">
                                    {benefit}
                                  </span>
                                </div>
                              ))}
                          </div>

                          {/* Quick Info Icons */}
                          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                            {product.applications && (
                              <div className="flex items-center gap-2">
                                <Settings className="h-4 w-4 text-[#16a245]" />
                                <span>{product.applications}</span>
                              </div>
                            )}
                            {product.certifications && (
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-[#16a245]" />
                                <span>{product.certifications.length} certificaciones</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Technical Details */}
                      {expandedProduct === product.name && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-8 border-t border-gray-600/30 pt-8"
                        >
                          <div className="grid gap-8 lg:grid-cols-2">
                            <div>
                              <h5 className="mb-4 flex items-center gap-3 text-xl font-semibold text-white">
                                <Thermometer className="h-6 w-6 text-[#16a245]" />
                                Especificaciones Técnicas
                              </h5>
                              <p className="mb-6 text-gray-300 leading-relaxed">
                                {product.technical}
                              </p>

                              {product.applications && (
                                <div className="mb-6">
                                  <h6 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-200">
                                    <Zap className="h-5 w-5 text-[#16a245]" />
                                    Aplicaciones
                                  </h6>
                                  <p className="text-gray-400">{product.applications}</p>
                                </div>
                              )}
                            </div>

                            <div>
                              {product.certifications && (
                                <div className="mb-6">
                                  <h6 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-200">
                                    <Award className="h-5 w-5 text-[#16a245]" />
                                    Certificaciones
                                  </h6>
                                  <div className="flex flex-wrap gap-2">
                                    {product.certifications.map((cert, index) => (
                                      <span
                                        key={index}
                                        className="rounded-full bg-[#16a245]/20 px-3 py-2 text-sm text-[#16a245]"
                                      >
                                        {cert}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* All Benefits */}
                              <div>
                                <h6 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-200">
                                  <CheckCircle className="h-5 w-5 text-[#16a245]" />
                                  Beneficios Completos
                                </h6>
                                <div className="grid gap-3">
                                  {product.benefits.map((benefit, benefitIndex) => (
                                    <div
                                      key={benefitIndex}
                                      className="flex items-center gap-3"
                                    >
                                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-[#16a245]" />
                                      <span className="text-gray-400">
                                        {benefit}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="mb-6 text-3xl font-bold text-white">
            ¿Necesitas asesoramiento especializado?
          </h3>
          <p className="mb-8 text-xl text-gray-400">
            Nuestros expertos te ayudan a elegir el lubricante perfecto para tu aplicación
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/productos">
              <Button
                size="lg"
                className="bg-[#16a245] text-white hover:bg-[#0d7a32] transition-all duration-300"
              >
                VER CATÁLOGO COMPLETO
              </Button>
            </Link>
            <Link href="/contacto">
              <Button
                size="lg"
                variant="outline"
                className="border-[#16a245] text-[#16a245] hover:bg-[#16a245] hover:text-white transition-all duration-300"
              >
                CONTACTAR EXPERTO
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductLinesSection;
