'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Send, MapPin, Phone, Mail, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackToHomeButton from '@/components/ui/BackToHomeButton';

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Preparar datos para EmailJS
      const templateParams = {
        to_email: 'info@kansaco.com',
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        fecha: new Date().toLocaleDateString('es-AR'),
        reply_to: formData.email
      };

      // Por ahora simulamos el envío exitoso
      // TODO: Implementar EmailJS cuando tengas las credenciales
      // await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_PUBLIC_KEY');
      console.log('Datos del formulario de contacto:', templateParams);
      
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // Reset success message after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000);
      }, 2000);

    } catch (error) {
      console.error('Error al enviar formulario de contacto:', error);
      setIsSubmitting(false);
      alert('Error al enviar el mensaje. Por favor, intenta nuevamente.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
              CONTÁCTANOS (sin logica aun)
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-300">
              ¿Tienes preguntas sobre nuestros productos o necesitas asesoramiento técnico? 
              Nuestro equipo de expertos está aquí para ayudarte.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
                <h2 className="mb-6 text-3xl font-bold text-white">Envíanos un mensaje</h2>
                
                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-center gap-3 rounded-lg bg-green-900/50 border border-green-700 p-4 text-green-300"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>¡Mensaje enviado con éxito! Te responderemos pronto.</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-300">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/20"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
                        Email *
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

                  <div>
                    <label htmlFor="subject" className="mb-2 block text-sm font-medium text-gray-300">
                      Asunto *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/20"
                      placeholder="¿En qué podemos ayudarte?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-300">
                      Mensaje *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-[#16a245] focus:outline-none focus:ring-2 focus:ring-[#16a245]/20 resize-none"
                      placeholder="Compártenos los detalles de tu consulta..."
                    />
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
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar mensaje
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="mb-6 text-3xl font-bold text-white">Información de contacto</h2>
                <p className="mb-8 text-lg text-gray-300">
                  Más de 15 años de experiencia nos respaldan. Estamos aquí para brindarte 
                  el mejor asesoramiento técnico en lubricación.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-[#16a245]/20 p-3">
                    <MapPin className="h-6 w-6 text-[#16a245]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Dirección</h3>
                    <p className="text-gray-300">Buenos Aires, Argentina</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-[#16a245]/20 p-3">
                    <Phone className="h-6 w-6 text-[#16a245]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Teléfonos</h3>
                    <p className="text-gray-300">4237-2636 / 1365 / 0813</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-[#16a245]/20 p-3">
                    <Mail className="h-6 w-6 text-[#16a245]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Email</h3>
                    <p className="text-gray-300">info@kansaco.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-[#16a245]/20 p-3">
                    <Clock className="h-6 w-6 text-[#16a245]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Horarios</h3>
                    <p className="text-gray-300">Lunes a Viernes: 8:00 - 18:00</p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
                <h3 className="mb-4 text-xl font-semibold text-white">Enlaces rápidos</h3>
                <div className="space-y-3">
                  <Link href="/productos" className="block text-gray-300 hover:text-[#16a245] transition-colors">
                    → Ver catálogo de productos
                  </Link>
                  <a href="/mayorista" className="block text-gray-300 hover:text-[#16a245] transition-colors">
                    → Convertirse en mayorista
                  </a>
                  <a href="/tecnologia-lubricantes" className="block text-gray-300 hover:text-[#16a245] transition-colors">
                    → Conocer nuestra tecnología
                  </a>
                  <a href="/sobre-nosotros" className="block text-gray-300 hover:text-[#16a245] transition-colors">
                    → Sobre KANSACO
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
      <BackToHomeButton />
    </div>
  );
} 