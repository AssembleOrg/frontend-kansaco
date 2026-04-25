// 1. Verde principal: #16a245 (color de la marca)
// 2. Verde oscuro: #0d7a32 (para hover y elementos destacados)
// 3. Verde claro: #e6f5eb (para fondos, badges ligeros)
// 4. Gris neutro: #4a4a4a (para textos principales)
// 5. Acento complementario: #f7faf8 (para fondos alternos)

import { Suspense } from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroBanner from '@/components/landing/HeroBanner';
import LaEmpresaSection from '@/components/landing/LaEmpresaSection';
import CategoriesSection from '@/components/landing/CategoriesSection';
import TechnologySection from '@/components/landing/TechnologySection';
import FeaturedProducts from '@/components/landing/FeaturedProducts';
import LubriExpertoCTA from '@/components/landing/LubriExpertoCTA';
import ArgentinaSection from '@/components/landing/ArgentinaSection';
import Footer from '@/components/landing/Footer';
import { FloatingScrollTop } from '@/components/landing/FloatingScrollTop';
import {
  CategoriesSkeleton,
  TechnologySkeleton,
  FeaturedProductsSkeleton,
  ArgentinaSkeleton,
  FooterSkeleton,
} from '@/components/landing/skeletons';

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
