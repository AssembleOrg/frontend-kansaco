// useCartStore
import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackToHomeButton from '@/components/ui/BackToHomeButton';

export default function CartPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="bg-white min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Carrito de Compras</h1>
          <p className="text-gray-600">Página en desarrollo</p>
        </div>
      </main>
      <Footer />
      <BackToHomeButton />
    </div>
  );
}
