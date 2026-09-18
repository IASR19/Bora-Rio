import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Gift } from 'lucide-react';
import { useState } from 'react';

import { rewardsService } from '@/services/rewards.service';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';

export function BenefitsTab({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<{ rewardId: string; message: string } | null>(null);

  const { data: rewards } = useQuery({
    queryKey: ['rewards', eventId],
    queryFn: () => rewardsService.getByEvent(eventId),
  });

  const { data: redeemedIds } = useQuery({
    queryKey: ['rewards', eventId, 'redemptions', 'mine'],
    queryFn: () => rewardsService.myRedemptions(eventId),
  });

  const handleRedeem = async (rewardId: string) => {
    setPendingId(rewardId);
    setError(null);
    try {
      await rewardsService.redeem(rewardId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['rewards', eventId] }),
        queryClient.invalidateQueries({ queryKey: ['rewards', eventId, 'redemptions', 'mine'] }),
      ]);
    } catch (err) {
      setError({ rewardId, message: err instanceof ApiError ? err.message : 'Não foi possível resgatar agora.' });
    } finally {
      setPendingId(null);
    }
  };

  if (!rewards?.length) return <p className="text-sm text-muted">Nenhum benefício disponível para este evento.</p>;

  return (
    <div className="space-y-3">
      {rewards.map((reward) => {
        const redeemed = redeemedIds?.includes(reward.id);
        const soldOut = reward.quantityRedeemed >= reward.quantityTotal;
        return (
          <div key={reward.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bora-gradient-soft text-destaque">
              <Gift className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{reward.title}</p>
              <p className="text-xs text-muted">
                Válido {reward.validFrom.slice(0, 5)}–{reward.validUntil.slice(0, 5)} ·{' '}
                {reward.quantityTotal - reward.quantityRedeemed} disponíveis
              </p>
              {error?.rewardId === reward.id && <p className="mt-1 text-xs text-destaque">{error.message}</p>}
            </div>
            <Button
              size="sm"
              variant={redeemed ? 'outline' : 'gradient'}
              disabled={redeemed || soldOut || pendingId === reward.id}
              onClick={() => handleRedeem(reward.id)}
            >
              {redeemed ? 'Resgatado' : soldOut ? 'Esgotado' : pendingId === reward.id ? 'Resgatando...' : 'Resgatar'}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
