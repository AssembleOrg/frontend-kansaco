// Reemplazar productos hardcodeados por datos reales del API (si aplica al backoffice)
// Habilitar los botones y agregar navegación real
// Conectar con funcionalidad de carrito

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { NeonBorders } from './HeroBanner';

interface FeaturedProductsProps {
  products?: Product[];
}

const FeaturedProducts = ({ products = [] }: FeaturedProductsProps) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const mockFeaturedProducts: Product[] = [
      {
        id: 1,
        name: 'KANSACO Sintético 5W-30',
        sku: 'KAN-SIN-5W30-4L',
        slug: 'kansaco-sintetico-5w30',
        category: ['Sintéticos', 'Aceites para Motor'],
        description:
          'Aceite sintético de alta performance para motores modernos',
        presentation: '4L',
        aplication: 'Motores de gasolina modernos',
        imageUrl: '/images/products/sintetico-5w30.jpg',
        wholeSaler: 'KANSACO',
        stock: 50,
        isVisible: true,
        price: 8500,
      },
      {
        id: 2,
        name: 'KANSACO Diesel Heavy Line 15W-40',
        sku: 'KAN-DIE-15W40-20L',
        slug: 'kansaco-diesel-heavy-15w40',
        category: ['Industrial', 'Diesel Heavy Line'],
        description: 'Lubricante especializado para motores diesel pesados',
        presentation: '20L',
        aplication: 'Motores diesel industriales',
        imageUrl: '/images/products/diesel-heavy-15w40.jpg',
        wholeSaler: 'KANSACO',
        stock: 25,
        isVisible: true,
        price: 12000,
      },
      {
        id: 3,
        name: 'KANSACO Polymer Protection Film',
        sku: 'KAN-POL-PROT-500ML',
        slug: 'kansaco-polymer-protection-film',
        category: ['Derivados Y Aditivos', 'Films de Protección'],
        description: 'Film de protección polimérica para máximo rendimiento',
        presentation: '500ml',
        aplication: 'Protección de superficies metálicas',
        imageUrl: '/images/products/polymer-protection.jpg',
        wholeSaler: 'KANSACO',
        stock: 30,
        isVisible: true,
        price: 15000,
      },
    ];

    setTimeout(() => {
      setFeaturedProducts(
        products.length > 0 ? products.slice(0, 3) : mockFeaturedProducts
      );
      setIsLoading(false);
    }, 1000);
  }, [products]);

  // Los productos destacados son solo placeholder visual - sin funcionalidad
  const handlePlaceholderClick = () => {
    // Placeholder sin funcionalidad
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
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 py-24">
      <div className="absolute left-0 right-0 top-0 h-24 bg-gradient-to-b from-gray-900/80 to-transparent"></div>

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
        <div className="mb-16 text-center">
          <div className="relative mb-6 inline-flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2 text-sm font-medium text-[#16a245]">
            <NeonBorders intensity={0.3} />
            <Zap className="h-4 w-4" />
            <span>LO MÁS NUEVO EN PROTECCIÓN</span>
          </div>

          <h2 className="mb-6 text-4xl font-black leading-tight text-white lg:text-5xl">
            PRODUCTOS
            <span className="block text-[#16a245]">DESTACADOS (Hardcodeado)</span>
          </h2>

          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-400">
            Descubre nuestra selección de productos más innovadores, diseñados
            con la última tecnología en ingeniería líquida.
          </p>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => {
            return (
              <div
                key={product.id}
                className="group rounded-lg border border-gray-800/50 bg-gray-900/50 p-6 transition-all duration-300 hover:border-gray-700 hover:bg-gray-900/70"
              >
                <div className="relative mb-6 h-48 overflow-hidden rounded-lg bg-gradient-to-br from-gray-800 to-gray-900">
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

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="border-gray-700 bg-gray-600 text-white cursor-not-allowed"
                      disabled
                      onClick={handlePlaceholderClick}
                    >
                      Placeholder
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 text-xs font-medium text-[#16a245]">
                        {product.category[0]}
                      </div>
                      <h3 className="text-lg font-bold text-white transition-colors duration-300 group-hover:text-[#16a245]">
                        {product.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-400">
                        Consultar precio
                      </div>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-gray-400">
                    {product.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="rounded bg-gray-800 px-2 py-1 text-gray-300">
                      {product.presentation}
                    </span>
                    <span className="rounded bg-gray-800 px-2 py-1 text-gray-300">
                      SKU: {product.sku}
                    </span>
                  </div>

                  <Button
                    onClick={handlePlaceholderClick}
                    className="w-full bg-gray-500 text-white cursor-not-allowed"
                    size="sm"
                    disabled
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Placeholder
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

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
