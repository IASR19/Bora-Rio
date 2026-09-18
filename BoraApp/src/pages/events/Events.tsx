import * as Tabs from '@radix-ui/react-tabs';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { eventsService } from '@/services/events.service';
import type { BoraEvent } from '@/types/domain';
import { cn } from '@/utils/cn';

const STATUS_LABEL: Record<string, string> = {
  published: 'Publicado',
  pending_review: 'Em análise',
  rejected: 'Rejeitado',
};

function EventRow({ event }: { event: BoraEvent }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/venue/${event.venueId}`)}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-left"
    >
      <div className="h-14 w-14 shrink-0 rounded-xl bg-bora-gradient-soft" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{event.name}</p>
        <p className="text-xs text-muted">
          {event.venue?.name} · {new Date(event.startsAt).toLocaleDateString('pt-BR')}
        </p>
      </div>
      {event.status && event.status !== 'published' && (
        <span className="shrink-0 rounded-full bg-surface-alt px-2.5 py-1 text-[11px] font-semibold text-muted">
          {STATUS_LABEL[event.status]}
        </span>
      )}
    </button>
  );
}

export function Events() {
  const { data } = useQuery({ queryKey: ['events', 'mine'], queryFn: eventsService.mine });
  const { data: createdByMe } = useQuery({ queryKey: ['events', 'created-by-me'], queryFn: eventsService.createdByMe });

  return (
    <div className="bg-background px-5 pt-6">
      <h1 className="text-2xl font-extrabold">Meus eventos</h1>

      <Tabs.Root defaultValue="interested" className="mt-5">
        <Tabs.List className="flex gap-5 overflow-x-auto border-b border-border text-sm font-semibold text-muted">
          {[
            { value: 'interested', label: 'Interessados' },
            { value: 'confirmed', label: 'Confirmados' },
            { value: 'past', label: 'Passados' },
            { value: 'created', label: 'Criados por mim' },
          ].map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className={cn('shrink-0 border-b-2 border-transparent pb-3 data-[state=active]:border-destaque data-[state=active]:text-foreground')}
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

        <Tabs.Content value="created" className="mt-4 space-y-3 pb-6">
          {createdByMe?.length ? (
            createdByMe.map((event) => <EventRow key={event.id} event={event} />)
          ) : (
            <p className="text-sm text-muted">Você ainda não criou nenhum evento.</p>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
