import * as Tabs from '@radix-ui/react-tabs';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { eventsService } from '@/services/events.service';
import type { BoraEvent } from '@/types/domain';
import { cn } from '@/utils/cn';

function EventRow({ event }: { event: BoraEvent }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/venue/${event.venueId}`)}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-left"
    >
      <div className="h-14 w-14 shrink-0 rounded-xl bg-bora-gradient-soft" />
      <div className="min-w-0">
        <p className="truncate font-bold">{event.name}</p>
        <p className="text-xs text-muted">
          {event.venue?.name} · {new Date(event.startsAt).toLocaleDateString('pt-BR')}
        </p>
      </div>
    </button>
  );
}

export function Events() {
  const { data } = useQuery({ queryKey: ['events', 'mine'], queryFn: eventsService.mine });

  return (
    <div className="bg-background px-5 pt-6">
      <h1 className="text-2xl font-extrabold">Meus eventos</h1>

      <Tabs.Root defaultValue="interested" className="mt-5">
        <Tabs.List className="flex gap-5 border-b border-border text-sm font-semibold text-muted">
          {[
            { value: 'interested', label: 'Interessados' },
            { value: 'confirmed', label: 'Confirmados' },
            { value: 'past', label: 'Passados' },
          ].map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className={cn('border-b-2 border-transparent pb-3 data-[state=active]:border-destaque data-[state=active]:text-foreground')}
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {(['interested', 'confirmed', 'past'] as const).map((key) => (
          <Tabs.Content key={key} value={key} className="mt-4 space-y-3 pb-6">
            {data?.[key]?.length ? data[key].map((event) => <EventRow key={event.id} event={event} />) : (
              <p className="text-sm text-muted">Nenhum evento por aqui ainda.</p>
            )}
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </div>
  );
}
