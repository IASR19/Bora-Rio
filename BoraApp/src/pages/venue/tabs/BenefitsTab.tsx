import { useQuery } from '@tanstack/react-query';
import { Gift } from 'lucide-react';

import { rewardsService } from '@/services/rewards.service';

export function BenefitsTab({ eventId }: { eventId: string }) {
  const { data: rewards } = useQuery({
    queryKey: ['rewards', eventId],
    queryFn: () => rewardsService.getByEvent(eventId),
  });

  if (!rewards?.length) return <p className="text-sm text-muted">Nenhum benefício disponível para este evento.</p>;

  return (
    <div className="space-y-3">
      {rewards.map((reward) => (
        <div key={reward.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-bora-gradient-soft text-destaque">
            <Gift className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold">{reward.title}</p>
            <p className="text-xs text-muted">
              Válido {reward.validFrom.slice(0, 5)}–{reward.validUntil.slice(0, 5)} · {reward.quantityTotal - reward.quantityRedeemed} disponíveis
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
