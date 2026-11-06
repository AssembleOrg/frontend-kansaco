import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Sobre nosotros: fabricantes de lubricantes desde hace más de 50 años',
  description:
    'Kansaco Petroquímica es una empresa familiar argentina que fabrica lubricantes, aceites y grasas en Florencio Varela, Buenos Aires, desde hace más de medio siglo.',
  path: '/sobre-nosotros',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
