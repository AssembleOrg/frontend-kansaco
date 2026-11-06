import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Productos: aceites, lubricantes y grasas',
  description:
    'Catálogo completo de Kansaco: aceites para motor nafta y diésel, caja y diferencial, motos, agro, náutica, industria, grasas y aditivos. Fabricados en Argentina.',
  path: '/productos',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
