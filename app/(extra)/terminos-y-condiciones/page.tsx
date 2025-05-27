/* eslint-disable react/no-unescaped-entities */
// app/(legal)/terminos-y-condiciones/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Términos y Condiciones - KANSACO',
  description:
    'Lee nuestros términos y condiciones de servicio para la plataforma mayorista de KANSACO.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-gray-50 py-12 dark:bg-gray-900">
      <div className="container mx-auto max-w-3xl rounded-lg bg-white px-6 py-10 shadow-lg dark:bg-gray-800 sm:px-8 md:px-12">
        <header className="mb-10 border-b border-gray-200 pb-6 dark:border-gray-700">
          <h1 className="text-center text-4xl font-bold text-gray-800 dark:text-white">
            Términos y Condiciones de Uso
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            Última actualización: {new Date().toLocaleDateString('es-AR')}
          </p>
        </header>

        <article className="space-y-6 text-gray-700">
          <p>
            Bienvenido a la plataforma mayorista de <strong>KANSACO</strong> (en
            adelante, "el Sitio Web" o "la Plataforma"). Estos Términos y
            Condiciones (en adelante, "Términos") rigen el uso de nuestros
            servicios y la compra de productos a través de esta Plataforma. Al
            acceder o utilizar el Sitio Web, usted acepta estar sujeto a estos
            Términos. Si no está de acuerdo con alguna parte de los términos, no
            podrá acceder al servicio.
          </p>

          <h2 id="definiciones">1. Definiciones</h2>
          <ul>
            <li>
              <strong>"KANSACO", "Nosotros", "Nuestro":</strong> Se refiere a la
              empresa KANSACO, propietaria y operadora de esta Plataforma.
            </li>
            <li>
              <strong>"Usuario", "Usted", "Cliente":</strong> Se refiere a
              cualquier persona o entidad que acceda o utilice la Plataforma
              para visualizar información o realizar compras de productos al por
              mayor.
            </li>
            <li>
              <strong>"Productos":</strong> Se refiere a los lubricantes,
              filtros, aditivos y cualquier otro artículo ofrecido para la venta
              en la Plataforma.
            </li>
            <li>
              <strong>"Plataforma":</strong> Se refiere al sitio web de KANSACO
              destinado a ventas mayoristas.
            </li>
          </ul>

          <h2 id="uso-de-la-plataforma">2. Uso de la Plataforma</h2>
          <p>
            Para utilizar esta Plataforma y realizar pedidos, debe ser un
            cliente mayorista verificado o registrarse como tal. KANSACO se
            reserva el derecho de aprobar o rechazar solicitudes de registro a
            su entera discreción. Usted es responsable de mantener la
            confidencialidad de su cuenta y contraseña y de restringir el acceso
            a su computadora.
          </p>

          <h2 id="pedidos-y-pagos">3. Pedidos y Pagos</h2>
          <p>
            Todos los pedidos realizados a través de la Plataforma están sujetos
            a la aceptación de KANSACO y a la disponibilidad de los Productos.
            Los precios de los Productos se indicarán en la Plataforma y podrán
            estar sujetos a cambios sin previo aviso.
          </p>
          <p>
            Actualmente, los pagos se coordinan directamente con nuestra
            administración después de la confirmación del pedido. Un miembro de
            nuestro equipo se comunicará con usted para finalizar los detalles
            de pago (efectivo, transferencia bancaria, tarjeta de crédito/débito
            en punto de venta, o link de pago de Mercado Pago) y coordinar el
            envío o retiro de la mercadería.
          </p>
          <p>
            KANSACO se reserva el derecho de solicitar información adicional
            para la verificación de pagos y de cancelar cualquier pedido si se
            sospecha de actividad fraudulenta.
          </p>
          <p>
            Puede existir un monto mínimo de compra para acceder a los precios
            mayoristas, el cual será comunicado en la Plataforma o por nuestros
            representantes de ventas.
          </p>

          <h2 id="envios-y-entregas">4. Envíos y Entregas</h2>
          <p>
            Los términos de envío y entrega serán acordados caso por caso con el
            cliente. KANSACO no se hace responsable por demoras causadas por
            terceros (empresas de transporte) o por fuerza mayor. Los costos de
            envío, si aplican, serán comunicados al cliente antes de finalizar
            la transacción.
          </p>

          <h2 id="politica-de-devoluciones">5. Política de Devoluciones</h2>
          <p>
            Las devoluciones de productos serán aceptadas únicamente en caso de
            defectos de fabricación o errores en el envío por parte de KANSACO,
            dentro de un plazo de 7 días desde la recepción de la mercadería.
            Los productos deben estar en su empaque original y sin usar. Para
            gestionar una devolución, por favor, contacte a nuestro departamento
            de atención al cliente.
          </p>

          <h2 id="propiedad-intelectual">6. Propiedad Intelectual</h2>
          <p>
            Todo el contenido incluido en la Plataforma, como textos, gráficos,
            logotipos, imágenes, clips de audio, descargas digitales y
            compilaciones de datos, es propiedad de KANSACO o de sus proveedores
            de contenido y está protegido por las leyes de propiedad
            intelectual.
          </p>

          <h2 id="limitacion-de-responsabilidad">
            7. Limitación de Responsabilidad
          </h2>
          <p>
            KANSACO no será responsable por ningún daño directo, indirecto,
            incidental, especial o consecuente que resulte del uso o la
            imposibilidad de usar la Plataforma o los Productos adquiridos,
            incluso si KANSACO ha sido advertido de la posibilidad de tales
            daños.
          </p>

          <h2 id="modificaciones-a-los-terminos">
            8. Modificaciones a los Términos
          </h2>
          <p>
            KANSACO se reserva el derecho de modificar estos Términos en
            cualquier momento. Cualquier cambio será efectivo inmediatamente
            después de su publicación en la Plataforma. El uso continuado de la
            Plataforma después de tales modificaciones constituirá su aceptación
            de los nuevos términos. Le recomendamos revisar esta página
            periódicamente.
          </p>

          <h2 id="ley-aplicable-y-jurisdiccion">
            9. Ley Aplicable y Jurisdicción
          </h2>
          <p>
            Estos Términos se regirán e interpretarán de acuerdo con las leyes
            de la República Argentina. Cualquier disputa que surja en relación
            con estos Términos estará sujeta a la jurisdicción exclusiva de los
            tribunales competentes de la Ciudad Autónoma de Buenos Aires.
          </p>

          <h2 id="contacto">10. Contacto</h2>
          <p>
            Si tiene alguna pregunta sobre estos Términos y Condiciones, por
            favor contáctenos a través de Nuestro Contacto.
          </p>

          <div className="mt-12 border-t border-gray-200 pt-8 text-center dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gracias por elegir <strong>KANSACO</strong>.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-green-600 hover:text-green-700 hover:underline"
            >
              Volver a la página de inicio
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
