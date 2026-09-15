import ProductLinesSection from '@/components/landing/ProductLinesSection';
import Footer from '@/components/landing/Footer';
import BackToHomeButton from '@/components/ui/BackToHomeButton';

export default function LineasDeProductosPage() {
  return (
    <main className="min-h-screen bg-black">
      <ProductLinesSection />
      <Footer />
      <BackToHomeButton />
    </main>
  );
} 