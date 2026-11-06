import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Política de privacidad',
  description:
    'Cómo Kansaco trata los datos personales de clientes y visitantes del sitio.',
  path: '/privacidad',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
