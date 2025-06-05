'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  gradient: string;
  delay: number;
  filterValue: string;
}

const categories: Category[] = [
  {
    id: 'vehiculos',
    title: 'Vehículos',
    description: 'Aceites para automóviles, camionetas y vehículos livianos',
    imageUrl: '/landing/barril-mercedes.png',
    gradient: 'from-[#16a245] to-[#0d7a32]',
    delay: 0.1,
    filterValue: 'Vehículos',
  },
  {
    id: 'industrial',
    title: 'Industrial',
    description: 'Lubricantes para maquinaria y equipo industrial pesado',
    imageUrl: '/landing/agro-kansaco.png',
    gradient: 'from-[#0d7a32] to-[#16a245]',
    delay: 0.2,
    filterValue: 'Industrial',
  },
  {
    id: 'aditivos',
    title: 'Derivados Y Aditivos',
    description: 'Aditivos, tratamientos y productos complementarios',
    imageUrl: '/landing/3bidones-kansaco.png',
    gradient: 'from-[#16a245] to-[#0d7a32]',
    delay: 0.3,
    filterValue: 'Derivados Y Aditivos',
  },
  {
    id: 'motos',
    title: 'Motos',
    description: 'Aceites especializados para motocicletas y scooters',
    imageUrl: '/landing/bike-green.png',
    gradient: 'from-[#0d7a32] to-[#16a245]',
    delay: 0.4,
    filterValue: 'Motos',
  },
];

const CategoriesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const neonIntensity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.3, 1.0, 1.0, 0.3]
  );
  const cardsY = useTransform(scrollYProgress, [0, 0.5, 1], [50, 0, -50]);

  return (
    <section
      id="categories"
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 py-20"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ opacity: neonIntensity }}
      >
        <div className="absolute inset-0 opacity-40">
          {[15, 25, 35, 45, 55, 65, 75, 85, 95, 5, 50, 30, 70, 20, 80].map(
            (leftPos, i) => (
              <motion.div
                key={`drop-${i}`}
                className="absolute h-4 w-3 rounded-full bg-[#16a245]/60"
                style={{
                  left: `${leftPos}%`,
                  clipPath: 'ellipse(50% 60% at 50% 40%)',
                }}
                animate={{
                  y: [-20, 800],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 8 + (i % 4),
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: 'easeInOut',
                }}
              />
            )
          )}
        </div>

        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={`piston-${i}`}
              className="absolute h-16 w-8 rounded-t-lg bg-gradient-to-b from-[#16a245]/50 to-transparent"
              style={{
                left: `${15 + i * 12}%`,
                bottom: '20%',
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 opacity-40">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={`flow-${i}`}
              className="absolute h-px bg-gradient-to-r from-transparent via-[#16a245] to-transparent"
              style={{
                top: `${i * 8}%`,
                left: 0,
                right: 0,
                transform: `skew(${-20 + i * 2}deg)`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scaleX: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <motion.div
          className="absolute bottom-0 left-1/2 top-0 w-1 -translate-x-1/2 transform bg-gradient-to-b from-transparent via-[#16a245] to-transparent shadow-[0_0_20px_#16a245]"
          animate={{
            opacity: [0.3, 1, 0.3],
            boxShadow: [
              '0 0 20px #16a245',
              '0 0 40px #16a245, 0 0 60px #16a245',
              '0 0 20px #16a245',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 transform bg-gradient-to-r from-transparent via-[#16a245] to-transparent shadow-[0_0_20px_#16a245]"
          animate={{
            opacity: [0.3, 1, 0.3],
            boxShadow: [
              '0 0 20px #16a245',
              '0 0 40px #16a245, 0 0 60px #16a245',
              '0 0 20px #16a245',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5,
          }}
        />
      </motion.div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="mb-6 text-4xl font-black sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              NUESTRAS
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#16a245] via-[#0d7a32] to-[#16a245] bg-clip-text text-transparent">
              CATEGORÍAS
            </span>
          </motion.h2>

          <motion.p
            className="mx-auto max-w-3xl text-xl text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Descubre nuestra gama completa de productos de ingeniería líquida,
            diseñados para maximizar el rendimiento de tu vehículo.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
          style={{ y: cardsY }}
        >
          {categories.map((category) => (
            <motion.div
              key={category.id}
              className="group relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: category.delay,
                ease: 'easeOut',
              }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={`/productos?category=${encodeURIComponent(category.filterValue)}`}
              >
                <div className="relative h-80 cursor-pointer overflow-hidden rounded-2xl border border-gray-700/50 bg-black/50 backdrop-blur-sm transition-all duration-500 group-hover:border-[#16a245]/50 group-hover:bg-black/70">
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${category.imageUrl})`,
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 transition-opacity duration-500 group-hover:from-black/95 group-hover:via-black/70 group-hover:to-black/40" />

                  <motion.div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    initial={false}
                  >
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute h-0.5 bg-gradient-to-r from-[#16a245]/60 via-[#16a245]/20 to-transparent"
                        style={{
                          top: '50%',
                          left: '50%',
                          width: '150%',
                          transformOrigin: 'left center',
                          transform: `rotate(${i * 45}deg) translate(-50%, -50%)`,
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1.5, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: 'easeOut',
                        }}
                      />
                    ))}

                    <motion.div
                      className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-[#16a245] blur-sm"
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </motion.div>

                  <div className="relative z-10 flex h-full flex-col justify-end p-6">
                    <div className="space-y-4 text-left">
                      <h3 className="text-2xl font-bold text-white drop-shadow-lg transition-colors duration-300 group-hover:text-[#16a245]">
                        {category.title}
                      </h3>

                      <p className="text-sm leading-relaxed text-gray-200 drop-shadow-md transition-colors duration-300 group-hover:text-gray-100">
                        {category.description}
                      </p>

                      <motion.div
                        className={`mt-6 w-full rounded-lg bg-gradient-to-r py-3 ${category.gradient} flex translate-y-2 transform items-center justify-center gap-2 font-semibold text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>Ver Productos</span>
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </div>
                  </div>

                  <motion.div
                    className="absolute right-2 top-2 h-3 w-3 rounded-full bg-[#16a245]/50 opacity-0 blur-sm group-hover:opacity-100"
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [1, 2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <motion.div
                    className="absolute bottom-2 left-2 h-2 w-2 rounded-full bg-[#0d7a32]/50 opacity-0 blur-sm group-hover:opacity-100"
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [1, 1.8, 1],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: 0.5,
                      ease: 'easeInOut',
                    }}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="relative mb-12"
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="h-px bg-gradient-to-r from-transparent via-[#16a245] to-transparent"></div>
            <motion.div
              className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-[#16a245] blur-sm"
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>

          <motion.div
            className="flex flex-col items-center justify-center gap-6 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/lineas-de-productos"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-[#16a245] to-[#0d7a32] px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:shadow-[#16a245]/30"
              >
                <Sparkles className="h-5 w-5" />
                <span className="relative z-10">Ver Nuestras Líneas</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 translate-x-[-100%] skew-x-12 bg-white/20 transition-transform duration-700 group-hover:translate-x-[100%]"></div>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/productos"
                className="group relative inline-flex items-center gap-3 rounded-xl border-2 border-[#16a245]/50 bg-black/20 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-[#16a245] hover:bg-[#16a245]/10"
              >
                <span>Ver Todos los Productos</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-12 flex justify-center gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            viewport={{ once: true }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="h-1 w-1 rounded-full bg-[#16a245]"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-gray-900/50 to-black"></div>
    </section>
  );
};

export default CategoriesSection;
