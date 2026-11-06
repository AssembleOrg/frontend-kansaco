import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import Script from 'next/script';
import { siteConfig } from '@/lib/site-config';
import { SITE_URL, jsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo';
// import { WhatsAppButton } from '@/components/landing/WhatsAppButton';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Sólo en el sitio real: en local y previews no ensucia las métricas.
const GA_ID =
  process.env.NODE_ENV === 'production' && /^G-[A-Z0-9]{6,}$/.test(siteConfig.analytics.ga4Id)
    ? siteConfig.analytics.ga4Id
    : null;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: siteConfig.brand.primaryColor,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Kansaco | Lubricantes y aceites fabricados en Argentina',
    template: '%s | Kansaco',
  },
  description: siteConfig.company.description,
  applicationName: siteConfig.company.name,
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
    title: 'Kansaco | Lubricantes y aceites fabricados en Argentina',
    description: siteConfig.company.description,
    url: siteConfig.company.url,
    siteName: siteConfig.company.name,
    images: [
      {
        url: '/logo-kansaco.webp',
        width: 1200,
        height: 630,
        alt: 'Kansaco | Lubricantes y aceites fabricados en Argentina',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kansaco | Lubricantes y aceites fabricados en Argentina',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd([organizationJsonLd(), websiteJsonLd()]),
          }}
        />
        {children}
        <Toaster />
        {/* <WhatsAppButton /> */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
