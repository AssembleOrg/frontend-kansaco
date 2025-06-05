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
  Star,
  CheckCircle,
} from 'lucide-react';

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
  icon: Shield,
};

const productLines = [
  {
    category: 'LÍNEAS VEHÍCULOS',
    icon: Car,
    gradient: 'from-[#16a245] to-[#0d7a32]',
    products: [
      {
        name: 'LÍNEA SINTÉTICA',
        subtitle: 'Synthetic Evolution Oil',
        description:
          'Línea totalmente renovada para motores modernos de alto rendimiento',
        benefits: [
          'Intervalos de cambio extendidos',
          'Mejor rendimiento en altas temperaturas',
          'Protección mejorada bajo estrés extremo',
          'Máxima ganancia de potencia',
        ],
        technical:
          'Formulados con polialfaolefina, ésteres y aditivos de última generación',
      },
      {
        name: 'LÍNEA PREMIUM',
        subtitle: 'Semi-sintético de alta performance',
        description:
          'Equilibrio perfecto entre economía y rendimiento superior',
        benefits: [
          'Extiende período de reemplazo',
          'Mayor eficiencia y economía',
          'Óptima performance',
          'Balance costo-beneficio ideal',
        ],
        technical: 'Bases parafínicas altamente refinadas con sintéticas',
      },
      {
        name: 'LÍNEA MINERAL',
        subtitle: 'Opción económica de alta calidad',
        description:
          'Desarrollada para servicios severos en condiciones rigurosas',
        benefits: [
          'Ideal para transporte público',
          'Taxis, remises, patrulleros',
          'Marchas extendidas diarias',
          'Altos estándares de calidad',
        ],
        technical:
          'Aceites parafínicos refinados con paquete de aditivos premium',
      },
    ],
  },
  {
    category: 'INDUSTRIA PESADA',
    icon: Truck,
    gradient: 'from-[#0d7a32] to-[#16a245]',
    products: [
      {
        name: 'DIESEL HEAVY LINE',
        subtitle: 'Para pick ups 4x4, ómnibus, camiones',
        description: 'Niveles superiores de protección para maquinaria pesada',
        benefits: [
          'Óptima lubricación en condiciones extremas',
          'Economía en consumo de combustible',
          'Prolonga vida útil del lubricante',
          'Bajo costo de mantenimiento',
        ],
        technical: 'Formulación especial para motores diesel de alta exigencia',
      },
    ],
  },
  {
    category: 'ESPECIALIDADES',
    icon: Trophy,
    gradient: 'from-[#16a245] to-[#0d7a32]',
    products: [
      {
        name: 'LUBRICANTES PARA EL AGRO',
        subtitle: 'Maquinaria agrícola y vial',
        description: 'Lubricación especializada para el sector agropecuario',
        benefits: [
          'Resistencia a condiciones extremas',
          'Protección contra desgaste',
          'Óptimo rendimiento',
        ],
        technical: 'Formulación específica para maquinaria agrícola',
      },
      {
        name: 'LUBRICANTES PARA COMPETICIÓN',
        subtitle: 'Alto rendimiento deportivo',
        description: 'Para motores de competición y alto rendimiento',
        benefits: [
          'Máxima protección',
          'Rendimiento extremo',
          'Resistencia térmica',
        ],
        technical: 'Bases sintéticas de competición',
      },
      {
        name: 'LUBRICANTES PARA MOTOS',
        subtitle: 'Especial motocicletas',
        description: 'Formulación específica para motores de moto',
        benefits: [
          'Protección de embrague',
          'Resistencia al corte',
          'Estabilidad térmica',
        ],
        technical: 'Compatible con embragues húmedos',
      },
      {
        name: 'LUBRICANTES LÍNEA NÁUTICA',
        subtitle: 'Para aplicaciones marítimas',
        description: 'Resistencia a ambiente marino y humedad',
        benefits: [
          'Anticorrosivo marino',
          'Resistencia al agua salada',
          'Protección extrema',
        ],
        technical: 'Formulación resistente a ambiente marino',
      },
    ],
  },
  {
    category: 'COMPLEMENTOS',
    icon: Settings,
    gradient: 'from-[#0d7a32] to-[#16a245]',
    products: [
      {
        name: 'GRASAS LUBRICANTES',
        subtitle: 'Lubricación sólida',
        description: 'Grasas de alta calidad para múltiples aplicaciones',
        benefits: [
          'Larga duración',
          'Resistencia al agua',
          'Múltiples viscosidades',
        ],
        technical: 'Bases de jabón de litio y sintéticas',
      },
      {
        name: 'DERIVADOS Y ADITIVOS',
        subtitle: 'Productos complementarios',
        description: 'Kanfren, Glicina C-300, Desengrin, W-Kan, KOG, QP47',
        benefits: [
          'Líquido de frenos',
          'Anticongelantes',
          'Desengrasantes',
          'Aditivos especiales',
        ],
        technical: 'Productos especializados complementarios',
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

            <div className="relative z-10 grid items-center gap-8 md:grid-cols-2">
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
                <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-[#16a245]/30 bg-gradient-to-br from-[#16a245]/20 to-[#0d7a32]/20">
                  <Star className="h-24 w-24 text-[#16a245]" />
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
            Más de medio siglo desarrollando tecnologías de lubricación para
            cada necesidad
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
                    <h3 className="text-2xl font-bold text-white">
                      {line.category}
                    </h3>
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
                <div className="space-y-4 pt-4">
                  {line.products.map((product, productIndex) => (
                    <motion.div
                      key={product.name}
                      className="ml-4 rounded-xl border border-gray-600/30 bg-gray-900/50 p-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: productIndex * 0.1 }}
                    >
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
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <h4 className="mb-1 text-xl font-bold text-[#16a245]">
                              {product.name}
                            </h4>
                            <p className="italic text-gray-400">
                              {product.subtitle}
                            </p>
                          </div>
                          <ChevronRight
                            className={`h-5 w-5 text-gray-400 transition-transform ${
                              expandedProduct === product.name
                                ? 'rotate-90'
                                : ''
                            }`}
                          />
                        </div>
                      </button>

                      <p className="mb-4 text-gray-300">
                        {product.description}
                      </p>

                      {/* Benefits Preview */}
                      <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                        {product.benefits
                          .slice(0, 4)
                          .map((benefit, benefitIndex) => (
                            <div
                              key={benefitIndex}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle className="h-4 w-4 flex-shrink-0 text-[#16a245]" />
                              <span className="text-sm text-gray-400">
                                {benefit}
                              </span>
                            </div>
                          ))}
                      </div>

                      {/* Expanded Technical Details */}
                      {expandedProduct === product.name && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 border-t border-gray-600/30 pt-4"
                        >
                          <h5 className="mb-2 text-lg font-semibold text-white">
                            Especificaciones Técnicas
                          </h5>
                          <p className="text-sm text-gray-300">
                            {product.technical}
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductLinesSection;
