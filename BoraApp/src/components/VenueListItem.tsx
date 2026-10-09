import { MapPin } from 'lucide-react';

import { venueCategoryLabel } from '@/shared/constants/venue-categories';
import { CoverImage } from '@/shared/ui/CoverImage';
import { ScoreBadge } from '@/shared/ui/ScoreBadge';
import type { Venue } from '@/types/domain';

export function VenueListItem({ venue, onClick }: { venue: Venue; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-left"
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-bora-gradient-soft">
        <CoverImage src={venue.coverImageUrl} alt="" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{venue.name}</p>
        <p className="flex items-center gap-1 text-xs text-muted">
          <MapPin className="h-3 w-3" />
          {venue.distanceKm != null ? `${venue.distanceKm.toFixed(1)} km` : venue.city}
        </p>
        <p className="mt-1 text-xs text-muted">
          {venueCategoryLabel(venue.category)} · {venue.priceRange}
        </p>
      </div>
      {venue.boraScore != null && <ScoreBadge score={venue.boraScore} className="h-11 w-11" />}
    </button>
  );
}
