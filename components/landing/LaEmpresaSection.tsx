'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Building2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { NeonBorders } from './HeroBanner';

const LaEmpresaSection = () => {
  return (
    <section
      id="la-empresa"
      className="relative overflow-hidden bg-gradient-to-b from-black via-gray-950 to-gray-900 py-24"
    >
      {/* Smooth transition from previous section (HeroBanner) */}
      <div className="absolute left-0 right-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent"></div>

      {/* Subtle animated background elements */}
      <div className="absolute inset-0 opacity-40">
        {/* Floating particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute h-1.5 w-1.5 rounded-full bg-[#16a245]"
            style={{
              left: `${10 + i * 15}%`,
              top: `${15 + i * 12}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.8,
            }}
          />
        ))}
      </div>

      {/* Grid background pattern */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(22, 162, 69, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(22, 162, 69, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Content Side */}
          <motion.div
            className="space-y-8 text-center lg:text-left"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Premium Badge */}
            <motion.div
              className="relative inline-flex items-center gap-3 rounded-lg border border-[#16a245]/30 bg-[#16a245]/10 px-4 py-2 text-sm font-medium text-[#16a245]"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <NeonBorders intensity={0.3} />
              <Building2 className="h-4 w-4" />
              <span>LA EMPRESA</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h2
              className="text-4xl font-black leading-tight text-white lg:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="block">KANSACO</span>
              <span className="block bg-gradient-to-r from-[#16a245] via-[#0d7a32] to-[#16a245] bg-clip-text text-transparent">
                50 AÑOS DE EXCELENCIA
              </span>
              <span className="block text-gray-200">EN LUBRICACIÓN</span>
            </motion.h2>

            {/* Company Description */}
            <motion.p
              className="text-lg leading-relaxed text-gray-300 lg:text-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Desde hace{' '}
              <span className="font-semibold text-[#16a245]">
                más de medio siglo
              </span>
              , nos encontramos abocados al{' '}
              <span className="font-semibold text-[#16a245]">
                desarrollo de tecnologías
              </span>{' '}
              dirigidas a los sistemas de lubricación. Con gran dedicación,
              nuestro equipo de desarrollo trabaja en la{' '}
              <span className="font-semibold text-[#16a245]">
                búsqueda constante
              </span>{' '}
              de nuevas y diversas formas de lubricar automotores de calle y
              competición, transporte, maquinarias agrícolas, industria,
              transporte marítimo y aéreo.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <Link href="/sobre-nosotros">
                <Button
                  size="lg"
                  className="bg-[#16a245] text-white shadow-lg transition-all duration-300 hover:bg-[#0d7a32] hover:shadow-xl"
                >
                  CONOCER MÁS
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/tecnologia-lubricantes">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-[#16a245]/50 bg-black/20 text-white backdrop-blur-sm transition-all duration-300 hover:border-[#16a245] hover:bg-[#16a245]/20 hover:text-white"
                >
                  TECNOLOGÍA KANSACO
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Visual Side with Floating Cards */}
          <motion.div
            className="relative min-h-[500px] lg:min-h-[600px]"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Decorative Background Orbs */}
            <motion.div
              className="absolute left-1/4 top-1/4 h-40 w-40 rounded-full bg-[#16a245]/10 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 h-32 w-32 rounded-full bg-[#16a245]/15 blur-2xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            />

            {/* Floating Card 1 - Top Right */}
            <motion.div
              className="absolute right-[10%] top-[20%] w-[200px] sm:w-[250px]"
              initial={{ opacity: 0, y: 20, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: 6 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              animate={{
                y: [0, -12, 0],
              }}
              style={{
                transition: 'all 0.3s ease',
              }}
            >
              <motion.div
                className="relative overflow-hidden rounded-lg border-2 border-[#16a245]/40 bg-black/20 p-2 shadow-[0_0_20px_rgba(22,162,69,0.3)] backdrop-blur-sm"
                whileHover={{ scale: 1.05, rotate: 8 }}
                transition={{
                  y: {
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                  scale: { duration: 0.3 },
                  rotate: { duration: 0.3 },
                }}
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src="/landing/laempresa1.webp"
                    alt="KANSACO - Marca"
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
                {/* Corner accents */}
                <div className="absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-[#16a245]/60" />
                <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-[#16a245]/60" />
              </motion.div>
            </motion.div>

            {/* Floating Card 2 - Bottom Left */}
            <motion.div
              className="absolute left-[15%] top-[65%] w-[200px] sm:w-[250px]"
              initial={{ opacity: 0, y: 20, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: -5 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              animate={{
                y: [0, -10, 0],
              }}
              style={{
                transition: 'all 0.3s ease',
              }}
            >
              <motion.div
                className="relative overflow-hidden rounded-lg border-2 border-[#16a245]/40 bg-black/20 p-2 shadow-[0_0_20px_rgba(22,162,69,0.3)] backdrop-blur-sm"
                whileHover={{ scale: 1.05, rotate: -7 }}
                transition={{
                  y: {
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                  },
                  scale: { duration: 0.3 },
                  rotate: { duration: 0.3 },
                }}
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src="/landing/laempresa2.webp"
                    alt="KANSACO - Productos"
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
                {/* Corner accents */}
                <div className="absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-[#16a245]/60" />
                <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-[#16a245]/60" />
              </motion.div>
            </motion.div>

            {/* Additional decorative glow spots */}
            <motion.div
              className="absolute right-[5%] top-[10%] h-12 w-12 rounded-full bg-[#16a245]/30 blur-xl"
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.4, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-[15%] left-[8%] h-16 w-16 rounded-full bg-[#16a245]/25 blur-xl"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1.5,
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Smooth transition to next section (CategoriesSection) */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-gray-900"></div>
    </section>
  );
};

export default LaEmpresaSection;
