'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Factory, Users, Award, Settings, FlaskConical, Zap, Shield, Target, ArrowRight, Microscope, Building, TrendingUp } from 'lucide-react';
import { NeonBorders } from '@/components/landing/HeroBanner';
import Link from 'next/link';

export default function SobreNosotrosPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-black">
      {/* Hero Section - Video Background */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/landing/presentacion-kansaco.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
        </div>

        {/* Floating Molecules */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#16a245] rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative inline-flex items-center gap-3 rounded-lg border border-[#16a245]/30 bg-black/30 backdrop-blur-sm px-6 py-3 text-sm font-medium text-[#16a245] mb-6"
          >
            <NeonBorders intensity={0.4} />
            <Factory className="h-5 w-5" />
            <span>PLANTA DE ELABORACIÓN PROPIA</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-none"
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
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
          >
            Más de medio siglo dedicados al desarrollo de tecnologías dirigidas a los sistemas de lubricación
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/tecnologia-lubricantes">
              <Button
                size="lg"
                className="bg-[#16a245] text-white text-lg px-8 py-4 hover:bg-[#0d7a32] transition-all duration-300 hover:shadow-[0_0_20px_rgba(22,162,69,0.5)]"
              >
                VER NUESTRA TECNOLOGÍA
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/productos">
              <Button
                size="lg"
                variant="outline"
                className="border-[#16a245] text-[#16a245] text-lg px-8 py-4 hover:bg-[#16a245] hover:text-white transition-all duration-300"
              >
                VER PRODUCTOS
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 border-2 border-[#16a245] rounded-full flex justify-center">
            <div className="w-1 h-3 bg-[#16a245] rounded-full mt-2"></div>
          </div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <section className="relative py-20 bg-gradient-to-b from-black to-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "50+", label: "Años de Experiencia", icon: Award },
              { number: "300+", label: "Productos Desarrollados", icon: Target },
              { number: "5M", label: "Litros Anuales", icon: Factory },
              { number: "700K", label: "Toneladas de Grasas", icon: TrendingUp }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#16a245]/10 border border-[#16a245]/30 mb-4 group-hover:bg-[#16a245]/20 transition-all duration-300">
                  <stat.icon className="w-8 h-8 text-[#16a245]" />
                  <div className="absolute inset-0 rounded-full border border-[#16a245]/50 animate-pulse"></div>
                </div>
                <div className="text-3xl md:text-4xl font-black text-white mb-2">{stat.number}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nosotros Section */}
      <section className="relative py-24 bg-gradient-to-b from-gray-950 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="relative inline-flex items-center gap-3 rounded-lg border border-[#16a245]/30 bg-gray-900/30 backdrop-blur-sm px-6 py-3 text-sm font-medium text-[#16a245] mb-6">
                <NeonBorders intensity={0.3} />
                <Users className="h-5 w-5" />
                <span>NUESTRA HISTORIA</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
                NOSOTROS
              </h2>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                  Desde hace más de medio siglo, nos encontramos abocados al desarrollo de tecnologías 
                  dirigidas a los sistemas de lubricación. Con gran dedicación, nuestro equipo de 
                  desarrollo trabaja en la búsqueda constante de nuevas y diversas formas de lubricar 
                  automotores de calle y competición, transporte, maquinarias agrícolas, industria, 
                  transporte marítimo y aéreo.
                </p>
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                  Día a día, nos capacitamos para atender y satisfacer las demandas de los más variados 
                  sectores productivos del país y el Mercosur, cubriendo las necesidades de lubricación 
                  de todo tipo de motores, máquinas, mecanismos y sistemas.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {[
                    { label: "Sectores Atendidos", value: "Mercosur" },
                    { label: "Especialización", value: "Lubricación" },
                    { label: "Investigación", value: "Constante" },
                    { label: "Calidad", value: "Premium" }
                  ].map((item, index) => (
                    <div key={index} className="border border-gray-800 rounded-lg p-4 bg-gray-900/30">
                      <div className="text-[#16a245] text-sm font-medium">{item.label}</div>
                      <div className="text-white font-bold">{item.value}</div>
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
                <div className="relative rounded-2xl overflow-hidden border border-gray-800/50">
                  <Image
                    src="/landing/mano-cientifico-guante.jpg"
                    alt="Equipo científico Kansaco"
                    width={600}
                    height={400}
                    className="w-full h-[400px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Floating Info Card */}
                  <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-sm border border-[#16a245]/30 rounded-lg p-4">
                    <div className="text-[#16a245] text-sm font-medium mb-1">Equipo de Desarrollo</div>
                    <div className="text-white font-bold">Investigación y Innovación Constante</div>
                  </div>
                </div>

                {/* Corner Accents */}
                <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-[#16a245]"></div>
                <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-[#16a245]"></div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="relative py-24 bg-gradient-to-b from-black to-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="relative inline-flex items-center gap-3 rounded-lg border border-[#16a245]/30 bg-gray-900/30 backdrop-blur-sm px-6 py-3 text-sm font-medium text-[#16a245] mb-6">
                <NeonBorders intensity={0.3} />
                <FlaskConical className="h-5 w-5" />
                <span>INNOVACIÓN CIENTÍFICA</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
                TECNOLOGÍA
                <span className="block text-[#16a245]">POLYMER&apos;S PROTECTION</span>
              </h2>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden border border-gray-800/50">
                  <Image
                    src="/landing/Logo-Polymers.png"
                    alt="Polymers Protection Film"
                    width={600}
                    height={400}
                    className="w-full h-[400px] object-cover bg-gradient-to-br from-gray-900 to-black p-8"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Tech Specs Cards */}
                <div className="absolute -left-6 top-8 bg-black/90 backdrop-blur-sm border border-[#16a245]/30 rounded-lg p-4">
                  <div className="text-[#16a245] text-sm font-medium">Tecnología</div>
                  <div className="text-white font-bold">Polymer&apos;s Film</div>
                </div>

                <div className="absolute -right-6 bottom-8 bg-black/90 backdrop-blur-sm border border-[#16a245]/30 rounded-lg p-4">
                  <div className="text-[#16a245] text-sm font-medium">Protección</div>
                  <div className="text-white font-bold">Avanzada</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                  Desarrollamos la fórmula del <strong className="text-[#16a245]">Polymers Protection Film</strong> que utilizamos 
                  en toda nuestra línea de lubricantes. Esta fórmula exclusiva aporta:
                </p>

                <div className="space-y-4">
                  {[
                    { icon: Shield, title: "Película lubricante óptima", desc: "Protección superior para todas las superficies" },
                    { icon: Zap, title: "Máxima protección contra el desgaste", desc: "Tecnología avanzada de protección molecular" },
                    { icon: Settings, title: "Ahorro en el consumo de combustible", desc: "Eficiencia energética comprobada" }
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-4 group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-[#16a245]/10 border border-[#16a245]/30 rounded-lg flex items-center justify-center group-hover:bg-[#16a245]/20 transition-all duration-300">
                        <benefit.icon className="w-6 h-6 text-[#16a245]" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">{benefit.title}</h3>
                        <p className="text-gray-400">{benefit.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-[#16a245]/10 to-transparent border border-[#16a245]/30 rounded-lg p-6">
                  <p className="text-[#16a245] font-bold text-lg text-center">
                    Generando así el máximo nivel de calidad en nuestros productos
                  </p>
                </div>

                {/* Normas de Control */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Normas de Control</h3>
                  <p className="text-gray-400">
                    Cumplimos con las más estrictas normas de control internacionales:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['API', 'NLGI', 'AGMA', 'ISO', 'MIL', 'SAE'].map((norma) => (
                      <Badge key={norma} variant="outline" className="border-[#16a245] text-[#16a245] px-4 py-2 hover:bg-[#16a245] hover:text-white transition-all duration-300">
                        {norma}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Production Section */}
      <section className="relative py-24 bg-gradient-to-b from-gray-950 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="relative inline-flex items-center gap-3 rounded-lg border border-[#16a245]/30 bg-gray-900/30 backdrop-blur-sm px-6 py-3 text-sm font-medium text-[#16a245] mb-6">
                <NeonBorders intensity={0.3} />
                <Building className="h-5 w-5" />
                <span>CAPACIDAD INDUSTRIAL</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
                ELABORACIÓN
                <span className="block text-[#16a245]">PROPIA</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                Contamos con una planta de elaboración propia de Aceite, Derivados y Grasas que cumplen 
                con los más altos requerimientos de calidad.
              </p>
            </motion.div>

            {/* Unified Production Section */}
            <div className="mb-16">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="grid lg:grid-cols-3 gap-8 items-center"
              >
                {/* Aceites Section */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="order-1"
                >
                  <Card className="border-gray-800/50 bg-gray-900/30 backdrop-blur-sm hover:border-[#16a245]/50 transition-all duration-300 h-full">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-[#16a245]/10 border border-[#16a245]/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Factory className="w-8 h-8 text-[#16a245]" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-6">Elaboración de Aceites</h3>
                      <div className="space-y-4">
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <div className="text-[#16a245] text-sm font-medium">Superficie</div>
                          <div className="text-white text-xl font-bold">2,500 m²</div>
                          <div className="text-gray-400 text-xs">cubiertos</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <div className="text-[#16a245] text-sm font-medium">Producción</div>
                          <div className="text-white text-xl font-bold">5M litros</div>
                          <div className="text-gray-400 text-xs">al año</div>
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
                  className="order-2 relative"
                >
                  <div className="relative rounded-2xl overflow-hidden border border-gray-800/50 group">
                    <Image
                      src="/landing/business-kansaco.png"
                      alt="Planta industrial Kansaco"
                      width={500}
                      height={400}
                      className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Industrial Indicator */}
                    <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-sm border border-[#16a245]/30 rounded-lg p-4 text-center">
                      <div className="text-[#16a245] text-sm font-medium mb-1">Planta Industrial</div>
                      <div className="text-white font-bold">Elaboración Propia</div>
                    </div>

                    {/* Corner Accents */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#16a245]/60"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#16a245]/60"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#16a245]/60"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#16a245]/60"></div>
                  </div>

                  {/* Animated Glow */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-[#16a245]/20 animate-pulse"></div>
                </motion.div>

                {/* Grasas Section */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="order-3"
                >
                  <Card className="border-gray-800/50 bg-gray-900/30 backdrop-blur-sm hover:border-[#16a245]/50 transition-all duration-300 h-full">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-[#16a245]/10 border border-[#16a245]/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Microscope className="w-8 h-8 text-[#16a245]" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-6">Elaboración de Grasas</h3>
                      <div className="space-y-4">
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <div className="text-[#16a245] text-sm font-medium">Superficie</div>
                          <div className="text-white text-xl font-bold">2,000 m²</div>
                          <div className="text-gray-400 text-xs">cubiertos</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <div className="text-[#16a245] text-sm font-medium">Producción</div>
                          <div className="text-white text-xl font-bold">700K ton</div>
                          <div className="text-gray-400 text-xs">al año</div>
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
              className="bg-gradient-to-r from-[#16a245]/10 via-[#16a245]/5 to-transparent border border-[#16a245]/30 rounded-2xl p-8 text-center"
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                Más de <span className="text-[#16a245]">300 productos</span> desarrollados
              </h3>
              <p className="text-gray-300 mb-6">
                Nuestra calidad es reconocida por profesionales de toda la industria:
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  'Usuarios de vehículos de calle',
                  'Talleristas especializados',
                  'Preparadores de autos de competición',
                  'Industria pesada'
                ].map((reconocimiento, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Badge className="bg-[#16a245] text-white px-4 py-2 text-sm hover:bg-[#0d7a32] transition-colors duration-300">
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
      <section className="relative py-24 bg-gradient-to-b from-black to-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="relative inline-flex items-center gap-3 rounded-lg border border-[#16a245]/30 bg-gray-900/30 backdrop-blur-sm px-6 py-3 text-sm font-medium text-[#16a245] mb-6">
                <NeonBorders intensity={0.3} />
                <Microscope className="h-5 w-5" />
                <span>LABORATORIO ESPECIALIZADO</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
                ANÁLISIS Y
                <span className="block text-[#16a245]">ENSAYOS</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                Ofrecemos servicios especializados de análisis para el seguimiento completo de lubricantes
              </p>
            </motion.div>

            {/* Analysis Steps */}
            <div className="grid md:grid-cols-4 gap-6 mb-16">
              {[
                { number: '1', title: 'Nivel de desgaste de los motores', icon: Settings },
                { number: '2', title: 'Órganos mecánicos', icon: Factory },
                { number: '3', title: 'Caja de cambios', icon: Zap },
                { number: '4', title: 'Sistema hidráulico', icon: Shield }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#16a245] to-[#0d7a32] text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto shadow-[0_0_30px_rgba(22,162,69,0.3)] group-hover:shadow-[0_0_50px_rgba(22,162,69,0.5)] transition-all duration-300">
                      {item.number}
                    </div>
                    <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-2 border-[#16a245]/30 animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <item.icon className="w-6 h-6 text-[#16a245] mx-auto mb-2" />
                    <p className="text-white font-medium">{item.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Portable Lab Section */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h3 className="text-3xl font-bold text-white mb-4">
                  Laboratorio Portátil - <span className="text-[#16a245]">Pórtala</span>
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Nuestro equipo utiliza el <strong className="text-[#16a245]">pórtala</strong>, 
                  un laboratorio portátil que permite analizar lubricantes in situ y 
                  determinar los metales presentes procedentes del desgaste.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Esta práctica ofrece datos certeros para anticiparse a fallas y 
                  determinar umbrales de alerta, permitiendo <strong className="text-[#16a245]">
                  parar motores antes de roturas mecánicas</strong> y monitorear 
                  la evolución del contenido de metales.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Análisis", value: "In Situ" },
                    { label: "Precisión", value: "99.9%" },
                    { label: "Tiempo", value: "Inmediato" },
                    { label: "Prevención", value: "Predictiva" }
                  ].map((spec, index) => (
                    <div key={index} className="border border-gray-800 rounded-lg p-4 bg-gray-900/30">
                      <div className="text-[#16a245] text-sm font-medium">{spec.label}</div>
                      <div className="text-white font-bold">{spec.value}</div>
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
                <div className="relative rounded-2xl overflow-hidden border border-gray-800/50">
                  <Image
                    src="/landing/hand-cleaning-engine.jpg.webp"
                    alt="Laboratorio portátil Pórtala"
                    width={600}
                    height={400}
                    className="w-full h-[400px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Analysis Results Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-sm border border-[#16a245]/30 rounded-lg p-4">
                    <div className="text-[#16a245] text-sm font-medium mb-1">Análisis en Tiempo Real</div>
                    <div className="text-white font-bold">Prevención de Fallas Mecánicas</div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-[#16a245]"></div>
                <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-[#16a245]"></div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-24 bg-gradient-to-b from-gray-950 to-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              ¿LISTO PARA EXPERIMENTAR
              <span className="block text-[#16a245]">LA DIFERENCIA KANSACO?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Descubre cómo nuestros más de 50 años de experiencia pueden proteger y optimizar tus motores
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tecnologia-lubricantes">
                <Button
                  size="lg"
                  className="bg-[#16a245] text-white text-lg px-8 py-4 hover:bg-[#0d7a32] transition-all duration-300 hover:shadow-[0_0_20px_rgba(22,162,69,0.5)]"
                >
                  VER NUESTRA TECNOLOGÍA
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/productos">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#16a245] text-[#16a245] text-lg px-8 py-4 hover:bg-[#16a245] hover:text-white transition-all duration-300"
                >
                  VER PRODUCTOS
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 