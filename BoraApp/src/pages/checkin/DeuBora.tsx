import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { eventsService } from '@/services/events.service';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/utils/cn';

export function DeuBora() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data } = useQuery({
    queryKey: ['participants', eventId],
    queryFn: () => eventsService.getParticipants(eventId!),
    enabled: !!eventId,
  });

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const people = data?.checkedIn ?? [];

  return (
    <div className="app-shell min-h-dvh bg-background px-6 pb-10 pt-10">
      <h1 className="text-2xl font-extrabold leading-tight">Quem você gostaria de encontrar novamente?</h1>

      <div className="mt-6 space-y-2">
        {people.map((person) => (
          <button
            key={person.id}
            onClick={() => toggle(person.id)}
            className={cn(
              'flex w-full items-center justify-between rounded-2xl border p-3 text-left transition-colors',
              selected.has(person.id) ? 'border-destaque bg-bora-gradient-soft' : 'border-border bg-surface',
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-alt text-sm font-bold">
                {person.name.charAt(0)}
              </div>
              <p className="font-semibold">{person.name}</p>
            </div>
            <Heart className={cn('h-5 w-5', selected.has(person.id) ? 'fill-destaque text-destaque' : 'text-muted')} />
          </button>
        ))}
        {!people.length && <p className="text-sm text-muted">Ninguém fez check-in ainda.</p>}
      </div>

      <Button size="lg" className="mt-10 w-full" disabled={!selected.size} onClick={() => navigate('/home')}>
        Enviar interesse
      </Button>
      <p className="mt-3 text-center text-xs text-muted">
        Se houver interesse mútuo, o chat é liberado automaticamente.
      </p>
    </div>
  );
}
