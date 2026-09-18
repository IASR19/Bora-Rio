import { MapPin } from 'lucide-react';

import type { Venue } from '@/types/domain';

export function LocationTab({ venue }: { venue: Venue }) {
  return (
    <div>
      <div className="flex h-40 items-center justify-center rounded-2xl border border-border bg-surface text-muted">
        <MapPin className="h-6 w-6" />
      </div>
      <p className="mt-3 text-sm text-foreground">{venue.address}</p>
    </div>
  );
}
