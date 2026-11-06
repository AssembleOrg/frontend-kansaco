import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Venta mayorista y distribuidores de lubricantes',
  description:
    'Sumate a la red de distribuidores de Kansaco: precios mayoristas en aceites, lubricantes y grasas fabricados en Argentina. Completá la solicitud.',
  path: '/mayorista',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
