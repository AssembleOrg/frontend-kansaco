'use client';

import Link from 'next/link';
import { Home, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  onMenuToggle?: () => void;
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-base md:text-lg font-semibold text-gray-900">
              Panel Administrativo
            </h2>
            <p className="hidden sm:block text-xs md:text-sm text-gray-500">
              Gestión de órdenes y productos
            </p>
          </div>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-2 text-xs md:text-sm">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Volver al Inicio</span>
            <span className="sm:hidden">Inicio</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
