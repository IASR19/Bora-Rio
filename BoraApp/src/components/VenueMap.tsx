import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/utils/cn';
import type { Venue } from '@/types/domain';

// Barra da Tijuca, RJ — mesmo fallback usado no resto do app quando não há geolocalização.
const DEFAULT_CENTER: [number, number] = [-23.0136, -43.3255];

/** Pin com o gradiente da marca — evita o ícone azul padrão do Leaflet (que nem carrega bem com bundlers). */
function buildPinIcon(score?: number) {
  const html = renderToStaticMarkup(
    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/80 bg-bora-gradient text-[11px] font-extrabold text-white shadow-lg">
      {score ?? '•'}
    </div>,
  );
  return L.divIcon({
    html,
    className: 'bora-map-pin',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

export function VenueMap({
  venues,
  zoom = 13,
  heightClassName = 'h-[65vh]',
  interactive = true,
}: {
  venues: Venue[];
  zoom?: number;
  heightClassName?: string;
  interactive?: boolean;
}) {
  const navigate = useNavigate();

  const center: [number, number] =
    venues.length > 0 ? [venues[0].latitude, venues[0].longitude] : DEFAULT_CENTER;

  return (
    <div className={cn('map-dark-tiles w-full overflow-hidden rounded-2xl border border-border', heightClassName)}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        className="h-full w-full bg-surface"
      >
        {/*
          Tile padrão do OpenStreetMap — o único realmente livre e sem cadastro/API key
          (CARTO passou a exigir chave até pro plano "grátis"). O visual escuro vem de um
          filtro CSS aplicado só na camada de tiles (ver .map-dark-tiles em index.css),
          sem depender de nenhum provedor de mapa escuro pago.
        */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          subdomains={['a', 'b', 'c']}
        />
        {venues.map((venue) => (
          <Marker
            key={venue.id}
            position={[venue.latitude, venue.longitude]}
            icon={buildPinIcon(venue.boraScore)}
            eventHandlers={{ click: () => navigate(`/venue/${venue.id}`) }}
          >
            <Popup>
              <p className="font-bold">{venue.name}</p>
              <p className="text-xs text-muted">{venue.category} · {venue.priceRange}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
