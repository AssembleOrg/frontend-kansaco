'use client';

import { useState, FormEvent } from 'react';
import { Send } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

const PUESTOS = [
  'Ventas',
  'Almacén / Depósito',
  'Administración',
  'Reparto / Logística',
  'Producción',
  'Otro',
];

export default function WorkWithUsForm() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [puesto, setPuesto] = useState('');
  const [mensaje, setMensaje] = useState('');

  const isMobile =
    typeof window !== 'undefined' &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!nombre || !email || !puesto || !mensaje) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const asunto = `Postulación Laboral - ${puesto} - ${nombre}`;

    const cuerpo = `
Postulación Laboral - Kansaco

Nombre: ${nombre}
Email: ${email}
${telefono ? `Teléfono: ${telefono}` : ''}
Puesto de interés: ${puesto}

Presentación:
${mensaje}

---
Este email fue enviado desde el formulario "Trabajá con Nosotros" de Kansaco
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="nombre"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/50"
            placeholder="Tu nombre completo"
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/50"
            placeholder="tu@email.com"
            required
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="telefono"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Teléfono <span className="text-gray-500">(opcional)</span>
          </label>
          <input
            type="tel"
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/50"
            placeholder="+54 11 XXXX-XXXX"
          />
        </div>

        <div>
          <label
            htmlFor="puesto"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Puesto de interés <span className="text-red-500">*</span>
          </label>
          <select
            id="puesto"
            value={puesto}
            onChange={(e) => setPuesto(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/50"
            required
          >
            <option value="">Selecciona un área</option>
            {PUESTOS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="mensaje"
          className="mb-2 block text-sm font-medium text-gray-300"
        >
          Presentación breve <span className="text-red-500">*</span>
        </label>
        <textarea
          id="mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/50"
          placeholder="Contanos sobre tu experiencia, habilidades y por qué te gustaría sumarte al equipo..."
          required
        />
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#16a245] px-6 py-3 font-semibold text-white transition-all hover:bg-[#128a38] focus:outline-none focus:ring-2 focus:ring-[#16a245]/50"
      >
        <Send className="h-5 w-5" />
        Enviar Postulación
      </button>

      <p className="text-center text-sm text-yellow-400">
        Antes de enviar, adjuntá tu CV al correo que se abrirá.
      </p>
      <p className="text-center text-xs text-gray-400">
        Al hacer clic, se abrirá{' '}
        {isMobile ? 'tu app de correo' : 'Gmail en una nueva pestaña'} con los
        datos pre-llenados
      </p>
    </form>
  );
}
