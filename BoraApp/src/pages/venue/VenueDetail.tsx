import * as Tabs from '@radix-ui/react-tabs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Heart, MapPin, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { eventsService } from '@/services/events.service';
import { favoritesService } from '@/services/favorites.service';
import { venuesService } from '@/services/venues.service';
import { Button } from '@/shared/ui/Button';
import { ScoreBadge } from '@/shared/ui/ScoreBadge';
import { cn } from '@/utils/cn';

import { BenefitsTab } from './tabs/BenefitsTab';
import { LocationTab } from './tabs/LocationTab';
import { AboutTab } from './tabs/AboutTab';
import { WhoIsGoingTab } from './tabs/WhoIsGoingTab';

export function VenueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [interestState, setInterestState] = useState<'none' | 'interested' | 'confirmed'>('none');
  const [shareCopied, setShareCopied] = useState(false);
  const [favoritePending, setFavoritePending] = useState(false);

  const { data: venue } = useQuery({
    queryKey: ['venue', id],
    queryFn: () => venuesService.getById(id!),
    enabled: !!id,
  });

  const { data: events } = useQuery({
    queryKey: ['events', 'venue', id],
    queryFn: () => eventsService.search({ venueId: id }),
    enabled: !!id,
  });

  const { data: favoriteIds } = useQuery({
    queryKey: ['favorites', 'mine'],
    queryFn: favoritesService.mine,
  });

  const event = events?.[0];
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
    const title = event?.name ?? venue?.name ?? 'BORA';
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url).catch(() => undefined);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleInterested = async () => {
    if (!event) return;
    await eventsService.markInterested(event.id).catch(() => undefined);
    setInterestState('interested');
  };

  const handleConfirmed = async () => {
    if (!event) return;
    await eventsService.markConfirmed(event.id).catch(() => undefined);
    setInterestState('confirmed');
    navigate(`/checkin/${event.id}`);
  };

  if (!venue) return null;

  return (
    <div className="app-shell min-h-dvh bg-background pb-28">
      <div className="relative h-64 w-full bg-bora-gradient-soft">
        {venue.coverImageUrl && <img src={venue.coverImageUrl} className="h-full w-full object-cover" alt={venue.name} />}
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
            <h1 className="text-2xl font-extrabold leading-tight">{event?.name ?? venue.name}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              <MapPin className="h-3.5 w-3.5" />
              {venue.name} · {venue.distanceKm != null ? `${venue.distanceKm.toFixed(1)} km` : venue.city}
            </p>
          </div>
          {venue.boraScore != null && <ScoreBadge score={venue.boraScore} />}
        </div>

        {event && (
          <p className="mt-2 text-sm text-muted">
            {new Date(event.startsAt).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })} ·{' '}
            {new Date(event.startsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {venue.musicGenres.map((g) => (
            <span key={g} className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted">
              {g}
            </span>
          ))}
          {venue.vibes.slice(0, 2).map((v) => (
            <span key={v} className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted">
              {v}
            </span>
          ))}
        </div>

        <Tabs.Root defaultValue="about" className="mt-6">
          <Tabs.List className="flex gap-5 border-b border-border text-sm font-semibold text-muted">
            {[
              { value: 'about', label: 'Sobre' },
              { value: 'who', label: 'Quem vai' },
              { value: 'benefits', label: 'Benefícios' },
              { value: 'location', label: 'Local' },
            ].map((tab) => (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  'border-b-2 border-transparent pb-3 data-[state=active]:border-destaque data-[state=active]:text-foreground',
                )}
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="about" className="pt-4">
            <AboutTab venue={venue} />
          </Tabs.Content>
          <Tabs.Content value="who" className="pt-4">
            {event ? <WhoIsGoingTab eventId={event.id} /> : <p className="text-sm text-muted">Sem evento ativo.</p>}
          </Tabs.Content>
          <Tabs.Content value="benefits" className="pt-4">
            {event ? <BenefitsTab eventId={event.id} /> : <p className="text-sm text-muted">Sem evento ativo.</p>}
          </Tabs.Content>
          <Tabs.Content value="location" className="pt-4">
            <LocationTab venue={venue} />
          </Tabs.Content>
        </Tabs.Root>
      </div>

      {event && (
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[480px] gap-3 border-t border-border bg-background/95 p-4 backdrop-blur">
          <Button variant="outline" className="flex-1" onClick={handleInterested} disabled={interestState !== 'none'}>
            {interestState === 'none' ? 'Tenho interesse' : 'Interessado'}
          </Button>
          <Button className="flex-1" onClick={handleConfirmed}>
            Eu vou
          </Button>
        </div>
      )}
    </div>
  );
}
