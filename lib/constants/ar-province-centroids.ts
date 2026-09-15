// Centroides [lat, lng] de las 24 provincias argentinas.
// Fuente: API oficial Georef (apis.datos.gob.ar/georef). Dataset fijo — no cambia.
// Las claves deben coincidir EXACTAMENTE con AR_PROVINCES (y con user.provincia),
// para poder mapear el conteo por provincia a su pin en el mapa.
import type { ArProvince } from './provinces';

export const AR_PROVINCE_CENTROIDS: Record<ArProvince, [number, number]> = {
  'Buenos Aires': [-36.677, -60.558],
  'Ciudad Autónoma de Buenos Aires': [-34.614, -58.446],
  Catamarca: [-27.336, -66.948],
  Chaco: [-26.387, -60.765],
  Chubut: [-43.789, -68.527],
  Córdoba: [-32.145, -63.802],
  Corrientes: [-28.774, -57.801],
  'Entre Ríos': [-32.059, -59.201],
  Formosa: [-24.895, -59.932],
  Jujuy: [-23.32, -65.764],
  'La Pampa': [-37.135, -65.448],
  'La Rioja': [-29.685, -67.182],
  Mendoza: [-34.63, -68.583],
  Misiones: [-26.875, -54.652],
  Neuquén: [-38.642, -70.12],
  'Río Negro': [-40.405, -67.23],
  Salta: [-24.299, -64.814],
  'San Juan': [-30.866, -68.888],
  'San Luis': [-33.761, -66.025],
  'Santa Cruz': [-48.816, -69.956],
  'Santa Fe': [-30.709, -60.951],
  'Santiago del Estero': [-27.783, -63.253],
  // El centroide oficial (-82.5) incluye la Antártida → se usa la isla de Tierra del Fuego.
  'Tierra del Fuego': [-54.4, -67.8],
  Tucumán: [-26.948, -65.365],
};
