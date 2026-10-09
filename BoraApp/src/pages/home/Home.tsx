import { useQuery } from '@tanstack/react-query';
import {
  Beer,
  Bell,
  Building2,
  ChevronDown,
  Landmark,
  type LucideIcon,
  MapPin,
  MicVocal,
  Mountain,
  Music,
  Palette,
  PartyPopper,
  Search,
  Sunrise,
  Trees,
  Umbrella,
  UtensilsCrossed,
  Volume2,
  Waves,
  Wine,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { EventCard } from '@/components/EventCard';
import { LocationSheet } from '@/components/LocationSheet';
import { VenueListItem } from '@/components/VenueListItem';
import { useAuth } from '@/context/AuthContext';
import { eventsService } from '@/services/events.service';
import { venuesService } from '@/services/venues.service';
import { VENUE_CATEGORY_OPTIONS, type VenueCategory } from '@/shared/constants/venue-categories';
import { Input } from '@/shared/ui/Input';
import { cn } from '@/utils/cn';

interface Shortcut {
  key: string;
  label: string;
  icon: LucideIcon;
  now: boolean;
  category?: VenueCategory;
  music?: string;
}

/** Record tipado: uma categoria nova em VENUE_CATEGORY_OPTIONS sem atalho aqui quebra o build. */
const CATEGORY_SHORTCUTS: Record<VenueCategory, Pick<Shortcut, 'label' | 'icon'>> = {
  festa: { label: 'Festas', icon: Music },
  bar: { label: 'Bares', icon: Beer },
  samba: { label: 'Roda de samba', icon: MicVocal },
  beach_club: { label: 'Beach clubs', icon: Umbrella },
  rooftop: { label: 'Rooftops', icon: Building2 },
  praia: { label: 'Praias', icon: Waves },
  ponto_turistico: { label: 'Pontos turísticos', icon: Landmark },
  cultura: { label: 'Cultura', icon: Palette },
  parque: { label: 'Parques', icon: Trees },
  aventura: { label: 'Aventura', icon: Mountain },
  restaurante: { label: 'Jantar', icon: UtensilsCrossed },
  lounge: { label: 'Lounges', icon: Wine },
};

/** Cada atalho mapeia pra um filtro real de busca (escopo.md #8 e #12 "outras categorias"). */
const SHORTCUTS: Shortcut[] = [
  { key: 'agora', label: 'BORA Agora', icon: PartyPopper, now: true },
  { key: 'pagode', label: 'Pagode', icon: Volume2, now: false, music: 'pagode' },
  { key: 'eletronico', label: 'Eletrônico', icon: Sunrise, now: false, music: 'eletronico' },
  ...VENUE_CATEGORY_OPTIONS.map(({ value }) => ({
    key: value,
    now: false,
    category: value,
    ...CATEGORY_SHORTCUTS[value],
  })),
];

const HOME_PLACES_LIMIT = 8;

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeShortcut, setActiveShortcut] = useState('agora');
  const [search, setSearch] = useState('');
  const [locationOpen, setLocationOpen] = useState(false);
  const shortcut = SHORTCUTS.find((s) => s.key === activeShortcut) ?? SHORTCUTS[0];

  const lat = user?.latitude ?? undefined;
  const lng = user?.longitude ?? undefined;

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', 'recommended', activeShortcut, lat, lng],
    queryFn: () =>
      eventsService.search({ now: shortcut.now, category: shortcut.category, music: shortcut.music, lat, lng }),
  });

  // O catálogo tem locais reais mesmo onde ninguém publicou evento ainda (ex.: cidades menores):
  // a Home mostra os lugares do mesmo atalho, no mesmo raio, pra nunca ficar vazia.
  const { data: venues, isLoading: venuesLoading } = useQuery({
    queryKey: ['venues', 'home', activeShortcut, lat, lng],
    queryFn: () => venuesService.search({ category: shortcut.category, music: shortcut.music, lat, lng }),
  });
  const placesLink = shortcut.category ? `/explore?category=${shortcut.category}` : '/explore';

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !search.trim()) return;
    navigate(`/explore?q=${encodeURIComponent(search.trim())}`);
  };

  // Roda do mouse (desktop) também rola o carrossel de atalhos na horizontal, já que ele
  // não cabe inteiro na largura do telefone. preventDefault evita rolar a página junto, e só
  // funciona num listener nativo { passive: false }: o onWheel do React é passivo.
  const shortcutsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = shortcutsRef.current;
    if (!element) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      element.scrollLeft += e.deltaY;
    };
    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="bg-background px-5 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-extrabold gradient-text">BORA</p>
          {/* Sem login não há perfil pra salvar a cidade: aí o rótulo é só informativo. */}
          {user ? (
            <button
              type="button"
              onClick={() => setLocationOpen(true)}
              className="flex items-center gap-1 text-xs text-muted"
              aria-label={user.city ? `Localização: ${user.city}. Toque para trocar` : 'Definir localização'}
            >
              <MapPin className="h-3.5 w-3.5" /> {user.city ?? 'Definir localização'}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          ) : (
            <p className="flex items-center gap-1 text-xs text-muted">
              <MapPin className="h-3.5 w-3.5" /> Barra da Tijuca, RJ
            </p>
          )}
        </div>
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface"
          aria-label="Notificações"
          onClick={() => navigate('/notifications')}
        >
          <Bell className="h-5 w-5" />
        </button>
      </div>

      <h1 className="mt-6 text-2xl font-extrabold leading-tight">O que você quer fazer hoje?</h1>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <Input
          placeholder="O que você está procurando?"
          className="pl-11"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchSubmit}
        />
      </div>

      <div className="relative mt-5">
        <div ref={shortcutsRef} className="flex gap-2 overflow-x-auto scroll-smooth pb-1">
          {SHORTCUTS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveShortcut(key)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors',
                activeShortcut === key
                  ? 'border-transparent bg-bora-gradient text-white'
                  : 'border-border bg-surface text-muted',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
        {/* Dica visual de que dá pra rolar mais pra direita */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold">Eventos para você</h2>
        <button className="text-sm font-semibold text-destaque" onClick={() => navigate('/explore')}>
          Ver todos
        </button>
      </div>

      <div className="mt-4 space-y-4 pb-6">
        {isLoading && <p className="text-sm text-muted">Carregando...</p>}
        {events?.length === 0 && (
          <div className="rounded-2xl border border-border bg-surface p-4 text-center">
            <p className="text-sm font-semibold">Nenhum evento marcado por aqui ainda.</p>
            <p className="mt-1 text-xs text-muted">Veja abaixo lugares para ir ou crie um evento no botão +.</p>
          </div>
        )}
        {events?.map((event) => (
          <EventCard key={event.id} event={event} score={event.boraScore} distanceKm={event.distanceKm} />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Lugares perto de você</h2>
        <button className="text-sm font-semibold text-destaque" onClick={() => navigate(placesLink)}>
          Ver todos
        </button>
      </div>

      <div className="mt-4 space-y-3 pb-6">
        {venuesLoading && <p className="text-sm text-muted">Carregando...</p>}
        {venues?.length === 0 && (
          <div className="rounded-2xl border border-border bg-surface p-6 text-center">
            <p className="font-semibold">Nenhum lugar desse tipo no seu raio.</p>
            <p className="mt-1 text-sm text-muted">
              Aumente a distância em Minhas preferências ou veja outra categoria.
            </p>
          </div>
        )}
        {venues?.slice(0, HOME_PLACES_LIMIT).map((venue) => (
          <VenueListItem key={venue.id} venue={venue} onClick={() => navigate(`/venue/${venue.id}`)} />
        ))}
      </div>
      {locationOpen && <LocationSheet onClose={() => setLocationOpen(false)} />}
    </div>
  );
}
