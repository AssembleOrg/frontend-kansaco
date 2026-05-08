'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Image,
  Tag,
  BarChart3,
  Briefcase,
  Users,
  UserCog,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  onNavigate?: () => void;
  isMobile?: boolean;
}

type NavGroup = {
  label: string;
  items: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'General',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { label: 'Productos', href: '/admin/products', icon: Package },
      { label: 'Categorías', href: '/admin/categories', icon: Tag },
      { label: 'Imágenes', href: '/admin/images', icon: Image },
    ],
  },
  {
    label: 'Ventas',
    items: [
      { label: 'Órdenes', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'CRM',
    items: [
      { label: 'Negocios', href: '/admin/negocios', icon: Briefcase },
      { label: 'Leads', href: '/admin/leads', icon: Users },
      { label: 'Vendedores', href: '/admin/vendedores', icon: UserCog },
      { label: 'Pipeline', href: '/admin/configuracion/pipeline', icon: Settings },
    ],
  },
];

export default function AdminSidebar({ onNavigate, isMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  const handleNavigation = () => {
    onNavigate?.();
  };

  return (
    <aside
      className={cn(
        'w-full flex-col bg-white',
        isMobile ? 'flex' : 'hidden lg:flex lg:w-64 border-r border-neutral-200/70 shadow-sm'
      )}
    >
      <div className="flex h-16 items-center border-b border-neutral-200/70 px-6">
        <h1 className="text-lg font-semibold tracking-tight text-neutral-900 lg:text-xl">
          Kansaco Admin
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 lg:px-4 lg:py-5">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} className={cn(gi > 0 && 'mt-5')}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-green-700">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={handleNavigation}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-green-50 text-green-700'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                      )}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
