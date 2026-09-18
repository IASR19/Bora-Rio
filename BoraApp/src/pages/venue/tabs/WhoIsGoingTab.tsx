import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { eventsService } from '@/services/events.service';
import { followsService } from '@/services/follows.service';
import type { PublicParticipant } from '@/types/domain';

function ParticipantRow({
  participant,
  isFollowing,
  isMe,
  onToggle,
}: {
  participant: PublicParticipant;
  isFollowing: boolean;
  isMe: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bora-gradient-soft text-sm font-bold text-destaque">
          {participant.avatarUrl ? (
            <img src={participant.avatarUrl} className="h-full w-full rounded-full object-cover" alt={participant.name} />
          ) : (
            participant.name.charAt(0)
          )}
        </div>
        <p className="font-semibold">{participant.name}</p>
      </div>
      {!isMe && (
        <button
          onClick={onToggle}
          className={
            isFollowing
              ? 'rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-muted'
              : 'rounded-full bg-bora-gradient px-4 py-1.5 text-xs font-semibold text-white'
          }
        >
          {isFollowing ? 'Seguindo' : 'Seguir'}
        </button>
      )}
    </div>
  );
}

export function WhoIsGoingTab({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['participants', eventId],
    queryFn: () => eventsService.getParticipants(eventId),
  });

  const { data: followingIds } = useQuery({
    queryKey: ['follows', 'mine'],
    queryFn: followsService.mine,
  });

  const handleToggle = async (participantId: string) => {
    if (pendingId) return;
    setPendingId(participantId);
    const following = followingIds?.includes(participantId);
    try {
      await (following ? followsService.unfollow(participantId) : followsService.follow(participantId));
      await queryClient.invalidateQueries({ queryKey: ['follows', 'mine'] });
    } finally {
      setPendingId(null);
    }
  };

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
              <ParticipantRow
                key={p.id}
                participant={p}
                isMe={p.id === user?.id}
                isFollowing={Boolean(followingIds?.includes(p.id))}
                onToggle={() => handleToggle(p.id)}
              />
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
