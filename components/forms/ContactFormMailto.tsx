'use client';

import { useState, FormEvent } from 'react';
import { Mail } from 'lucide-react';

export default function ContactFormMailto() {
  const [formType, setFormType] = useState<'mayorista' | 'proveedor' | ''>('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Detectar si es móvil
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!formType || !nombre || !email) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Construir el asunto y cuerpo del email
    const tipoTexto = formType === 'mayorista' ? 'Mayorista' : 'Proveedor';
    const asunto = `Solicitud de ${tipoTexto} - ${nombre}`;

    const cuerpo = `
Tipo: Quiero ser ${tipoTexto}

Nombre: ${nombre}
Email: ${email}

${mensaje ? `Mensaje:\n${mensaje}` : ''}

---
Este email fue enviado desde el formulario de contacto de Kansaco
    `.trim();

    const emailDestino = 'info@kansaco.com';

    if (isMobile) {
      // En móvil: usar mailto (funciona mejor con apps nativas)
      const mailtoLink = `mailto:${emailDestino}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
      window.location.href = mailtoLink;
    } else {
      // En desktop: usar Gmail URL (funciona mejor en navegador)
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailDestino)}&su=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
      window.open(gmailUrl, '_blank');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dropdown de tipo */}
      <div>
        <label htmlFor="formType" className="block text-sm font-medium text-gray-300 mb-2">
          Tipo de solicitud <span className="text-red-500">*</span>
        </label>
        <select
          id="formType"
          value={formType}
          onChange={(e) => setFormType(e.target.value as 'mayorista' | 'proveedor' | '')}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/50"
          required
        >
          <option value="">Selecciona una opción</option>
          <option value="mayorista">Quiero ser Mayorista</option>
          <option value="proveedor">Quiero ser Proveedor</option>
        </select>
      </div>

      {/* Campo Nombre */}
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2">
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

      {/* Campo Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
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

      {/* Campo Mensaje */}
      <div>
        <label htmlFor="mensaje" className="block text-sm font-medium text-gray-300 mb-2">
          Mensaje (opcional)
        </label>
        <textarea
          id="mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/50"
          placeholder="Cuéntanos más sobre tu interés..."
        />
      </div>

      {/* Botón Submit */}
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#16a245] px-6 py-3 text-white font-semibold transition-all hover:bg-[#128a38] focus:outline-none focus:ring-2 focus:ring-[#16a245]/50"
      >
        <Mail className="h-5 w-5" />
        Enviar Consulta
      </button>

      <p className="text-xs text-center text-gray-400">
        Al hacer clic, se abrirá {isMobile ? 'tu app de correo' : 'Gmail en una nueva pestaña'} con los datos pre-llenados
      </p>
    </form>
  );
}
