'use client';

import ProductLinesSection from '@/components/landing/ProductLinesSection';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackToHomeButton from '@/components/ui/BackToHomeButton';

export default function LineasDeProductosPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <ProductLinesSection />
      <Footer />
      <BackToHomeButton />
    </main>
  );
} 