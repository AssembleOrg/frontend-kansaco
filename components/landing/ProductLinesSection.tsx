'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Shield,
  Car,
  Truck,
  Trophy,
  Settings,
  ChevronDown,
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
          'Una línea totalmente renovada y pensada para dar respuesta a la lubricación de los motores modernos que se están fabricando actualmente en el mundo.',
        benefits: [
          'Intervalos de cambio extendidos',
          'Mejor rendimiento en altas temperaturas de operación',
          'Protección mejorada para motores bajo estrés extremo',
          'Máxima ganancia de potencia mediante reducción de fricciones',
          'Funciona en temperaturas de -30°C hasta 40°C',
          'Formulado con polialfaolefina y ésteres de última generación',
        ],
        technical:
          'Formulados con bases lubricantes sintéticas: polialfaolefina, ésteres y paquete de aditivos dispersantes, detergentes antioxidante, antiespuma, anticorrosivo de última generación.',
        applications: 'Diesel ligeros, Nafteros, GNC (Gas Natural Comprimido), GLP (Gas Licuado de Petróleo)',
        certifications: [],
      },
      {
        name: 'LÍNEA PREMIUM',
        subtitle: 'Aceite semi-sintético',
        image: '/linea/linea-premium.webp',
        description:
          'Busca extender el período de reemplazo y la relubricación para mayor eficiencia y economía del motor. Un equilibrio entre la economía del aceite mineral y el rendimiento superior del sintético.',
        benefits: [
          'Extiende período de reemplazo para mayor eficiencia',
          'Mayor economía del motor',
          'Óptima performance del lubricante',
          'Balance costo-beneficio ideal',
          'Protección antidesgaste superior',
        ],
        technical: 'Formulados con bases lubricantes parafínicas altamente refinadas y sintéticas con paquete de aditivos dispersantes, detergentes antioxidante, antiespuma y anticorrosivos de primera calidad.',
        applications: 'Vehículos que requieran aceite semi-sintético',
        certifications: [],
      },
      {
        name: 'LÍNEA MINERAL',
        subtitle: 'Opción económica de alta calidad',
        image: '/linea/linea-mineral.webp',
        description:
          'Especialmente desarrollada para cubrir eficientemente los severos servicios de lubricación en modernos motores que operan bajo condiciones de trabajo muy rigurosas.',
        benefits: [
          'Ideal para vehículos de transporte público',
          'Perfecto para taxis, remises, patrulleros',
          'Resistencia en marchas extendidas y diarias',
          'Nuestra opción más económica',
          'Cumple los más altos estándares de calidad',
        ],
        technical:
          'Formulados con aceites parafínicos refinados de alta calidad con paquete de aditivos dispersantes, detergentes antioxidantes, antiespuma y anticorrosivo adecuados.',
        applications: 'Transporte público, taxis, remises, patrulleros',
        certifications: [],
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
        description: 'Alcanza niveles de calidad superior en protección para pick ups 4×4, ómnibus, camiones, maquinarias agrícolas y vial.',
        benefits: [
          'Óptima lubricación',
          'Economía en el consumo de combustible',
          'Prolonga vida útil del lubricante',
          'Protección contra el desgaste de componentes metálicos',
          'Bajo costo de mantenimiento y óptima productividad',
        ],
        technical: 'Todos los lubricantes para cárter de motores diesel, nafteros y GNC cuentan con la incorporación exclusiva de nuestro Polymers Protection Film.',
        applications: 'Pick ups 4x4, camiones, ómnibus, transporte público, maquinaria agrícola y vial',
        certifications: [],
      },
      {
        name: 'LUBRICANTES INDUSTRIALES',
        subtitle: 'Para maquinaria industrial',
        image: '/linea/Lubricantes-Industriales.png.webp',
        description: 'Una de las líneas más amplias del mercado. Productos para todos los sectores de la industria.',
        benefits: [
          'Sistemas Hidráulicos',
          'Engranajes y Reductores',
          'Sistemas Frigoríficos',
          'Compresores',
          'Industria Metal Mecánica',
          'Transferencia Térmica',
        ],
        technical: 'Líneas mineral, premium y sintético. También: sistemas eléctricos, textil, anticorrosivos, cadenas de hornos, cables de acero, azucarera y ferroviario.',
        applications: 'Toda la industria: manufactura, minería, construcción, energía',
        certifications: [],
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
        description: 'El mantenimiento de los sistemas de transmisión es clave para todo tipo de vehículo. El lubricante debe cumplir con las exigencias del fabricante.',
        benefits: [
          'Cuidado de los componentes',
          'Cambios suaves',
          'Prolongada vida útil de los engranajes',
          'Compatible con normas GM, Ford y Chrysler',
          'Cumple requisitos de Toyota, Honda y Nissan',
          'Protección de componentes críticos de la transmisión',
        ],
        technical: 'Lubricantes para cajas de transmisión manuales y automáticas, y diferenciales cada vez más complejos.',
        applications: 'Cajas manuales, automáticas, diferenciales',
        certifications: [],
      },
      {
        name: 'LUBRICANTES PARA EL AGRO',
        subtitle: 'Maquinaria agrícola y vial',
        image: '/linea/Lina-Agro.png.webp',
        description: 'Una línea pensada y desarrollada para un óptimo rendimiento en las temporadas de siembra y cosecha.',
        benefits: [
          'Prolongan la vida útil de la maquinaria',
          'Ayudan a reducir las emisiones',
          'Bajan los costos de mantenimiento',
          'Aumentan la disponibilidad de los equipos',
          'Mayor productividad',
          'Incluye lubricante para bomba ordeñadora',
        ],
        technical: 'Aceites de motor para tareas pesadas, lubricantes para diferenciales, circuitos hidráulicos de mandos y frenos, y grasas especializadas.',
        applications: 'Tractores, cosechadoras, máquinas agrícolas y viales, bombas ordeñadoras',
        certifications: [],
      },
      {
        name: 'LUBRICANTES PARA COMPETICIÓN',
        subtitle: 'Alto rendimiento deportivo',
        image: '/linea/Linea-Competicion.png.webp',
        description: 'Desarrollados para el TC – Turismo Carretera, la categoría más popular de la Argentina. La competencia en pistas es nuestro laboratorio de excelencia.',
        benefits: [
          'Más de 20 años en lubricantes de competición',
          'Especialistas en química y tribología',
          'Colaboración con preparadores de motores',
          'Productos para alta competencia internacional',
          'Aceites para motor, caja, diferencial y grasas',
        ],
        technical: 'Equipo de químicos, motoristas y termodinámicos elaboran estos productos para la alta competición.',
        applications: 'TC Turismo Carretera, autos de carrera, alta competencia',
        certifications: [],
      },
      {
        name: 'LUBRICANTES PARA MOTOS',
        subtitle: 'Especial motocicletas',
        image: '/linea/Linea-Moto-1.png.webp',
        description: 'La mejor calidad para 4 tiempos y 2 tiempos. Satisface las exigencias de JASO (Japanese Automotive Standards Organization).',
        benefits: [
          'Adecuada para todas las marcas de motocicletas',
          'Modelos deportivos y de competencia',
          'Motocicletas con cajas integradas o no',
          'Embrague bañado en aceite o en seco',
          'Alta protección en condiciones arduas',
          'Resistencia a oxidación y cizallamiento',
        ],
        technical: 'Lubricantes Sintéticos, Premium y Minerales para 4 y 2 tiempos. Sintético para amortiguadores y lubricante para filtros de espuma.',
        applications: 'Motocicletas 4T y 2T, scooters, modelos deportivos',
        certifications: [],
      },
      {
        name: 'LUBRICANTES LÍNEA NÁUTICA',
        subtitle: 'Para aplicaciones marítimas',
        image: '/linea/Linea-Nautica.png.webp',
        description: 'Especialmente desarrollada para motores fuera de borda, reconocida por su extrema calidad y prestación de servicio.',
        benefits: [
          'Extrema calidad',
          'Prestación de servicio superior',
          'Cumple requerimientos N.M.M.A.',
        ],
        technical: 'Cumple con los requerimientos de la National Marine Manufacturers Association (N.M.M.A.).',
        applications: 'Motores fuera de borda, embarcaciones',
        certifications: [],
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
        description: 'Producto sólido o semisólido obtenido por dispersión de un espesante en lubricante líquido. Cuando se requiere que el lubricante permanezca en su posición original.',
        benefits: [
          'Las grasas protegieron los primeros mecanismos de la historia',
          'El lubricante permanece en posición original',
          'Amplia línea para todas las necesidades del mercado',
        ],
        technical: 'Según ASTM: producto sólido o semisólido obtenido por dispersión de un espesante (generalmente un jabón) en lubricante líquido.',
        applications: 'Rodamientos, chassis, equipos industriales',
        certifications: [],
      },
      {
        name: 'DERIVADOS Y ADITIVOS',
        subtitle: 'Productos complementarios especializados',
        image: '/linea/Linea-Derivados-Y-Aditivos.png.webp',
        description: 'Productos que complementan la línea de lubricantes: Kanfren, Glicina C-300, Desengrin, Fluido Kalibre, W-Kan, KOG, QP47, Polímero para Carter, Molibdeno.',
        benefits: [
          'Kanfren: Líquido para frenos DOT-3 y DOT-4',
          'Glicina C-300: Anticongelante orgánico y ecológico',
          'Desengrin: Desengrasante biodegradable',
          'W-Kan: Aerosol Multipropósito',
          'KOG: Lubricante para Armas',
          'QP47: Descarbonizante (no conduce hasta 30,000V)',
        ],
        technical: 'Fluido Kalibre para calibración de bombas inyectoras. Polímero para Carter 100% sintético. Molibdeno aditivo anticorrosivo y antidesgaste. Aditivo Antimicótico.',
        applications: 'Mantenimiento automotriz e industrial integral',
        certifications: [],
      },
    ],
  },
];

