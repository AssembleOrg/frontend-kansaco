import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/features/cart/providers/CartProvider';

export const metadata: Metadata = {
  title: 'Kansaco',
  description:
    'Plataforma de compra online para productos de limpieza industrial',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
