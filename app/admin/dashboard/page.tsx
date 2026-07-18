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
  TrendingUp,
} from 'lucide-react';

type NavItem = {
  label: string;
  desc: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type Group = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
};

const GROUPS: Group[] = [
  {
    label: 'Ventas',
    icon: TrendingUp,
    items: [
      { label: 'Órdenes', desc: 'Pedidos de clientes', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Analytics', desc: 'Métricas y reportes', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Catálogo',
    icon: Package,
    items: [
      { label: 'Productos', desc: 'Catálogo y precios', href: '/admin/products', icon: Package },
      { label: 'Categorías', desc: 'Organización', href: '/admin/categories', icon: Tag },
      { label: 'Imágenes', desc: 'Galería del catálogo', href: '/admin/images', icon: ImageIcon },
      { label: 'Listas de precios', desc: 'Recargo % por categoría', href: '/admin/pricing', icon: Percent },
    ],
  },
  {
    label: 'Usuarios',
    icon: UserCheck,
    items: [
      { label: 'Cuentas', desc: 'Aprobar y asignar rol', href: '/admin/users', icon: UserCheck },
    ],
  },
  {
    label: 'CRM',
    icon: Briefcase,
    items: [
      { label: 'Negocios', desc: 'Pipeline comercial', href: '/admin/negocios', icon: Briefcase },
      { label: 'Leads', desc: 'Contactos del CRM', href: '/admin/leads', icon: Users },
      { label: 'Vendedores', desc: 'Equipo comercial', href: '/admin/vendedores', icon: UserCog },
      { label: 'Pipeline', desc: 'Etapas y motivos', href: '/admin/configuracion/pipeline', icon: Settings },
    ],
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-[20px] font-semibold tracking-tight text-neutral-900 sm:text-[22px]">
          Kansaco Admin
        </h1>
        <p className="text-sm text-neutral-500">
          Gestión del catálogo, ventas y CRM.
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
        {GROUPS.map((group) => {
          const GroupIcon = group.icon;
          return (
            <section
              key={group.label}
              aria-label={group.label}
              className="rounded-xl border border-neutral-200/70 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center gap-2 border-b border-neutral-200/70 px-1 pb-2.5">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-green-50 ring-1 ring-green-100">
                  <GroupIcon className="h-4 w-4 text-green-700" />
                </span>
                <h2 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                  {group.label}
                </h2>
              </div>

              <ul className="mt-2 space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-green-50"
                      >
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 ring-1 ring-neutral-200/70 transition-colors group-hover:bg-white group-hover:ring-green-200">
                          <Icon className="h-4 w-4 text-neutral-600 transition-colors group-hover:text-green-700" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-neutral-800 group-hover:text-green-800">
                            {item.label}
                          </p>
                          <p className="truncate text-[11px] text-neutral-400">
                            {item.desc}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
