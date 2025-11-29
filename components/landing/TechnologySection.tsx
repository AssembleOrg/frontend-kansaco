'use client';

import Link from 'next/link';
import { Atom, Zap, Shield, Cog, ArrowRight, Beaker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NeonBorders } from './HeroBanner';

const TechnologySection = () => {
  const features = [
    {
      icon: Atom,
      title: 'Ingeniería Molecular',
      description:
        'Fórmulas desarrolladas a nivel molecular para máxima eficiencia',
      metric: '99.9%',
      metricLabel: 'Pureza',
    },
    {
      icon: Shield,
      title: 'Protección Avanzada',
      description: 'Tecnología de films protectores que extienden la vida útil',
      metric: '300%',
      metricLabel: 'Extensión de vida',
    },
    {
      icon: Zap,
      title: 'Alto Rendimiento',
      description: 'Optimización energética y reducción de fricción',
      metric: '15%',
      metricLabel: 'Ahorro energético',
    },
    {
      icon: Cog,
      title: 'Precisión Industrial',
      description: 'Soluciones específicas para cada tipo de maquinaria',
      metric: '1000+',
      metricLabel: 'Aplicaciones',
    },
  ];

  return (
    <section
      id="technology"
      className="relative overflow-hidden bg-gradient-to-b from-black via-gray-950 to-gray-900 py-24"
    >
      {/* Smooth transition from previous section */}
      <div className="absolute left-0 right-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent"></div>

      {/* Subtle animated background elements */}
      <div className="absolute inset-0 opacity-60">
        {/* Floating oil molecules */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`molecule-${i}`}
            className="absolute h-2 w-2 rounded-full bg-[#16a245]"
            style={{
              left: `${15 + i * 10}%`,
              top: `${20 + i * 8}%`,
              animationDelay: `${i * 0.8}s`,
              animation: 'float 8s ease-in-out infinite',
            }}
          />
        ))}

        {/* Subtle flow lines */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`flow-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-[#16a245]/60 to-transparent"
            style={{
              top: `${30 + i * 20}%`,
              left: 0,
              right: 0,
              transform: `skew(${-10 + i * 5}deg)`,
              animationDelay: `${i * 1.5}s`,
              animation: 'pulse 6s ease-in-out infinite',
            }}
          />
        ))}
      </div>

      {/* Grid background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(22, 162, 69, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(22, 162, 69, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-20 lg:grid-cols-2">
          {/* Content Side */}
          <div className="space-y-12">
            {/* Header */}
            <div className="space-y-6">
              <div className="relative inline-flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2 text-sm font-medium text-[#16a245]">
                <NeonBorders intensity={0.3} />
                <Beaker className="h-4 w-4" />
                <span>INNOVACIÓN CIENTÍFICA</span>
              </div>

              <h2 className="text-4xl font-black leading-tight text-white lg:text-5xl">
                LA CIENCIA
                <span className="block text-[#16a245]">DETRÁS DE KANSACO</span>
              </h2>

              <p className="text-lg leading-relaxed text-gray-400 lg:text-xl">
                Más de medio siglo dedicados al desarrollo de tecnologías
                avanzadas en lubricación. Nuestro equipo de investigación
                trabaja constantemente en la búsqueda de nuevas formas de
                proteger y optimizar el rendimiento de motores y maquinarias.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-6 transition-all duration-300 hover:border-gray-700 hover:bg-gray-900/50"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#16a245]/10 text-[#16a245]">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-white">
                        {feature.metric}
                      </div>
                      <div className="text-xs text-gray-500">
                        {feature.metricLabel}
                      </div>
                    </div>
                  </div>

                  <h3 className="mb-2 text-lg font-bold text-white">
                    {feature.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div>
              <Link href="/sobre-nosotros">
                <Button
                  size="lg"
                  className="bg-[#16a245] text-white shadow-lg transition-all duration-300 hover:bg-[#0d7a32] hover:shadow-xl"
                >
                  CONOCE NUESTRA TECNOLOGÍA
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative">
            {/* Oil GIF Container */}
            <div className="relative h-[600px] w-full overflow-hidden rounded-lg border border-gray-800/50 bg-gradient-to-br from-gray-900 to-black">
              {/* Oil Science Image */}
              <div className="relative h-full w-full">
                <video
                  src="/landing/kansaco-oil.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                >
                  <source src="/landing/kansaco-oil.mp4" type="video/mp4" />
                  Tu navegador no soporta videos HTML5.
                </video>
              </div>

              {/* Overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              {/* Corner Accents */}
              <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-[#16a245]/60" />
              <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-[#16a245]/60" />
            </div>

            <div className="absolute bottom-2 right-2 rounded-lg border border-gray-800/50 bg-black/90 p-4 backdrop-blur-sm md:-bottom-6 md:-right-6">
              <div className="text-sm font-medium text-gray-400">
                Protección
              </div>
              <div className="text-xl font-black text-white">100%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Smooth transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-gray-900"></div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.4;
            transform: scaleX(0.8);
          }
          50% {
            opacity: 1;
            transform: scaleX(1.1);
          }
        }
      `}</style>
    </section>
  );
};

export default TechnologySection;
