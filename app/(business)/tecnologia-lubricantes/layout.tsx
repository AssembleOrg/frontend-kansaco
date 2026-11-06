import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Tecnología en lubricantes: cómo protege el aceite tu motor',
  description:
    'Cómo un lubricante reduce la fricción y el desgaste en el arranque, en marcha y con el motor detenido, y qué aditivos usa Kansaco en sus formulaciones.',
  path: '/tecnologia-lubricantes',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