const ProductLinesSectionContent = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const searchParams = useSearchParams();
  const lineParam = searchParams.get('line');

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const neonIntensity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.1, 0.6, 0.6, 0.1]
  );

  const getCategoryId = (category: string): string => {
    const idMap: Record<string, string> = {
      'LÍNEAS VEHÍCULOS': 'vehiculos',
      'INDUSTRIA PESADA': 'industria-pesada',
      'ESPECIALIDADES': 'especialidades',
      'COMPLEMENTOS': 'complementos'
    };
    return `category-${idMap[category] || ''}`;
  };

  useEffect(() => {
    if (lineParam) {
      const categoryMap: Record<string, string> = {
        'vehiculos': 'LÍNEAS VEHÍCULOS',
        'industria-pesada': 'INDUSTRIA PESADA',
        'especialidades': 'ESPECIALIDADES',
        'complementos': 'COMPLEMENTOS'
      };
      const category = categoryMap[lineParam];
      if (category) {
        setExpandedCategories(new Set([category]));

        // Auto-scroll a la sección expandida después de un pequeño delay
        setTimeout(() => {
          const element = document.getElementById(`category-${lineParam}`);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }, 300);
      }
    }
  }, [lineParam]);

  return (
    <section
      ref={sectionRef}
      id="product-lines"
      className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-20 overflow-x-hidden"
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
                id={getCategoryId(line.category)}
                className="w-full rounded-2xl border border-gray-700/50 bg-black/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#16a245]/50"
                onClick={() => {
                  setExpandedCategories(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(line.category)) {
                      newSet.delete(line.category);
                    } else {
                      newSet.add(line.category);
                    }
                    return newSet;
                  });
                }}
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
                  </div>
                  <motion.div
                    animate={{
                      rotate: expandedCategories.has(line.category) ? 180 : 0,
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
                  height: expandedCategories.has(line.category) ? 'auto' : 0,
                  opacity: expandedCategories.has(line.category) ? 1 : 0,
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
                      <div className="grid gap-6 lg:gap-8 lg:grid-cols-5">
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
                          <div className="mb-6">
                            <h4 className="mb-2 text-2xl font-bold text-[#16a245] lg:text-3xl">
                              {product.name}
                            </h4>
                            <p className="text-lg italic text-gray-400">
                              {product.subtitle}
                            </p>
                          </div>

                          <p className="mb-6 text-lg text-gray-300 leading-relaxed">
                            {product.description}
                          </p>

                          {/* Benefits */}
                          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                            {product.benefits.map((benefit, benefitIndex) => (
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

                      {/* Technical Details - Always Visible */}
                      <div className="mt-8 border-t border-gray-600/30 pt-8">
                        <div className="grid gap-8 lg:grid-cols-2">
                          <div>
                            <h5 className="mb-4 flex items-center gap-3 text-xl font-semibold text-white">
                              <Thermometer className="h-6 w-6 text-[#16a245]" />
                              Especificaciones Técnicas
                            </h5>
                            <p className="mb-6 text-gray-300 leading-relaxed">
                              {product.technical}
                            </p>
                          </div>

                          <div>
                            {product.applications && (
                              <div>
                                <h6 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-200">
                                  <Zap className="h-5 w-5 text-[#16a245]" />
                                  Aplicaciones
                                </h6>
                                <p className="text-gray-400">{product.applications}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
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

const ProductLinesSection = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ProductLinesSectionContent />
    </Suspense>
  );
};

export default ProductLinesSection;
