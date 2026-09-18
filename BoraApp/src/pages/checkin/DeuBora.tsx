import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { deuBoraService } from '@/services/deu-bora.service';
import { eventsService } from '@/services/events.service';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/utils/cn';

export function DeuBora() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [matchedWith, setMatchedWith] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = async () => {
    if (!eventId || !selected.size) return;
    setSubmitting(true);
    try {
      const results = await Promise.all(
        Array.from(selected).map((toUserId) =>
          deuBoraService
            .submitInterest(eventId, toUserId)
            .then((result) => (result.matched ? toUserId : null))
            .catch(() => null),
        ),
      );
      setMatchedWith(results.filter((id): id is string => Boolean(id)));
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const matchedNames = people.filter((p) => matchedWith.includes(p.id)).map((p) => p.name);
    return (
      <div className="app-shell flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
        {matchedNames.length ? (
          <>
            <p className="text-3xl">🎉❤️</p>
            <h1 className="mt-3 text-2xl font-extrabold">Deu Bora com {matchedNames.join(', ')}!</h1>
            <p className="mt-2 text-sm text-muted">O interesse foi mútuo — o chat já está liberado.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold">Interesse enviado</h1>
            <p className="mt-2 text-sm text-muted">
              Se a pessoa também demonstrar interesse em você, o chat é liberado automaticamente.
            </p>
          </>
        )}
        <Button size="lg" className="mt-8 w-full" onClick={() => navigate('/matches')}>
          Ver conexões
        </Button>
      </div>
    );
  }

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

      <Button size="lg" className="mt-10 w-full" disabled={!selected.size || submitting} onClick={handleSubmit}>
        {submitting ? 'Enviando...' : 'Enviar interesse'}
      </Button>
      <p className="mt-3 text-center text-xs text-muted">
        Se houver interesse mútuo, o chat é liberado automaticamente.
      </p>
    </div>
  );
}
