import Link from 'next/link';
import { Bot, ArrowRight } from 'lucide-react';

export default function LubriExpertoCTA() {
  return (
    <section className="relative bg-black py-16">
      <div className="relative mx-auto max-w-4xl px-4">
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-10 text-center backdrop-blur-sm md:flex-row md:text-left">
          {/* Ícono */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#16a245]/15 text-[#16a245]">
            <Bot className="h-8 w-8" />
          </div>

          {/* Texto */}
          <div className="flex-1">
            <span className="mb-1 inline-block text-xs font-semibold uppercase tracking-widest text-[#16a245]">
              Lubri Experto
            </span>
            <h3 className="mb-2 text-2xl font-bold text-white">
              ¿No sabés qué producto necesitás?
            </h3>
            <p className="text-gray-400">
              Contanos tu vehículo o equipo y nuestro equipo te recomienda el
              lubricante exacto.
            </p>
          </div>

          {/* CTA */}
          <Link
            href="/lubri-experto"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#16a245] px-6 py-3 font-semibold text-white transition-all hover:bg-[#0d7a32]"
          >
            Consultar ahora
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
