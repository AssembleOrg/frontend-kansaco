'use client';

import { useState, FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

export default function LubriExpertoForm() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [vehiculo, setVehiculo] = useState('');
  const [consulta, setConsulta] = useState('');

  const isMobile =
    typeof window !== 'undefined' &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!nombre || !email || !consulta) {
      alert('Por favor completá tu nombre, email y la consulta');
      return;
    }

    const asunto = `Lubri Experto - ${nombre}`;
    const cuerpo = `
Nombre: ${nombre}
Email: ${email}
${vehiculo ? `Vehículo / Equipo: ${vehiculo}\n` : ''}
Consulta:
${consulta}

---
Consulta enviada desde Lubri Experto - Kansaco
    `.trim();

    const emailDestino = siteConfig.contact.email;

    if (isMobile) {
      const mailtoLink = `mailto:${emailDestino}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
      window.location.href = mailtoLink;
    } else {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailDestino)}&su=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
      try {
        window.open(gmailUrl, '_blank', 'noopener,noreferrer');
      } catch {
        const mailtoLink = `mailto:${emailDestino}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
        window.location.href = mailtoLink;
      }
    }
  };

  const inputClass =
    'w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/50 transition-colors';
  const labelClass = 'mb-2 block text-sm font-medium text-gray-300';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="le-nombre" className={labelClass}>
            Tu nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="le-nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={inputClass}
            placeholder="Juan García"
            required
          />
        </div>

        <div>
          <label htmlFor="le-email" className={labelClass}>
            Tu correo electrónico <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="le-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="tu@email.com"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="le-vehiculo" className={labelClass}>
          Vehículo o equipo
        </label>
        <input
          type="text"
          id="le-vehiculo"
          value={vehiculo}
          onChange={(e) => setVehiculo(e.target.value)}
          className={inputClass}
          placeholder="Ej: Honda CB 190, Renault Kangoo 1.6, compresor industrial..."
        />
      </div>

      <div>
        <label htmlFor="le-consulta" className={labelClass}>
          ¿Qué necesitás? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="le-consulta"
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          rows={5}
          className={inputClass}
          placeholder="Ej: Necesito un aceite para mi moto de uso urbano, hago unos 50 km diarios por ciudad..."
          required
        />
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#16a245] px-6 py-3 font-semibold text-white transition-all hover:bg-[#0d7a32] focus:outline-none focus:ring-2 focus:ring-[#16a245]/50"
      >
        <Mail className="h-5 w-5" />
        Enviar consulta
      </button>

      <p className="text-center text-xs text-gray-500">
        Al hacer clic, se abrirá{' '}
        {isMobile ? 'tu app de correo' : 'Gmail en una nueva pestaña'} con los
        datos pre-llenados
      </p>
    </form>
  );
}
