'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
    imageUrl: '/landing/barril-mercedes.webp',
    gradient: 'from-[#16a245] to-[#0d7a32]',
    delay: 0.1,
    filterValue: 'Vehículos',
  },
  {
    id: 'industrial',
    title: 'Industrial',
    description: 'Lubricantes para maquinaria y equipo industrial pesado',
    imageUrl: '/landing/agro-kansaco.webp',
    gradient: 'from-[#0d7a32] to-[#16a245]',
    delay: 0.2,
    filterValue: 'Industrial',
  },
  {
    id: 'motos',
    title: 'Motos',
    description: 'Aceites especializados para motocicletas y scooters',
    imageUrl: '/landing/bike-green.webp',
    gradient: 'from-[#16a245] to-[#0d7a32]',
    delay: 0.3,
    filterValue: 'Motos',
  },
  {
    id: 'grasas',
    title: 'Grasas',
    description: 'Lubricación sólida de alta duración',
    imageUrl: '/grasa.webp',
    gradient: 'from-[#16a245] to-[#0d7a32]',
    delay: 0.4,
    filterValue: 'Grasas',
  },
  {
    id: 'aditivos',
    title: 'Derivados Y Aditivos',
    description: 'Aditivos, tratamientos y productos complementarios',
    imageUrl: '/landing/3bidones-kansaco.webp',
    gradient: 'from-[#0d7a32] to-[#16a245]',
    delay: 0.5,
    filterValue: 'Derivados Y Aditivos',
  },
];

const CategoriesSection = () => {
  return (
    <section
      id="categories"
      className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 py-20"
    >
      {/* Fondo decorativo — pointer-events-none en el contenedor padre */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-[#16a245]"
            style={{
              left: `${10 + i * 11}%`,
              top: `${15 + i * 9}%`,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.6,
            }}
          />
        ))}
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-6 text-4xl font-black sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              NUESTRAS
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#16a245] via-[#0d7a32] to-[#16a245] bg-clip-text text-transparent">
              CATEGORÍAS
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-300">
            Descubre nuestra gama completa de productos de ingeniería líquida,
            diseñados para maximizar el rendimiento de tu vehículo.
          </p>
        </motion.div>

        {/* Grid de cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: category.delay, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              <Link
                href={`/productos?category=${encodeURIComponent(category.filterValue)}`}
                className="group block"
              >
                <div className="relative h-80 overflow-hidden rounded-2xl border border-gray-700/50 bg-black/50 transition-all duration-300 group-hover:border-[#16a245]/50">
                  <Image
                    src={category.imageUrl}
                    alt={category.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    loading="lazy"
                    quality={60}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 transition-opacity duration-300 group-hover:from-black/95" />
                  <div className="relative z-10 flex h-full flex-col justify-end p-5 lg:p-4">
                    <h3 className="mb-2 text-2xl font-bold text-white transition-colors duration-300 group-hover:text-[#16a245] lg:text-xl">
                      {category.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-200 lg:text-[13px]">
                      {category.description}
                    </p>
                    <div
                      className={`mt-4 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r py-3 ${category.gradient} translate-y-2 font-semibold text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100`}
                    >
                      <span>Ver Productos</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Botones al pie */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="mb-12 h-px bg-gradient-to-r from-transparent via-[#16a245] to-transparent" />

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/lineas-de-productos"
              className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#16a245] to-[#0d7a32] px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:brightness-110"
            >
              <Sparkles className="h-5 w-5" />
              <span>Ver Nuestras Líneas</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/productos"
              className="inline-flex items-center gap-3 rounded-xl border-2 border-[#16a245]/50 bg-black/20 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-[#16a245] hover:bg-[#16a245]/10"
            >
              <span>Ver Todos los Productos</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesSection;
