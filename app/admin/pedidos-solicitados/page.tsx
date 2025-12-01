'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminOrdersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la vista de órdenes del admin
    router.replace('/admin/orders');
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center mt-20">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <p className="text-xl text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
}
