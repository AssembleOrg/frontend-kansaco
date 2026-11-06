import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Contacto',
  description:
    'Escribinos o llamanos: Magallanes 2051, Florencio Varela, Buenos Aires. Tel. 4237-2636, info@kansaco.com. Lunes a viernes de 9 a 17 h.',
  path: '/contacto',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
