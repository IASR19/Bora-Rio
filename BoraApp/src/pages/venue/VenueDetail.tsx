import * as Tabs from '@radix-ui/react-tabs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Heart, MapPin, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { EventCard } from '@/components/EventCard';
import { eventsService } from '@/services/events.service';
import { favoritesService } from '@/services/favorites.service';
import { venuesService } from '@/services/venues.service';
import { venueCategoryLabel } from '@/shared/constants/venue-categories';
import { Button } from '@/shared/ui/Button';
import { CoverImage } from '@/shared/ui/CoverImage';
import { ScoreBadge } from '@/shared/ui/ScoreBadge';
import { cn } from '@/utils/cn';

import { AboutTab } from './tabs/AboutTab';
import { LocationTab } from './tabs/LocationTab';

/** Página do lugar: informações do local e os eventos marcados nele. Cada evento abre /event/:id. */
export function VenueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [shareCopied, setShareCopied] = useState(false);
  const [favoritePending, setFavoritePending] = useState(false);

  const { data: venue } = useQuery({
    queryKey: ['venue', id],
    queryFn: () => venuesService.getById(id!),
    enabled: !!id,
  });

  // A busca por venueId traz também eventos em análise (pensada pro link direto); a página do
  // lugar é listagem pública, então só mostra os publicados.
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', 'venue', id],
    queryFn: () => eventsService.search({ venueId: id }),
    enabled: !!id,
    select: (list) => list.filter((event) => !event.status || event.status === 'published'),
  });

  const { data: favoriteIds } = useQuery({
    queryKey: ['favorites', 'mine'],
    queryFn: favoritesService.mine,
  });

  const isFavorite = Boolean(id && favoriteIds?.includes(id));

  const handleToggleFavorite = async () => {
    if (!id || favoritePending) return;
    setFavoritePending(true);
    try {
      await (isFavorite ? favoritesService.remove(id) : favoritesService.add(id));
      await queryClient.invalidateQueries({ queryKey: ['favorites', 'mine'] });
    } catch {
      // silencioso — o coração simplesmente não muda de estado
    } finally {
      setFavoritePending(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = venue?.name ?? 'BORA';
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url).catch(() => undefined);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  if (!venue) return null;

  return (
    <div className="app-shell min-h-dvh bg-background pb-28">
      <div className="relative h-64 w-full bg-bora-gradient-soft">
        <CoverImage src={venue.coverImageUrl} alt={venue.name} />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur">
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur"
              aria-label="Compartilhar"
            >
              <Share2 className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={handleToggleFavorite}
              disabled={favoritePending}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur"
              aria-label="Favoritar"
            >
              <Heart className={cn('h-4 w-4 text-white', isFavorite && 'fill-destaque text-destaque')} />
            </button>
          </div>
        </div>
        {shareCopied && (
          <p className="absolute bottom-3 right-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">
            Link copiado
          </p>
        )}
      </div>

      <div className="px-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight">{venue.name}</h1>
            <p className="mt-1 text-sm text-muted">{venueCategoryLabel(venue.category)}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              <MapPin className="h-3.5 w-3.5" />
              {venue.distanceKm != null ? `${venue.distanceKm.toFixed(1)} km · ` : ''}
              {venue.address}
            </p>
          </div>
          {venue.boraScore != null && <ScoreBadge score={venue.boraScore} />}
        </div>

        {(venue.musicGenres.length > 0 || venue.vibes.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {[...venue.musicGenres, ...venue.vibes.slice(0, 2)].map((tag) => (
              <span key={tag} className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted">
                {tag}
              </span>
            ))}
          </div>
        )}

        <Tabs.Root defaultValue="about" className="mt-6">
          <Tabs.List className="flex gap-5 overflow-x-auto border-b border-border text-sm font-semibold text-muted">
            {[
              { value: 'about', label: 'Sobre' },
              { value: 'events', label: events?.length ? `Eventos (${events.length})` : 'Eventos' },
              { value: 'location', label: 'Local' },
            ].map((tab) => (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className="shrink-0 border-b-2 border-transparent pb-3 data-[state=active]:border-destaque data-[state=active]:text-foreground"
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="about" className="pt-4">
            <AboutTab venue={venue} />
          </Tabs.Content>
          <Tabs.Content value="events" className="space-y-4 pt-4">
            {eventsLoading && <p className="text-sm text-muted">Carregando...</p>}
            {events?.length === 0 && (
              <div className="rounded-2xl border border-border bg-surface p-6 text-center">
                <p className="font-semibold">Nenhum evento marcado aqui ainda.</p>
                <p className="mt-1 text-sm text-muted">Vai rolar algo? Crie o primeiro evento neste lugar.</p>
                <Button className="mt-4" onClick={() => navigate('/events/create')}>
                  Criar evento
                </Button>
              </div>
            )}
            {events?.map((event) => <EventCard key={event.id} event={event} />)}
          </Tabs.Content>
          <Tabs.Content value="location" className="pt-4">
            <LocationTab venue={venue} />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
