import type { Metadata } from 'next';
import './globals.css';

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
        {children}
      </body>
    </html>
  );
}
