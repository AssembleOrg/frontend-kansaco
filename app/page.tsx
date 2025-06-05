// 1. Verde principal: #16a245 (color de la marca)
// 2. Verde oscuro: #0d7a32 (para hover y elementos destacados)
// 3. Verde claro: #e6f5eb (para fondos, badges ligeros)
// 4. Gris neutro: #4a4a4a (para textos principales)
// 5. Acento complementario: #f7faf8 (para fondos alternos)

import Navbar from '@/components/landing/Navbar';
import HeroBanner from '@/components/landing/HeroBanner';
import CategoriesSection from '@/components/landing/CategoriesSection';
import TechnologySection from '@/components/landing/TechnologySection';
import ArgentinaSection from '@/components/landing/ArgentinaSection';
import FeaturedProducts from '@/components/landing/FeaturedProducts';
import Footer from '@/components/landing/Footer';
import ScrollAnimationSystem from '@/components/landing/ScrollAnimationSystem';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Unified Scroll Animation System */}
      <ScrollAnimationSystem />

      {/* Landing Page Sections */}
      <Navbar />
      <HeroBanner />
      <CategoriesSection />
      <TechnologySection />
      <FeaturedProducts />
      <ArgentinaSection />
      <Footer />
    </main>
    // <div className="flex h-screen flex-col items-center justify-center bg-[#f7faf8]">
    //   <div className="w-80 rounded-lg bg-white p-8 shadow-md">
    //     <h1 className="mb-6 text-center text-2xl font-bold text-[#4a4a4a]">
    //       KANSACO
    //     </h1>
    //     <div className="space-y-4">
    //       <Link href="/productos" className="block w-full">
    //         <Button className="w-full bg-[#16a245] text-white hover:bg-[#0d7a32]">
    //           Ir a Productos
    //         </Button>
    //       </Link>
    //       <Link href="/login" className="block w-full">
    //         <Button className="w-full bg-[#16a245] text-white hover:bg-[#0d7a32]">
    //           Ir a Login
    //         </Button>
    //       </Link>
    //       <Link href="/register" className="block w-full">
    //         <Button className="w-full bg-[#16a245] text-white hover:bg-[#0d7a32]">
    //           Ir a Register
    //         </Button>
    //       </Link>
    //     </div>
    //   </div>
    //   <p className="mt-4 text-sm text-[#4a4a4a]">Página de testeo - KANSACO</p>
    // </div>
  );
}
