import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 64, 96, 128, 256],
    qualities: [60, 75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kansaco-images.nyc3.cdn.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: 'kansaco-images.nyc3.digitaloceanspaces.com',
      },
    ],
  },
  trailingSlash: true,

  async redirects() {
    return [
      // Páginas redirect 301 (con y sin trailing slash)
      // Ver acercade en (business)/ por linea kansaco
      {
        source: '/la-empresa',
        destination: '/sobre-nosotros',
        permanent: true,
      },
      {
        source: '/la-empresa/',
        destination: '/sobre-nosotros/',
        permanent: true,
      },
      // Tecnología
      {
        source: '/el-lubricante',
        destination: '/tecnologia-lubricantes',
        permanent: true,
      },
      {
        source: '/el-lubricante/',
        destination: '/tecnologia-lubricantes/',
        permanent: true,
      },
      // Tienda principal
      {
        source: '/lineas-de-producto',
        destination: '/lineas-de-productos',
        permanent: true,
      },
      {
        source: '/lineas-de-producto/',
        destination: '/lineas-de-productos/',
        permanent: true,
      },
      {
        source: '/tienda',
        destination: '/productos',
        permanent: true,
      },
      {
        source: '/tienda/',
        destination: '/productos/',
        permanent: true,
      },
      // Categorías con path → query params (CAMBIADO: categoria → category)
      {
        source: '/categoria-producto/vehiculos',
        destination: '/productos?category=Vehículos',
        permanent: true,
      },
      {
        source: '/categoria-producto/vehiculos/',
        destination: '/productos/?category=Vehículos',
        permanent: true,
      },
      {
        source: '/categoria-producto/agro',
        destination: '/productos?category=Agro',
        permanent: true,
      },
      {
        source: '/categoria-producto/agro/',
        destination: '/productos/?category=Agro',
        permanent: true,
      },
      {
        source: '/categoria-producto/industrial',
        destination: '/productos?category=Industrial',
        permanent: true,
      },
      {
        source: '/categoria-producto/industrial/',
        destination: '/productos/?category=Industrial',
        permanent: true,
      },
      {
        source: '/categoria-producto/motos',
        destination: '/productos?category=Motos',
        permanent: true,
      },
      {
        source: '/categoria-producto/motos/',
        destination: '/productos/?category=Motos',
        permanent: true,
      },
      {
        source: '/categoria-producto/derivados-y-aditivos',
        destination: '/productos?category=Derivados Y Aditivos',
        permanent: true,
      },
      {
        source: '/categoria-producto/derivados-y-aditivos/',
        destination: '/productos/?category=Derivados Y Aditivos',
        permanent: true,
      },
      {
        source: '/categoria-producto/grasas',
        destination: '/productos?category=Grasas',
        permanent: true,
      },
      {
        source: '/categoria-producto/grasas/',
        destination: '/productos/?category=Grasas',
        permanent: true,
      },
      // Productos individuales con categoría en path
      {
        source: '/categoria-producto/:categoria/:slug',
        destination: '/productos/:slug',
        permanent: true,
      },
      {
        source: '/categoria-producto/:categoria/:slug/',
        destination: '/productos/:slug/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
