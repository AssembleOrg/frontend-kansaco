import ProductLinesSection from '@/components/landing/ProductLinesSection';
import Footer from '@/components/landing/Footer';
import BackToHomeButton from '@/components/ui/BackToHomeButton';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Líneas de lubricantes y aceites',
  description:
    'Todas las líneas de lubricantes Kansaco: sintética, mineral, premium, diésel heavy duty, agro, competición, motos, náutica, industrial, caja y diferencial, grasas y aditivos.',
  path: '/lineas-de-productos',
});

export default function LineasDeProductosPage() {
  return (
    <main className="min-h-screen bg-black">
      <ProductLinesSection />
      <Footer />
      <BackToHomeButton />
    </main>
  );
} 