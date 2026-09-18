import { useQuery } from '@tanstack/react-query';

import { eventsService } from '@/services/events.service';
import type { PublicParticipant } from '@/types/domain';

function ParticipantRow({ participant }: { participant: PublicParticipant }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bora-gradient-soft text-sm font-bold text-destaque">
        {participant.avatarUrl ? (
          <img src={participant.avatarUrl} className="h-full w-full rounded-full object-cover" alt={participant.name} />
        ) : (
          participant.name.charAt(0)
        )}
      </div>
      <p className="font-semibold">{participant.name}</p>
    </div>
  );
}

export function WhoIsGoingTab({ eventId }: { eventId: string }) {
  const { data } = useQuery({
    queryKey: ['participants', eventId],
    queryFn: () => eventsService.getParticipants(eventId),
  });

  if (!data) return null;

  const sections = [
    { title: 'Confirmados', list: data.confirmed },
    { title: 'Interessados', list: data.interested },
    { title: 'Check-ins', list: data.checkedIn },
  ];

  return (
    <div className="divide-y divide-border">
      {sections.map((section) =>
        section.list.length ? (
          <div key={section.title} className="pb-3">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">
              {section.title} ({section.list.length})
            </p>
            {section.list.map((p) => (
              <ParticipantRow key={p.id} participant={p} />
            ))}
          </div>
        ) : null,
      )}
      {!data.confirmed.length && !data.interested.length && !data.checkedIn.length && (
        <p className="py-4 text-sm text-muted">Seja o primeiro a demonstrar interesse.</p>
      )}
    </div>
  );
}
