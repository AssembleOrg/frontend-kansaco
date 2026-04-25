import { Bot } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackToHomeButton from '@/components/ui/BackToHomeButton';
import LubriExpertoForm from '@/components/forms/LubriExpertoForm';

export const metadata = {
  title: 'Lubri Experto | Kansaco',
  description:
    'Contanos qué vehículo o equipo tenés y te recomendamos el lubricante exacto.',
};

export default function LubriExpertoPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-black via-gray-950 to-gray-900 pt-14 md:pt-20">
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(22, 162, 69, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(22, 162, 69, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-10 md:py-20 text-center">
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#16a245]/30 bg-[#16a245]/10 px-4 py-1.5 text-sm font-medium text-[#16a245]">
              <Bot className="h-4 w-4" />
              Asesoramiento técnico
            </span>
          </div>
          <h1 className="mb-4 text-5xl font-bold text-white md:text-6xl">
            Lubri{' '}
            <span className="bg-gradient-to-r from-[#16a245] to-[#0d7a32] bg-clip-text text-transparent">
              Experto
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-gray-400">
            Contanos qué necesitás y te recomendamos el producto exacto para tu
            vehículo o equipo.
          </p>
        </div>
      </section>

      {/* Formulario */}
      <section className="bg-gray-900 py-10 md:py-16">
        <div className="mx-auto max-w-2xl px-4">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
            <LubriExpertoForm />
          </div>
        </div>
      </section>

      <Footer />
      <BackToHomeButton />
    </div>
  );
}
