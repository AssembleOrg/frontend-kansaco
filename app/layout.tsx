import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { siteConfig } from '@/lib/site-config';
// import { WhatsAppButton } from '@/components/landing/WhatsAppButton';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: siteConfig.brand.primaryColor,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://kansaco.com'),
  title: {
    default: 'Kansaco - Lubricantes y Aceites Industriales',
    template: '%s | Kansaco',
  },
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
  openGraph: {
    title: 'Kansaco - Lubricantes y Aceites Industriales',
    description: siteConfig.company.description,
    url: siteConfig.company.url,
    siteName: siteConfig.company.name,
    images: [
      {
        url: '/logo-kansaco.webp',
        width: 1200,
        height: 630,
        alt: 'Kansaco - Lubricantes y Aceites Industriales',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kansaco - Lubricantes y Aceites Industriales',
    description: siteConfig.company.description,
    images: ['/logo-kansaco.webp'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        {/* <WhatsAppButton /> */}
      </body>
    </html>
  );
}
