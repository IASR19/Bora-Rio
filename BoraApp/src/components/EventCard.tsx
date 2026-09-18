import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ScoreBadge } from '@/shared/ui/ScoreBadge';
import type { BoraEvent } from '@/types/domain';

function formatDistance(km?: number | null) {
  if (km == null) return null;
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function EventCard({ event, score, distanceKm }: { event: BoraEvent; score?: number; distanceKm?: number | null }) {
  const navigate = useNavigate();
  const time = new Date(event.startsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <button
      type="button"
      onClick={() => navigate(`/venue/${event.venueId}`, { state: { eventId: event.id } })}
      className="block w-full overflow-hidden rounded-2xl border border-border bg-surface text-left"
    >
      <div className="relative h-36 w-full bg-bora-gradient-soft">
        {event.coverImageUrl && (
          <img src={event.coverImageUrl} alt={event.name} className="h-full w-full object-cover" />
        )}
        {score != null && <ScoreBadge score={score} className="absolute right-3 top-3 h-11 w-11" />}
      </div>
      <div className="p-4">
        <p className="font-bold leading-tight">{event.name}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5" />
          {event.venue?.name}
          {distanceKm != null && ` · ${formatDistance(distanceKm)}`}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {event.musicGenres.slice(0, 2).map((genre) => (
            <span key={genre} className="rounded-full bg-surface-alt px-2.5 py-1 text-[11px] font-medium text-muted">
              {genre}
            </span>
          ))}
          <span className="rounded-full bg-surface-alt px-2.5 py-1 text-[11px] font-medium text-muted">Hoje · {time}</span>
        </div>
      </div>
    </button>
  );
}
