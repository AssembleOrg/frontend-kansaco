'use client';

import { MapPin, Award, Heart } from 'lucide-react';
import { NeonBorders } from './HeroBanner';

const ArgentinaSection = () => {
  const argentineStats = [
    { icon: Award, number: '50+', label: 'Años de Experiencia' },
    { icon: MapPin, number: '100%', label: 'Calidad Argentina' },
    { icon: Heart, number: '1000+', label: 'Clientes Satisfechos' },
  ];

  return (
    <section id="argentina" className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-950 to-black py-20">
      {/* Smooth transition from previous section */}
      <div className="absolute left-0 right-0 top-0 h-16 bg-gradient-to-b from-gray-900/80 to-transparent"></div>

      {/* Argentine flag colors as subtle background elements */}
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-blue-900/10 to-transparent opacity-30" />
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-900/10 to-transparent opacity-30" />
        <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400/5 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          {/* Content Side */}
          <div className="max-w-4xl space-y-8 text-center">
            <div className="space-y-4">
              <div className="relative inline-flex items-center gap-3 rounded-lg border border-blue-800/50 bg-blue-900/20 px-4 py-2 text-sm font-medium text-blue-300">
                <NeonBorders intensity={0.3} />
                <MapPin className="h-4 w-4" />
                <span>ORGULLO ARGENTINO</span>
              </div>

              <h2 className="text-4xl font-black leading-tight text-white lg:text-5xl">
                MEDIO SIGLO DE
                <span className="block bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-clip-text text-transparent">
                  INGENIERÍA ARGENTINA
                </span>
              </h2>

              <p className="text-lg leading-relaxed text-gray-300 lg:text-xl">
                Desde Buenos Aires hacia el mundo. KANSACO sigue desarrollando
                tecnología con la calidad y excelencia que nos caracterizan.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {argentineStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="mb-2 flex justify-center">
                    <stat.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="mb-1 text-2xl font-black text-white lg:text-3xl">
                    {stat.number}
                  </div>
                  <div className="text-xs text-gray-400 lg:text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span>Buenos Aires, Argentina</span>
              </div>
              <p className="text-sm text-gray-500">
                &ldquo;La calidad argentina que protege motores en todo el
                país&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Smooth transition to next section (Footer) */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-black"></div>
    </section>
  );
};

export default ArgentinaSection;
