'use client';

import Link from 'next/link';
import {
  ShoppingCart,
  Package,
  Tag,
  Image as ImageIcon,
  BarChart3,
  Briefcase,
  Users,
  UserCog,
  Settings,
  Percent,
  UserCheck,
  Inbox,
} from 'lucide-react';
import { useNoLeidas } from '@/features/submissions/hooks/useNoLeidas';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { canAccessAdminPath } from '@/features/admin/access';
import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  desc: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

/**
 * Accesos del panel, ordenados por categoría.
 *
 * Sin rótulos de grupo a propósito: como título propio no entran sin scroll
 * (672px contra 522 disponibles en 375×667), y como chips inline caían a mitad
 * de fila, lejos del item que nombraban. El orden mantiene juntos los accesos
 * de cada área y el `AdminSidebar` ya muestra las categorías.
 */
const ITEMS: NavItem[] = [
  { label: 'Solicitudes', desc: 'Formularios del sitio', href: '/admin/solicitudes', icon: Inbox },
  { label: 'Órdenes', desc: 'Pedidos de clientes', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Analytics', desc: 'Métricas y reportes', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Productos', desc: 'Catálogo y precios', href: '/admin/products', icon: Package },
  { label: 'Categorías', desc: 'Organización', href: '/admin/categories', icon: Tag },
  { label: 'Imágenes', desc: 'Galería del catálogo', href: '/admin/images', icon: ImageIcon },
  { label: 'Precios', desc: 'Recargo % por categoría', href: '/admin/pricing', icon: Percent },
  { label: 'Cuentas', desc: 'Aprobar y asignar rol', href: '/admin/users', icon: UserCheck },
  { label: 'Negocios', desc: 'Pipeline comercial', href: '/admin/negocios', icon: Briefcase },
  { label: 'Leads', desc: 'Contactos del CRM', href: '/admin/leads', icon: Users },
  { label: 'Vendedores', desc: 'Equipo comercial', href: '/admin/vendedores', icon: UserCog },
  { label: 'Pipeline', desc: 'Etapas y motivos', href: '/admin/configuracion/pipeline', icon: Settings },
];

export default function AdminDashboard() {
  const { noLeidas } = useNoLeidas();
  const { user } = useAuth();
  // Sólo los accesos que el rol puede usar (la asistente ve menos).
  const items = ITEMS.filter((item) => canAccessAdminPath(user?.rol, item.href));

  return (
    // Alto acotado al viewport descontando el AdminHeader y el padding del main
    // (93px mobile / 129px desktop). Mismo patrón que `app/admin/negocios`.
    // `dvh` contempla la barra de URL de iOS, que cambia de alto al scrollear.
    <div className="flex h-[calc(100dvh-93px)] flex-col overflow-hidden md:h-[calc(100dvh-129px)]">
      <header className="shrink-0">
        <h1 className="text-[17px] font-semibold tracking-tight text-neutral-900 sm:text-[22px]">
          Kansaco Admin
        </h1>
        <p className="text-[11px] text-neutral-500 sm:text-sm">
          Gestión del catálogo, ventas y CRM.
        </p>
      </header>

      {/*
        `flex-wrap` y no `grid`: con `flex-1` los items de la última fila
        estiran para llenar el ancho en vez de dejar un hueco a la derecha.
      */}
      <div className="mt-3 flex min-h-0 flex-1 flex-wrap content-start gap-3 sm:mt-4 sm:gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          const badge =
            item.href === '/admin/solicitudes' && noLeidas > 0 ? noLeidas : null;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.desc}
              className={cn(
                'group relative flex min-h-[104px] flex-1 basis-[calc(33.333%-8px)] flex-col items-center justify-center gap-2 rounded-xl border bg-white p-3 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all',
                'sm:min-h-[128px] sm:basis-[170px] sm:gap-2.5 sm:p-4 lg:min-h-[136px]',
                'hover:border-green-200 hover:bg-green-50/50 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40',
                badge ? 'border-green-200' : 'border-neutral-200/70',
              )}
            >
              {badge !== null && (
                <span
                  aria-label={`${badge} sin leer`}
                  className="absolute right-2 top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-green-600 px-1.5 text-[11px] font-semibold text-white"
                >
                  {badge > 99 ? '99+' : badge}
                </span>
              )}

              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 ring-1 ring-neutral-200/70 transition-colors group-hover:bg-white group-hover:ring-green-200 sm:h-12 sm:w-12">
                <Icon className="h-5 w-5 text-neutral-600 transition-colors group-hover:text-green-700 sm:h-6 sm:w-6" />
              </span>

              <div className="w-full min-w-0">
                <p className="truncate text-[12px] font-medium leading-tight text-neutral-800 group-hover:text-green-800 sm:text-[14px]">
                  {item.label}
                </p>
                {/* La descripción sólo desde sm: en mobile el nombre alcanza. */}
                <p className="mt-0.5 hidden truncate text-[11px] text-neutral-400 sm:block">
                  {item.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
