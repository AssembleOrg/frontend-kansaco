'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import AdminSidebar from '@/features/admin/components/AdminSidebar';
import AdminHeader from '@/features/admin/components/AdminHeader';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, token, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to be ready
    if (!isAuthReady) {
      return;
    }

    // Check if user is authenticated and is admin
    if (!token || !user) {
      router.push('/login?redirect=/admin/dashboard');
      return;
    }

    if (user.rol !== 'ADMIN') {
      // User is not admin, redirect to home
      router.push('/');
      return;
    }
  }, [user, token, isAuthReady, router]);

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
  if (!token || !user || user.rol !== 'ADMIN') {
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <AdminSidebar />

      {/* Sidebar Mobile */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <AdminSidebar
            onNavigate={() => setMobileMenuOpen(false)}
            isMobile={true}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <AdminHeader onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
