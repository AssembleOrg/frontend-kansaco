'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import AdminSidebar from '@/features/admin/components/AdminSidebar';
import AdminHeader from '@/features/admin/components/AdminHeader';
import { canAccessAdminPath } from '@/features/admin/access';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { esStaff } from '@/types/auth';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, token, isAuthReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // El panel es para el staff (ADMIN y ASISTENTE). La asistente sólo entra a
  // las secciones que el backend le permite; si tipea otra URL, al dashboard.
  const puedeEntrar = esStaff(user?.rol);
  const puedeVerRuta = puedeEntrar && canAccessAdminPath(user?.rol, pathname);

  useEffect(() => {
    // Wait for auth to be ready
    if (!isAuthReady) {
      return;
    }

    if (!token || !user) {
      router.push('/login?redirect=/admin/dashboard');
      return;
    }

    if (!puedeEntrar) {
      // Un cliente no tiene nada que hacer acá: a la home.
      router.push('/');
      return;
    }

    if (!puedeVerRuta) {
      router.replace('/admin/dashboard');
    }
  }, [user, token, isAuthReady, router, puedeEntrar, puedeVerRuta]);

  // Show loading while checking auth
  if (!isAuthReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!token || !user || !puedeVerRuta) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen bg-gray-50 max-w-full overflow-x-hidden"
      style={{ fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, -apple-system, sans-serif' }}
    >
      {/* Sidebar Desktop */}
      <AdminSidebar />

      {/* Sidebar Mobile */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Menú de navegación</SheetTitle>
          </SheetHeader>
          <AdminSidebar
            onNavigate={() => setMobileMenuOpen(false)}
            isMobile={true}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 overflow-auto p-4 md:p-6 max-w-full">{children}</main>
      </div>
    </div>
  );
}
