import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Kancore: grasa lubricante de alta performance',
  description:
    'Kancore, la grasa premium de Kansaco: sulfonato de calcio complejo, alta performance y resistencia al agua para rodamientos, maquinaria agrícola e industria.',
  path: '/kancore',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
