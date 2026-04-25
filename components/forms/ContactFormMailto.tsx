'use client';

import { useState, FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

type AfipSituacion =
  | ''
  | 'No inscripto'
  | 'Monotributista'
  | 'Responsable Inscripto'
  | 'Persona Jurídica';

export default function ContactFormMailto() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [cuit, setCuit] = useState('');
  const [domicilio, setDomicilio] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [telefono, setTelefono] = useState('');
  const [zonaDistribucion, setZonaDistribucion] = useState('');
  const [afip, setAfip] = useState<AfipSituacion>('');
  const [mensaje, setMensaje] = useState('');

  const isMobile =
    typeof window !== 'undefined' &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!nombre || !email || !afip) {
      alert('Por favor completá los campos obligatorios: nombre, email y situación ante AFIP');
      return;
    }

    const asunto = `Solicitud de Mayorista - ${nombre}`;

    const cuerpo = `
Nombre: ${nombre}
Email: ${email}
CUIT: ${cuit || 'No especificado'}
Domicilio: ${domicilio || 'No especificado'}
Código Postal: ${codigoPostal || 'No especificado'}
Teléfono: ${telefono || 'No especificado'}
Zona de distribución: ${zonaDistribucion || 'No especificada'}
Situación ante AFIP: ${afip}

${mensaje ? `Información adicional / Carta de presentación:\n${mensaje}` : ''}

---
Este email fue enviado desde el formulario de contacto de Kansaco
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
    'w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/50';
  const labelClass = 'mb-2 block text-sm font-medium text-gray-300';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre */}
      <div>
        <label htmlFor="nombre" className={labelClass}>
          Tu nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={inputClass}
          placeholder="Nombre completo o razón social"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClass}>
          Tu correo electrónico <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="tu@email.com"
          required
        />
      </div>

      {/* CUIT */}
      <div>
        <label htmlFor="cuit" className={labelClass}>
          Tu CUIT
        </label>
        <input
          type="text"
          id="cuit"
          value={cuit}
          onChange={(e) => setCuit(e.target.value)}
          className={inputClass}
          placeholder="XX-XXXXXXXX-X"
        />
      </div>

      {/* Domicilio */}
      <div>
        <label htmlFor="domicilio" className={labelClass}>
          Domicilio completo (Localidad y Provincia)
        </label>
        <input
          type="text"
          id="domicilio"
          value={domicilio}
          onChange={(e) => setDomicilio(e.target.value)}
          className={inputClass}
          placeholder="Calle 123, Ciudad, Provincia"
        />
      </div>

      {/* Código Postal */}
      <div>
        <label htmlFor="codigoPostal" className={labelClass}>
          Código Postal
        </label>
        <input
          type="text"
          id="codigoPostal"
          value={codigoPostal}
          onChange={(e) => setCodigoPostal(e.target.value)}
          className={inputClass}
          placeholder="XXXX"
        />
      </div>

      {/* Teléfono */}
      <div>
        <label htmlFor="telefono" className={labelClass}>
          Teléfono
        </label>
        <input
          type="tel"
          id="telefono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className={inputClass}
          placeholder="+54 9 11 XXXX-XXXX"
        />
      </div>

      {/* Zona de distribución */}
      <div>
        <label htmlFor="zonaDistribucion" className={labelClass}>
          Zona de distribución
        </label>
        <input
          type="text"
          id="zonaDistribucion"
          value={zonaDistribucion}
          onChange={(e) => setZonaDistribucion(e.target.value)}
          className={inputClass}
          placeholder="Ej: GBA Norte, Córdoba Capital, etc."
        />
      </div>

      {/* Situación ante AFIP */}
      <div>
        <label htmlFor="afip" className={labelClass}>
          Situación ante AFIP <span className="text-red-500">*</span>
        </label>
        <select
          id="afip"
          value={afip}
          onChange={(e) => setAfip(e.target.value as AfipSituacion)}
          className={inputClass}
          required
        >
          <option value="">Seleccioná una opción</option>
          <option value="No inscripto">No inscripto</option>
          <option value="Monotributista">Monotributista</option>
          <option value="Responsable Inscripto">Responsable Inscripto</option>
          <option value="Persona Jurídica">Persona Jurídica</option>
        </select>
      </div>

      {/* Información adicional */}
      <div>
        <label htmlFor="mensaje" className={labelClass}>
          Información adicional o carta de presentación
        </label>
        <textarea
          id="mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={5}
          className={inputClass}
          placeholder="Contanos sobre tu negocio, qué productos te interesan, tu experiencia en el rubro..."
        />
      </div>

      {/* Botón Submit */}
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#16a245] px-6 py-3 font-semibold text-white transition-all hover:bg-[#128a38] focus:outline-none focus:ring-2 focus:ring-[#16a245]/50"
      >
        <Mail className="h-5 w-5" />
        Enviar Consulta
      </button>

      <p className="text-center text-xs text-gray-400">
        Al hacer clic, se abrirá{' '}
        {isMobile ? 'tu app de correo' : 'Gmail en una nueva pestaña'} con los
        datos pre-llenados
      </p>
    </form>
  );
}
