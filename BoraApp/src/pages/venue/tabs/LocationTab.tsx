import { MapPin } from 'lucide-react';
import { lazy, Suspense } from 'react';

import type { Venue } from '@/types/domain';

// Leaflet é pesado (~350kb) — só carrega quando a aba "Local" é aberta.
const VenueMap = lazy(() => import('@/components/VenueMap').then((m) => ({ default: m.VenueMap })));

export function LocationTab({ venue }: { venue: Venue }) {
  return (
    <div>
      <Suspense
        fallback={
          <div className="flex h-56 items-center justify-center rounded-2xl border border-border bg-surface text-muted">
            <MapPin className="h-6 w-6 animate-pulse" />
          </div>
        }
      >
        <VenueMap venues={[venue]} zoom={15} heightClassName="h-56" interactive={false} />
      </Suspense>
      <p className="mt-3 text-sm text-foreground">{venue.address}</p>
    </div>
  );
}
