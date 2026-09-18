import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Gift } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { eventsService } from '@/services/events.service';
import { rewardsService } from '@/services/rewards.service';
import { Button } from '@/shared/ui/Button';

export function CheckInConfirmed() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsService.getById(eventId!),
    enabled: !!eventId,
  });

  const { data: rewards } = useQuery({
    queryKey: ['rewards', eventId],
    queryFn: () => rewardsService.getByEvent(eventId!),
    enabled: !!eventId,
  });

  const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="app-shell flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bora-gradient shadow-glow">
        <CheckCircle2 className="h-10 w-10 text-white" />
      </div>
      <h1 className="mt-6 text-2xl font-extrabold">Check-in confirmado</h1>
      <p className="mt-1 font-semibold">{event?.name}</p>
      <p className="text-sm text-muted">Check-in: {time}</p>

      {rewards?.[0] && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
          <Gift className="h-6 w-6 text-destaque" />
          <div className="text-left">
            <p className="text-xs text-muted">Benefício liberado</p>
            <p className="font-bold">{rewards[0].title}</p>
          </div>
        </div>
      )}

      <Button size="lg" className="mt-10 w-full" onClick={() => navigate('/home')}>
        Aproveitar a experiência
      </Button>
    </div>
  );
}
