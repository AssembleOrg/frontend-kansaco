'use client';

import { motion } from 'framer-motion';
import { 
  UserCheck, 
  ShoppingCart, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Users,
  Calculator,
  FileText,
  Phone,
  Truck
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackToHomeButton from '@/components/ui/BackToHomeButton';

export default function GuiaCompraPage() {
  const steps = [
    {
      number: 1,
      icon: UserCheck,
      title: 'Registro y Aprobación',
      description: 'Primero debes ser mayorista aprobado para acceder a precios especiales',
      details: [
        'Completa el formulario de mayorista',
        'Proporciona documentación requerida (CUIT, constancia AFIP)',
        'Espera la aprobación de nuestro equipo comercial',
        'Recibe tus credenciales de acceso'
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      number: 2,
      icon: ShoppingCart,
      title: 'Compra Mínima',
      description: 'El pedido mínimo para mayoristas es de $400.000 ARS',
      details: [
        'Navega nuestro catálogo completo de productos',
        'Agrega productos al carrito hasta alcanzar el mínimo',
        'Aprovecha los precios mayoristas exclusivos',
        'Consulta disponibilidad y tiempos de entrega'
      ],
      color: 'from-green-500 to-green-600'
    },
    {
      number: 3,
      icon: CreditCard,
      title: 'Proceso de Pago',
      description: 'Completa tu pedido con nuestro sistema de pago personalizado',
      details: [
        'Revisa tu carrito y confirma cantidades',
        'Selecciona método de pago (transferencia/depósito)',
        'Completa formulario con datos de facturación',
        'Recibe comprobante y datos bancarios'
      ],
      color: 'from-purple-500 to-purple-600'
    },
    {
      number: 4,
      icon: CheckCircle,
      title: 'Confirmación y Entrega',
      description: 'Procesamos tu pedido y coordinamos la entrega',
      details: [
        'Nuestro equipo confirma el pago recibido',
        'Preparamos tu pedido en nuestro depósito',
        'Te contactamos para coordinar la entrega',
        'Recibes tu pedido con toda la documentación'
      ],
      color: 'from-orange-500 to-orange-600'
    }
  ];

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
              GUÍA DE
              <span className="block text-[#16a245]">COMPRA MAYORISTA (pasos a chequear)</span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-300">
              Conoce paso a paso cómo realizar tu primera compra como mayorista KANSACO. 
              Un proceso simple y seguro diseñado para distribuidores profesionales.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Important Info */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-blue-800/50 bg-blue-900/20 p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">Solo Mayoristas</h3>
              <p className="text-gray-300">
                Nuestro sistema de ventas está diseñado exclusivamente para 
                distribuidores mayoristas aprobados.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-green-800/50 bg-green-900/20 p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <Calculator className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">Compra Mínima</h3>
              <p className="text-gray-300">
                <span className="text-2xl font-bold text-green-400">$400.000</span>
                <br />
                Pedido mínimo para mayoristas en pesos argentinos.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-orange-800/50 bg-orange-900/20 p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20">
                <FileText className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">Sin Pasarela</h3>
              <p className="text-gray-300">
                Utilizamos un sistema personalizado de pago por transferencia 
                bancaria para mayor seguridad.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Step by Step Process */}
      <section className="py-24 bg-gradient-to-b from-gray-950 to-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-6 text-4xl font-bold text-white">Proceso de Compra Paso a Paso</h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-300">
              Seguí estos simples pasos para realizar tu primera compra como mayorista
            </p>
          </motion.div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex flex-col gap-8 lg:flex-row ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                } items-center`}
              >
                {/* Step Number and Icon */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className={`h-32 w-32 rounded-full bg-gradient-to-br ${step.color} p-1`}>
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-900">
                        <step.icon className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#16a245] text-xl font-bold text-white">
                      {step.number}
                    </div>
                  </div>
                </div>

                {/* Step Content */}
                <div className={`flex-1 text-center ${
                  index % 2 === 0 ? 'lg:text-left' : 'lg:text-right'
                }`}>
                  <h3 className="mb-4 text-3xl font-bold text-white">{step.title}</h3>
                  <p className="mb-6 text-lg text-gray-300">{step.description}</p>
                  <ul className="space-y-3">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className={`flex items-center gap-3 text-gray-400 ${
                        index % 2 === 0 ? 'justify-center lg:justify-start' : 'justify-center lg:justify-end'
                      }`}>
                        <CheckCircle className="h-5 w-5 flex-shrink-0 text-[#16a245]" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Management Details */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-6 text-4xl font-bold text-white">Manejo Final del Cliente</h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-300">
              Así es como gestionamos tu experiencia desde la confirmación hasta la entrega
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-blue-600/50 bg-blue-900/10 p-8"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                <Phone className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">Seguimiento Personalizado</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-[#16a245] mt-0.5" />
                  <span><strong>Confirmación inmediata:</strong> Recibirás confirmación por email y WhatsApp dentro de las 2 horas</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-[#16a245] mt-0.5" />
                  <span><strong>Asesor dedicado:</strong> Un representante te acompañará durante todo el proceso</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-[#16a245] mt-0.5" />
                  <span><strong>Actualizaciones en tiempo real:</strong> Notificaciones sobre el estado de tu pedido</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-green-600/50 bg-green-900/10 p-8"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <Truck className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">Logística y Entrega</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-[#16a245] mt-0.5" />
                  <span><strong>Coordinación previa:</strong> Te contactamos 24hs antes para coordinar la entrega</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-[#16a245] mt-0.5" />
                  <span><strong>Flexibilidad horaria:</strong> Adaptamos los horarios a tu disponibilidad</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-[#16a245] mt-0.5" />
                  <span><strong>Verificación en destino:</strong> Revisión conjunta del pedido al momento de la entrega</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-yellow-600/50 bg-yellow-900/10 p-8"
          >
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 flex-shrink-0 text-yellow-400" />
              <div>
                <h3 className="mb-4 text-2xl font-bold text-white">Información Importante</h3>
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <h4 className="mb-2 font-semibold text-yellow-400">Métodos de Pago:</h4>
                    <ul className="space-y-1 text-gray-300">
                      <li>• Transferencia bancaria</li>
                      <li>• Depósito bancario</li>
                      <li>• Cheque (evaluación crediticia)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-yellow-400">Tiempos de Procesamiento:</h4>
                    <ul className="space-y-1 text-gray-300">
                      <li>• Aprobación: 2-5 días hábiles</li>
                      <li>• Confirmación pago: 24-48hs</li>
                      <li>• Preparación: 1-3 días hábiles</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-yellow-400">Post-Venta:</h4>
                    <ul className="space-y-1 text-gray-300">
                      <li>• Soporte técnico continuo</li>
                      <li>• Garantía de productos</li>
                      <li>• Reposición inmediata</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-gray-950 to-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="mb-6 text-4xl font-bold text-white">
              ¿Listo para comenzar?
            </h2>
            <p className="mb-8 text-xl text-gray-300">
              Únete a nuestra red de mayoristas y accede a los mejores lubricantes del mercado
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/mayorista">
                <Button
                  size="lg"
                  className="bg-[#16a245] text-white hover:bg-[#0d7a32] transition-all duration-300"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Solicitar ser Mayorista
                </Button>
              </Link>
              <Link href="/contacto">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#16a245] text-[#16a245] hover:bg-[#16a245] hover:text-white transition-all duration-300"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Contactar Asesor
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <BackToHomeButton />
    </div>
  );
} 