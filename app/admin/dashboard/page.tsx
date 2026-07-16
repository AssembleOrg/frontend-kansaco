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
  LayoutDashboard,
  Percent,
  UserCheck,
} from 'lucide-react';

type Shortcut = {
  label: string;
  desc: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const SHORTCUTS: Shortcut[] = [
  { label: 'Órdenes', desc: 'Pedidos de clientes', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Productos', desc: 'Catálogo y precios', href: '/admin/products', icon: Package },
  { label: 'Categorías', desc: 'Organización', href: '/admin/categories', icon: Tag },
  { label: 'Imágenes', desc: 'Galería del catálogo', href: '/admin/images', icon: ImageIcon },
  { label: 'Listas de precios', desc: 'Recargo % por categoría', href: '/admin/pricing', icon: Percent },
  { label: 'Cuentas', desc: 'Aprobar y asignar rol', href: '/admin/users', icon: UserCheck },
  { label: 'Analytics', desc: 'Métricas y reportes', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Negocios', desc: 'Pipeline comercial', href: '/admin/negocios', icon: Briefcase },
  { label: 'Leads', desc: 'Contactos del CRM', href: '/admin/leads', icon: Users },
  { label: 'Vendedores', desc: 'Equipo comercial', href: '/admin/vendedores', icon: UserCog },
  { label: 'Pipeline', desc: 'Etapas y motivos', href: '/admin/configuracion/pipeline', icon: Settings },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <header>
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-neutral-400" />
          <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            Panel
          </span>
        </div>
        <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-neutral-900 sm:text-[26px]">
          Bienvenido a Kansaco Admin
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Acceso rápido a todas las secciones del panel.
        </p>
      </header>

      <section
        aria-label="Atajos"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
      >
        {SHORTCUTS.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="group flex h-full flex-col gap-2 rounded-xl border border-neutral-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:border-green-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] sm:p-5"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 ring-1 ring-green-100 transition-colors group-hover:bg-green-100">
                <Icon className="h-[18px] w-[18px] text-green-700" />
              </span>
              <div className="mt-1">
                <p className="text-[15px] font-semibold tracking-tight text-neutral-900">
                  {s.label}
                </p>
                <p className="mt-0.5 truncate text-[12px] text-neutral-500">
                  {s.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
