// 1. Verde principal: #16a245 (color de la marca)
// 2. Verde oscuro: #0d7a32 (para hover y elementos destacados)
// 3. Verde claro: #e6f5eb (para fondos, badges ligeros)
// 4. Gris neutro: #4a4a4a (para textos principales)
// 5. Acento complementario: #f7faf8 (para fondos alternos)

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#f7faf8]">
      <div className="w-80 rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-[#4a4a4a]">
          KANSACO
        </h1>
        <div className="space-y-4">
          <Link href="/productos" className="block w-full">
            <Button className="w-full bg-[#16a245] text-white hover:bg-[#0d7a32]">
              Ir a Productos
            </Button>
          </Link>
          <Link href="/login" className="block w-full">
            <Button className="w-full bg-[#16a245] text-white hover:bg-[#0d7a32]">
              Ir a Login
            </Button>
          </Link>
          <Link href="/register" className="block w-full">
            <Button className="w-full bg-[#16a245] text-white hover:bg-[#0d7a32]">
              Ir a Register
            </Button>
          </Link>
        </div>
      </div>
      <p className="mt-4 text-sm text-[#4a4a4a]">Página de testeo - KANSACO</p>
    </div>
  );
}
