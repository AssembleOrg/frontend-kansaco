'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { NeonBorders } from './HeroBanner';
import { getProducts, getProductsPaginated } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  // Fetch productos destacados con fallback
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Intentar obtener productos destacados
        const result = await getProductsPaginated(null, {
          page: 1,
          limit: 9,
          isVisible: true,
          isFeatured: true,
        });

        // Fallback: si no hay destacados, mostrar productos visibles
        if (result.data.length === 0) {
          const fallbackResult = await getProductsPaginated(null, {
            page: 1,
            limit: 9,
            isVisible: true,
          });
          setProducts(fallbackResult.data);
        } else {
          setProducts(result.data);
        }
      } catch (error) {
        // Fallback en caso de error
        console.warn('Error using paginated endpoint, falling back:', error);
        try {
          const data = await getProducts(null);
          const visibleProducts = data
            .filter((p) => p.isVisible && (p.isFeatured || true))
            .slice(0, 9);
          setProducts(visibleProducts);
        } catch (fallbackError) {
          console.error('Error fetching products:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Responsive items per page
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSlides = Math.ceil(products.length / itemsPerPage);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Auto-slide cada 5 segundos
  useEffect(() => {
    if (totalSlides <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [totalSlides, nextSlide]);

  const getCurrentProducts = () => {
    const start = currentIndex * itemsPerPage;
    return products.slice(start, start + itemsPerPage);
  };

  if (isLoading) {
    return (
      <section className="bg-gray-900 py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mx-auto mb-4 h-8 w-64 animate-pulse rounded bg-gray-800"></div>
            <div className="mx-auto h-4 w-96 animate-pulse rounded bg-gray-800"></div>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg bg-gray-800 p-6 shadow-lg"
              >
                <div className="mb-4 h-48 rounded-lg bg-gray-700"></div>
                <div className="mb-2 h-6 w-3/4 rounded bg-gray-700"></div>
                <div className="mb-4 h-4 w-full rounded bg-gray-700"></div>
                <div className="h-10 rounded bg-gray-700"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-products" className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 py-24">
      <div className="absolute left-0 right-0 top-0 h-24 bg-gradient-to-b from-gray-900/80 to-transparent"></div>

      {/* Background decorations */}
      <div className="absolute inset-0 opacity-45">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`oil-drop-${i}`}
            className="absolute h-3 w-2 rounded-full bg-[#16a245]"
            style={{
              left: `${20 + i * 12}%`,
              top: `${15 + i * 10}%`,
              clipPath: 'ellipse(50% 60% at 50% 40%)',
              animationDelay: `${i * 1.5}s`,
              animation: 'dropFlow 10s ease-in-out infinite',
            }}
          />
        ))}

        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`gear-${i}`}
            className="absolute h-10 w-10 rounded-full border-2 border-[#16a245]/40"
            style={{
              right: `${10 + i * 15}%`,
              top: `${25 + i * 20}%`,
              animationDelay: `${i * 2}s`,
              animation: 'gearRotate 15s linear infinite',
            }}
          >
            <div className="absolute inset-1 rounded-full border border-[#16a245]/25" />
          </div>
        ))}

        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={`product-flow-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-[#16a245]/50 to-transparent"
            style={{
              top: `${40 + i * 25}%`,
              left: '5%',
              right: '5%',
              transform: `skew(${5 - i * 10}deg)`,
              animationDelay: `${i * 3}s`,
              animation: 'flowPulse 8s ease-in-out infinite',
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 opacity-[0.01]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(22, 162, 69, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(22, 162, 69, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Kancore Highlight - ARRIBA del slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col items-center justify-center gap-4 rounded-xl border border-[#d4af37]/30 bg-gray-900/60 p-6 backdrop-blur-sm sm:flex-row sm:gap-6"
        >
          <span className="text-base text-gray-300 sm:text-lg">
            Conocé nuestro nuevo producto:
          </span>
          <motion.span
            className="text-2xl font-black text-[#d4af37] sm:text-3xl"
            animate={{
              textShadow: [
                '0 0 10px rgba(212, 175, 55, 0.5)',
                '0 0 20px rgba(212, 175, 55, 0.8)',
                '0 0 10px rgba(212, 175, 55, 0.5)',
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
          <Link href="/kancore">
            <Button
              size="sm"
              className="bg-[#d4af37] text-black font-semibold transition-all duration-300 hover:bg-[#b8962e] hover:shadow-[0_0_15px_rgba(212,175,55,0.5)]"
            >
              Descubrir más
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <div className="mb-16 text-center">
          <div className="relative mb-6 inline-flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2 text-sm font-medium text-[#16a245]">
            <NeonBorders intensity={0.3} />
            <Zap className="h-4 w-4" />
            <span>LO MÁS NUEVO EN PROTECCIÓN</span>
          </div>

          <h2 className="mb-6 text-4xl font-black leading-tight text-white lg:text-5xl">
            PRODUCTOS
            <span className="block text-[#16a245]">DESTACADOS</span>
          </h2>

          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-400">
            Descubre nuestra selección de productos más innovadores, diseñados
            con la última tecnología en ingeniería líquida.
          </p>
        </div>

        {/* Slider */}
        {products.length > 0 && (
          <div className="relative mb-16">
            {/* Navigation Buttons */}
            {totalSlides > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute -left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-gray-700 bg-gray-900/90 p-2 text-white transition-all hover:border-[#16a245] hover:bg-gray-800 sm:-left-6"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute -right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-gray-700 bg-gray-900/90 p-2 text-white transition-all hover:border-[#16a245] hover:bg-gray-800 sm:-right-6"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </>
            )}

            {/* Products Grid */}
            <div className="overflow-hidden px-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
                >
                  {getCurrentProducts().map((product) => (
                    <div
                      key={product.id}
                      className="group mx-auto flex h-full w-full max-w-sm flex-col rounded-lg border border-gray-800/50 bg-gray-900/50 p-6 transition-all duration-300 hover:border-[#16a245]/50 hover:bg-gray-900/70"
                    >
                      {/* Product Image */}
                      <div className="relative mb-6 h-48 overflow-hidden rounded-lg bg-gradient-to-br from-gray-800 to-gray-900">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#16a245] to-[#0d7a32] shadow-lg">
                              <Image
                                src="/landing/kansaco-logo.png"
                                alt="KANSACO Logo"
                                width={64}
                                height={64}
                                className="h-16 w-auto"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-1 flex-col space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-1 text-xs font-medium text-[#16a245]">
                              {product.category[0]}
                            </div>
                            <h3 className="line-clamp-2 text-lg font-bold text-white transition-colors duration-300 group-hover:text-[#16a245]">
                              {product.name}
                            </h3>
                          </div>
                        </div>

                        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-gray-400">
                          {product.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {product.presentation && (
                            <span className="rounded bg-gray-800 px-2 py-1 text-gray-300">
                              {product.presentation}
                            </span>
                          )}
                          {product.sku && (
                            <span className="rounded bg-gray-800 px-2 py-1 text-gray-300">
                              SKU: {product.sku}
                            </span>
                          )}
                        </div>

                        <Link href={`/productos/${product.slug}`} className="mt-auto">
                          <Button
                            className="w-full bg-[#16a245] text-white transition-all duration-300 hover:bg-[#0d7a32]"
                            size="sm"
                          >
                            Ver producto
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots Indicator */}
            {totalSlides > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-8 bg-[#16a245]'
                        : 'w-2 bg-gray-600 hover:bg-gray-500'
                    }`}
                    aria-label={`Ir a slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA Button */}
        <div className="text-center">
          <Link href="/productos">
            <Button
              size="lg"
              className="bg-[#16a245] text-white shadow-lg transition-all duration-300 hover:bg-[#0d7a32] hover:shadow-xl"
            >
              Ver Todos los Productos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-gray-900"></div>

      <style jsx>{`
        @keyframes dropFlow {
          0%,
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translateY(30px) scale(1.2);
            opacity: 1;
          }
        }

        @keyframes gearRotate {
          0% {
            transform: rotate(0deg);
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: rotate(360deg);
            opacity: 0.4;
          }
        }

        @keyframes flowPulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scaleX(0.9);
          }
          50% {
            opacity: 0.7;
            transform: scaleX(1.1);
          }
        }
      `}</style>
    </section>
  );
};

export default FeaturedProducts;
