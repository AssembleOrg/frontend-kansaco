'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  onNavigate?: () => void;
  isMobile?: boolean;
}

export default function AdminSidebar({ onNavigate, isMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Órdenes',
      href: '/admin/orders',
      icon: ShoppingCart,
    },
    {
      label: 'Productos',
      href: '/admin/products',
      icon: Package,
    },
  ];

  const handleNavigation = () => {
    onNavigate?.();
  };

  return (
    <aside className={cn(
      "w-full flex-col border-gray-200 bg-white",
      isMobile ? "flex" : "hidden lg:flex lg:w-64 border-r shadow-sm"
    )}>
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 className="text-lg lg:text-xl font-bold text-gray-900">Kansaco Admin</h1>
      </div>

      <nav className="space-y-2 p-4 lg:p-6 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavigation}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
