'use client';

import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import Link from 'next/link';
import { Users } from 'lucide-react';
import type { UsersByZoneItem } from '@/lib/api';
import { AR_PROVINCE_CENTROIDS } from '@/lib/constants/ar-province-centroids';

interface ArgentinaMapProps {
  zones: UsersByZoneItem[];
}

interface Pin {
  provincia: string;
  lat: number;
  lng: number;
  total: number;
  enabled: number;
  pending: number;
}

const MIN_SIZE = 28;
const MAX_SIZE = 64; // tope duro: un total enorme nunca tapa la pantalla

// Tamaño del círculo según el total, acotado a [MIN_SIZE, MAX_SIZE].
function sizeFor(total: number, max: number) {
  const scaled = MIN_SIZE + (total / max) * (MAX_SIZE - MIN_SIZE);
  return Math.round(Math.max(MIN_SIZE, Math.min(MAX_SIZE, scaled)));
}

// HTML del círculo verde con el número adentro (reusado por pin y cluster).
function circleHtml(label: number | string, size: number) {
  return `<div style="
    width:${size}px;height:${size}px;
    display:flex;align-items:center;justify-content:center;
    border-radius:9999px;
    background:rgba(22,162,69,0.85);
    color:#fff;font-weight:600;font-size:${Math.max(11, Math.min(20, size / 3.2))}px;
    border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35);
  ">${label}</div>`;
}

// Pin de provincia (divIcon = evita el bug de íconos default de Leaflet en bundlers).
function makeIcon(total: number, max: number) {
  const size = sizeFor(total, max);
  return L.divIcon({
    className: 'kansaco-zone-pin',
    html: circleHtml(total, size),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Ajusta el encuadre a los pines presentes (o Argentina entera si no hay).
function FitBounds({ pins }: { pins: Pin[] }) {
  const map = useMap();
  useMemo(() => {
    if (pins.length === 0) return;
    if (pins.length === 1) {
      map.setView([pins[0].lat, pins[0].lng], 6);
      return;
    }
    const bounds = L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [pins, map]);
  return null;
}

export default function ArgentinaMap({ zones }: ArgentinaMapProps) {
  const pins: Pin[] = useMemo(() => {
    return zones
      .filter((z) => z.provincia !== 'Sin especificar')
      .map((z) => {
        const c = AR_PROVINCE_CENTROIDS[z.provincia as keyof typeof AR_PROVINCE_CENTROIDS];
        if (!c) return null; // provincia sin centroide (typo/valor raro) → se omite
        return {
          provincia: z.provincia,
          lat: c[0],
          lng: c[1],
          total: z.total,
          enabled: z.enabled,
          pending: z.pending,
        };
      })
      .filter((p): p is Pin => p !== null);
  }, [zones]);

  const maxTotal = pins.reduce((m, p) => Math.max(m, p.total), 0) || 1;

  // Lookup "lat,lng" → total, para que el cluster sume USUARIOS (no marcadores).
  const totalByLatLng = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of pins) m.set(`${p.lat},${p.lng}`, p.total);
    return m;
  }, [pins]);

  // El cluster muestra la suma de usuarios de las provincias agrupadas.
  const clusterIcon = (cluster: L.MarkerCluster) => {
    let sum = 0;
    for (const child of cluster.getAllChildMarkers()) {
      const ll = child.getLatLng();
      sum += totalByLatLng.get(`${ll.lat},${ll.lng}`) ?? 0;
    }
    const size = sizeFor(sum, maxTotal);
    return L.divIcon({
      className: 'kansaco-zone-cluster',
      html: circleHtml(sum, size),
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  return (
    <MapContainer
      center={[-38.4, -63.6]} // Argentina
      zoom={4}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
    >
      {/* Mapa base oficial del IGN Argentino: español + Islas Malvinas argentinas.
          Es esquema TMS (Y invertido) → requiere tms para no salir espejado. */}
      <TileLayer
        attribution='<a href="https://www.ign.gob.ar/AreaServicios/Argenmap/IntroduccionV2" target="_blank" rel="noopener">Instituto Geográfico Nacional</a> + <a href="https://www.osm.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
        url="https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png"
        tms
        minZoom={3}
        maxZoom={18}
      />
      <FitBounds pins={pins} />
      <MarkerClusterGroup iconCreateFunction={clusterIcon} showCoverageOnHover={false}>
      {pins.map((p) => (
        <Marker key={p.provincia} position={[p.lat, p.lng]} icon={makeIcon(p.total, maxTotal)}>
          <Popup>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-neutral-900">{p.provincia}</p>
              <p className="text-xs text-neutral-600">
                <span className="font-semibold text-neutral-800">{p.total}</span> usuario{p.total !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-neutral-600">
                <span className="text-green-700">{p.enabled} habilitados</span>
                {' · '}
                <span className="text-amber-600">{p.pending} pendientes</span>
              </p>
              <Link
                href={`/admin/users?provincia=${encodeURIComponent(p.provincia)}`}
                className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-50"
              >
                <Users className="h-3.5 w-3.5" />
                Ver usuarios
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
