'use client';

import { motion } from 'framer-motion';
import { Scale, FileText, Users, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackToHomeButton from '@/components/ui/BackToHomeButton';

export default function TerminosYCondicionesPage() {
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
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#16a245]/20">
              <Scale className="h-10 w-10 text-[#16a245]" />
            </div>
            <h1 className="mb-6 text-5xl font-black text-white md:text-6xl">
              TÉRMINOS Y
              <span className="block text-[#16a245]">CONDICIONES</span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-300">
              Estos términos y condiciones rigen el uso de nuestro sitio web y la compra 
              de productos KANSACO. Por favor, léelos cuidadosamente.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-24 bg-gradient-to-b from-gray-950 to-black">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-12">
            
            {/* General Terms */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16a245]/20">
                  <FileText className="h-6 w-6 text-[#16a245]" />
                </div>
                <h2 className="text-3xl font-bold text-white">Términos Generales</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>
                  Al acceder y utilizar este sitio web, usted acepta cumplir con estos términos 
                  y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, 
                  no debe utilizar nuestros servicios.
                </p>
                <p>
                  KANSACO se reserva el derecho de modificar estos términos en cualquier momento. 
                  Las modificaciones entrarán en vigor inmediatamente después de su publicación 
                  en el sitio web.
                </p>
              </div>
            </motion.div>

            {/* Wholesale Terms */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16a245]/20">
                  <Users className="h-6 w-6 text-[#16a245]" />
                </div>
                <h2 className="text-3xl font-bold text-white">Ventas Mayoristas</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="mb-3 text-xl font-semibold text-white">Requisitos de Registro</h3>
                  <ul className="space-y-2">
                    <li>• Documentación comercial válida (CUIT, constancia AFIP)</li>
                    <li>• Aprobación previa del departamento comercial</li>
                    <li>• Compromiso de compra mínima anual</li>
                    <li>• Cumplimiento de políticas de distribución</li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-3 text-xl font-semibold text-white">Condiciones de Compra</h3>
                  <ul className="space-y-2">
                    <li>• <strong>Pedido mínimo:</strong> $400.000 ARS por compra</li>
                    <li>• <strong>Formas de pago:</strong> Transferencia bancaria, depósito, cheque (sujeto a evaluación)</li>
                    <li>• <strong>Plazo de entrega:</strong> 3-7 días hábiles según disponibilidad</li>
                    <li>• <strong>Garantía:</strong> Productos con garantía de calidad según especificaciones técnicas</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Payment and Shipping */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8"
            >
              <h2 className="mb-6 text-3xl font-bold text-white">Pagos y Envíos</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-xl font-semibold text-[#16a245]">Métodos de Pago</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Transferencia bancaria</li>
                    <li>• Depósito bancario</li>
                    <li>• Cheque (sujeto a evaluación crediticia)</li>
                    <li>• Los precios incluyen IVA cuando corresponda</li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-4 text-xl font-semibold text-[#16a245]">Envíos</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Envíos a todo el país</li>
                    <li>• Costo de envío según destino y volumen</li>
                    <li>• Seguro de mercadería incluido</li>
                    <li>• Retiro en planta disponible</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Product Warranty */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8"
            >
              <h2 className="mb-6 text-3xl font-bold text-white">Garantía de Productos</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  Todos nuestros productos están garantizados contra defectos de fabricación 
                  y cumplen con las especificaciones técnicas publicadas.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold text-white">Cobertura de Garantía:</h4>
                    <ul className="space-y-1">
                      <li>• Defectos de fabricación</li>
                      <li>• No cumplimiento de especificaciones</li>
                      <li>• Problemas de calidad comprobables</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-white">Exclusiones:</h4>
                    <ul className="space-y-1">
                      <li>• Uso inadecuado del producto</li>
                      <li>• Almacenamiento incorrecto</li>
                      <li>• Contaminación por terceros</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Limitations */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-yellow-600/50 bg-yellow-900/10 p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20">
                  <AlertTriangle className="h-6 w-6 text-yellow-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">Limitaciones de Responsabilidad</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>
                  KANSACO no será responsable por daños indirectos, incidentales o 
                  consecuentes que puedan surgir del uso de nuestros productos.
                </p>
                <div>
                  <h3 className="mb-3 text-xl font-semibold text-white">Limitaciones Específicas:</h3>
                  <ul className="space-y-2">
                    <li>• Daños por uso inadecuado o aplicación incorrecta</li>
                    <li>• Pérdidas económicas derivadas de paradas de equipos</li>
                    <li>• Daños ambientales por mal manejo del producto</li>
                    <li>• Incompatibilidad con equipos no especificados</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Intellectual Property */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8"
            >
              <h2 className="mb-6 text-3xl font-bold text-white">Propiedad Intelectual</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  Todo el contenido de este sitio web, incluyendo pero no limitado a textos, 
                  imágenes, logos, y software, es propiedad de KANSACO y está protegido por 
                  las leyes de propiedad intelectual.
                </p>
                <div>
                  <h3 className="mb-3 text-xl font-semibold text-white">Uso Autorizado:</h3>
                  <ul className="space-y-2">
                    <li>• Consulta personal y no comercial del sitio</li>
                    <li>• Descarga de información de productos para uso comercial legítimo</li>
                    <li>• Reproducción de especificaciones técnicas para fines de aplicación</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Jurisdiction */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8"
            >
              <h2 className="mb-6 text-3xl font-bold text-white">Jurisdicción y Ley Aplicable</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  Estos términos y condiciones se rigen por las leyes de la República Argentina. 
                  Cualquier disputa será resuelta en los tribunales competentes de la Ciudad 
                  Autónoma de Buenos Aires.
                </p>
                <p>
                  Para consultas sobre estos términos, puede contactarnos a través de nuestros 
                  canales oficiales de comunicación.
                </p>
              </div>
            </motion.div>

            {/* Contact CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-[#16a245]/30 bg-gradient-to-r from-[#16a245]/10 to-[#0d7a32]/10 p-8 text-center"
            >
              <h2 className="mb-6 text-3xl font-bold text-white">¿Tienes consultas legales?</h2>
              <p className="mb-6 text-lg text-gray-300">
                Si necesitas aclaraciones sobre estos términos y condiciones, 
                nuestro equipo legal está disponible para ayudarte.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href="/contacto">
                  <Button
                    size="lg"
                    className="bg-[#16a245] text-white hover:bg-[#0d7a32] transition-all duration-300"
                  >
                    <Scale className="mr-2 h-5 w-5" />
                    Consultar Legales
                  </Button>
                </Link>
                <Link href="/">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[#16a245] text-[#16a245] hover:bg-[#16a245] hover:text-white transition-all duration-300"
                  >
                    Volver al Inicio
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Last Updated */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center text-gray-400"
            >
              <p>
                <strong>Última actualización:</strong> Enero 2025
              </p>
              <p className="mt-2">
                Estos términos pueden ser actualizados periódicamente. 
                Te recomendamos revisarlos regularmente.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />
      <BackToHomeButton />
    </div>
  );
}
