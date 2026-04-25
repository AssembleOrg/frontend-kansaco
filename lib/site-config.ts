/**
 * Configuración centralizada del sitio.
 * Todos los valores de empresa, contacto, redes sociales y marca
 * se definen acá para evitar hardcoding en componentes.
 */

export const siteConfig = {
  // Empresa
  company: {
    name: 'Kansaco',
    legalName: 'Kansaco Petroquimica S.A',
    cuit: '30-58610901-0',
    tagline: 'Ingeniería Líquida',
    description:
      'Kansaco - Plataforma ecommerce. Productos dirigidos a los sistemas de lubricación',
  },

  // Contacto
  contact: {
    email: 'info@kansaco.com',
    salesEmail: 'ventas@kansaco.com',
    phones: ['4237-2636', '1365', '0813'],
    phoneDisplay: '4237-2636 / 1365 / 0813',
    location: 'Magallanes 2051, Fcio. Varela, Bs As. Arg',
    businessHours: 'Lun - Vie: 8:00 - 18:00',
  },

  // Redes sociales
  social: {
    facebook: 'https://www.facebook.com/kansacolubs/',
    instagram: 'https://www.instagram.com/kansaco',
    whatsapp: 'https://wa.me/5491138207230',
  },

  // Marca / Colores (para uso en estilos inline como PDF, emails, etc.)
  brand: {
    primaryColor: '#16a245',
    primaryDark: '#0d7a32',
    primaryHover: '#128a38',
    accentGold: '#d4af37',
    accentGoldDark: '#b8962e',
  },

  // Desarrollador
  developer: {
    name: 'Pistech',
    whatsapp: 'https://wa.me/5491138207230',
  },

  // Configuración de negocio
  business: {
    cookieExpirationDays: 7,
    itemsPerPage: 20,
    carouselIntervalMs: 5000,
    searchDebounceMs: 500,
    toastDurationMs: 3000,
    imageUploadMaxSizeMb: 10,
    imageUploadBatchSize: 3,
    priceRanges: [
      { label: 'Hasta $10.000', min: 0, max: 10000 },
      { label: '$10.000 a $30.000', min: 10000, max: 30000 },
      { label: 'Más de $30.000', min: 30000, max: undefined },
    ] as const,
  },
} as const;

export type SiteConfig = typeof siteConfig;
