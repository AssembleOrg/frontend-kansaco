// 1. Verde principal: #16a245 (color de la marca)
// 2. Verde oscuro: #0d7a32 (para hover y elementos destacados)
// 3. Verde claro: #e6f5eb (para fondos, badges ligeros)
// 4. Gris neutro: #4a4a4a (para textos principales)
// 5. Acento complementario: #f7faf8 (para fondos alternos)

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/landing/Navbar';
import HeroBanner from '@/components/landing/HeroBanner';
import LaEmpresaSection from '@/components/landing/LaEmpresaSection';
import {
  CategoriesSkeleton,
  TechnologySkeleton,
  FeaturedProductsSkeleton,
  ArgentinaSkeleton,
  FooterSkeleton,
} from '@/components/landing/skeletons';

// Below-the-fold: difiero el chunk hasta que el usuario scrollea (Suspense
// muestra el skeleton mientras carga). Cada uno arrastra framer-motion
// y/o assets propios, así reducimos el bundle inicial de la home.
const CategoriesSection = dynamic(
  () => import('@/components/landing/CategoriesSection'),
);
const TechnologySection = dynamic(
  () => import('@/components/landing/TechnologySection'),
);
const FeaturedProducts = dynamic(
  () => import('@/components/landing/FeaturedProducts'),
);
const ArgentinaSection = dynamic(
  () => import('@/components/landing/ArgentinaSection'),
);
const LubriExpertoCTA = dynamic(
  () => import('@/components/landing/LubriExpertoCTA'),
);
const Footer = dynamic(() => import('@/components/landing/Footer'));
// Solo aparece tras scrollear → no necesita SSR.
const FloatingScrollTop = dynamic(
  () =>
    import('@/components/landing/FloatingScrollTop').then(
      (mod) => mod.FloatingScrollTop,
    ),
  { ssr: false },
);

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroBanner />
      <LaEmpresaSection />

      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesSection />
      </Suspense>

      <Suspense fallback={<TechnologySkeleton />}>
        <TechnologySection />
      </Suspense>

      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>

      <Suspense fallback={<ArgentinaSkeleton />}>
        <ArgentinaSection />
      </Suspense>

      <LubriExpertoCTA />

      <Suspense fallback={<FooterSkeleton />}>
        <Footer />
      </Suspense>

      <FloatingScrollTop />
    </main>
  );
}
