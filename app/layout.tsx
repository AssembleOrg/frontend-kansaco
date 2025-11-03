import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kansaco',
  description:
    'Kansaco - Plataforma ecommerce. Productos dirigidos a los sistemas de lubricación',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
