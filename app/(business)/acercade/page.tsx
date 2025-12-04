'use client';

import { useEffect } from 'react';

// Mapeo de hashes 'original' a los slugs actuales
const hashMapping: Record<string, string> = {
  polymersprotection: '',
  lineasintetica: 'linea-sintetica',
  lineamineral: 'linea-mineral',
  lineapremium: 'linea-premium',
  lineadieselheavy: 'diesel-heavy-line',
  lubricanteparaelagro: 'lubricantes-agro',
  lubricanteparacompeticion: 'lubricantes-competicion',
  lubricantesparamotos: 'lubricantes-motos',
  lubricanteslineanautica: 'lubricantes-nautica',
  lubricantesindustriales: 'lubricantes-industriales',
  lineaparacajaydiferencial: 'linea-caja-diferencial',
  grasaslubricantes: 'grasas-lubricantes',
  derivadosyaditivos: 'derivados-aditivos',
};

/**
 * Redirección ultra-rápida client-side con window.location
 * Mucho más rápido que router.replace() porque no espera hidratación de React
 */
export default function AcercaDePage() {
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const mappedSlug = hashMapping[hash];

    // Construir nueva URL
    const newUrl = mappedSlug
      ? `/lineas-de-productos/#${mappedSlug}`
      : '/lineas-de-productos/';

    window.location.replace(newUrl);
  }, []);

  return null;
}
