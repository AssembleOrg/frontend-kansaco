import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Términos y condiciones',
  description:
    'Condiciones de uso del sitio y de compra en la tienda online de Kansaco.',
  path: '/terminos-y-condiciones',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
