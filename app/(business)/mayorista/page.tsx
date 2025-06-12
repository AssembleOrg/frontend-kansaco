'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Upload, CheckCircle, Building, Users, FileText, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackToHomeButton from '@/components/ui/BackToHomeButton';

export default function MayoristaPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    cuit: '',
    domicilio: '',
    codigoPostal: '',
    telefono: '',
    zonaDistribucion: '',
    situacionAfip: '',
    informacionAdicional: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const situacionesAfip = [
    'No Inscripto',
    'Monotributista',
    'Responsable Inscripto',
    'Persona Jurídica'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Preparar datos para EmailJS
      const templateParams = {
        to_email: 'info@kansaco.com',
        from_name: formData.nombre,
        from_email: formData.email,
        cuit: formData.cuit,
        domicilio: formData.domicilio,
        codigo_postal: formData.codigoPostal,
        telefono: formData.telefono,
        zona_distribucion: formData.zonaDistribucion,
        situacion_afip: formData.situacionAfip,
        informacion_adicional: formData.informacionAdicional,
        archivo_adjunto: selectedFile ? selectedFile.name : 'No se adjuntó archivo',
        fecha: new Date().toLocaleDateString('es-AR'),
        subject: `Nueva solicitud de mayorista - ${formData.nombre}`
      };

      // TODO: Implementar EmailJS cuando tengas las credenciales
      // await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_PUBLIC_KEY');
      console.log('Datos del formulario mayorista:', templateParams);
      
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        setFormData({ 
          nombre: '', email: '', cuit: '', domicilio: '', codigoPostal: '',
          telefono: '', zonaDistribucion: '', situacionAfip: '', informacionAdicional: ''
        });
        setSelectedFile(null);
        
        // Reset success message after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000);
      }, 2000);

    } catch (error) {
      console.error('Error al enviar formulario mayorista:', error);
      setIsSubmitting(false);
      alert('Error al enviar el formulario. Por favor, intenta nuevamente.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Por favor, selecciona solo archivos PDF');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-black via-gray-950 to-gray-900 pt-20">
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(22, 162, 69, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(22, 162, 69, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="mb-6 text-5xl font-black text-white md:text-6xl">
              CONVERTITE EN
              <span className="block text-[#16a245]">MAYORISTA KANSACO (sin logica aun)</span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-300">
              Únete a nuestra red de distribuidores y accede a precios especiales, 
              capacitación técnica y el respaldo de más de 50 años de experiencia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm"
            >
              <div className="mb-8 text-center">
                <h2 className="mb-4 text-3xl font-bold text-white">Solicitud de Registro</h2>
                <p className="text-gray-300">
                  Completa el siguiente formulario y nos pondremos en contacto contigo
                </p>
              </div>

              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 flex items-center gap-3 rounded-lg bg-green-900/50 border border-green-700 p-4 text-green-300"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>¡Solicitud enviada con éxito! Te contactaremos pronto.</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-gray-300">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/20"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/20"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="cuit" className="mb-2 block text-sm font-medium text-gray-300">
                      CUIT *
                    </label>
                    <input
                      type="text"
                      id="cuit"
                      name="cuit"
                      value={formData.cuit}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/20"
                      placeholder="XX-XXXXXXXX-X"
                    />
                  </div>
                  <div>
                    <label htmlFor="telefono" className="mb-2 block text-sm font-medium text-gray-300">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/20"
                      placeholder="Tu número de teléfono"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="domicilio" className="mb-2 block text-sm font-medium text-gray-300">
                    Domicilio completo con Localidad y Provincia *
                  </label>
                  <input
                    type="text"
                    id="domicilio"
                    name="domicilio"
                    value={formData.domicilio}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/20"
                    placeholder="Dirección completa, localidad, provincia"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="codigoPostal" className="mb-2 block text-sm font-medium text-gray-300">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      id="codigoPostal"
                      name="codigoPostal"
                      value={formData.codigoPostal}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/20"
                      placeholder="CP"
                    />
                  </div>
                  <div>
                    <label htmlFor="zonaDistribucion" className="mb-2 block text-sm font-medium text-gray-300">
                      Zona de distribución *
                    </label>
                    <input
                      type="text"
                      id="zonaDistribucion"
                      name="zonaDistribucion"
                      value={formData.zonaDistribucion}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/20"
                      placeholder="Área geográfica de cobertura"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="situacionAfip" className="mb-2 block text-sm font-medium text-gray-300">
                    Situación ante AFIP *
                  </label>
                  <select
                    id="situacionAfip"
                    name="situacionAfip"
                    value={formData.situacionAfip}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg bg-gray-900 px-4 py-3 text-white focus:outline-none"
                  >
                    <option value="">Selecciona tu situación</option>
                    {situacionesAfip.map((situacion) => (
                      <option key={situacion} value={situacion}>
                        {situacion}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="informacionAdicional" className="mb-2 block text-sm font-medium text-gray-300">
                    Información adicional o carta de presentación
                  </label>
                  <textarea
                    id="informacionAdicional"
                    name="informacionAdicional"
                    value={formData.informacionAdicional}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/20 resize-none"
                    placeholder="Cuéntanos sobre tu experiencia, distribución actual, objetivos, etc."
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Documentación adicional (PDF opcional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-600 bg-gray-800/30 px-6 py-8 transition-colors hover:border-[#16a245] hover:bg-gray-800/50"
                    >
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-300">
                          {selectedFile ? selectedFile.name : 'Haz clic para subir un PDF'}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Constancia de AFIP, certificados, etc. (opcional)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#16a245] text-white hover:bg-[#0d7a32] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Enviando solicitud...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar solicitud
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
      <BackToHomeButton />
    </div>
  );
} 