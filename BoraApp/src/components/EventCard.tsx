import { domainLabel } from '@/i18n/domain-label';
import { t, useI18n, getLocale } from '@/i18n';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ScoreBadge } from '@/shared/ui/ScoreBadge';
import type { BoraEvent } from '@/types/domain';

function formatDistance(km?: number | null) {
  if (km == null) return null;
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function EventCard({
  event,
  score,
  distanceKm,
}: {
  event: BoraEvent;
  score?: number;
  distanceKm?: number | null;
}) {
  useI18n();
  const navigate = useNavigate();
  const startsAt = new Date(event.startsAt);
  const time = startsAt.toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit' });
  const isToday = startsAt.toDateString() === new Date().toDateString();
  const day = isToday
    ? t('Hoje')
    : startsAt.toLocaleDateString(getLocale(), { weekday: 'short', day: '2-digit', month: 'short' });

  return (
    <button
      type="button"
      onClick={() => navigate(`/event/${event.id}`)}
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
            <span
              key={domainLabel(genre)}
              className="rounded-full bg-surface-alt px-2.5 py-1 text-[11px] font-medium text-muted"
            >
              {domainLabel(genre)}
            </span>
          ))}
          <span className="rounded-full bg-surface-alt px-2.5 py-1 text-[11px] font-medium text-muted">
            {day} · {time}
          </span>
        </div>
      </div>
    </button>
  );
}
