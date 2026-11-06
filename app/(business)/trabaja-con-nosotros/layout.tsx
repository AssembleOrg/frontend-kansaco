import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Trabajá con nosotros',
  description:
    'Sumate al equipo de Kansaco, empresa familiar argentina fabricante de lubricantes en Florencio Varela. Dejanos tus datos y tu CV.',
  path: '/trabaja-con-nosotros',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
