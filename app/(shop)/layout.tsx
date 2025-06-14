import { CartProvider } from '@/features/cart/providers/CartProvider';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 bg-gray-50">
          {children}
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
