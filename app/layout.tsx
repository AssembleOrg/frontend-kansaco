import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { siteConfig } from '@/lib/site-config';
import { WhatsAppButton } from '@/components/landing/WhatsAppButton';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: siteConfig.brand.primaryColor,
};

export const metadata: Metadata = {
  title: siteConfig.company.name,
  description: siteConfig.company.description,
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.ico', sizes: '48x48' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
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
        <Toaster />
        <WhatsAppButton />
      </body>
    </html>
  );
}
