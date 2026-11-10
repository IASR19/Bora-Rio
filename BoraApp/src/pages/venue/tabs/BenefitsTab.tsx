import { getLocale, t, useI18n } from '@/i18n';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Gift } from 'lucide-react';
import { useState } from 'react';

import { rewardsService } from '@/services/rewards.service';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';

export function BenefitsTab({ eventId }: { eventId: string }) {
  useI18n();
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
      setError({ rewardId, message: err instanceof ApiError ? err.sourceMessage : 'Não foi possível resgatar agora.' });
    } finally {
      setPendingId(null);
    }
  };

  if (!rewards?.length)
    return <p className="text-sm text-muted">{t('Nenhuma promoção disponível para este evento.')}</p>;

  return (
    <div className="space-y-3">
      {rewards.map((reward) => {
        const from = reward.validFrom.slice(0, 5);
        const until = reward.validUntil.slice(0, 5);
        const hours =
          from === '00:00' ? `${t('até')} ${until}` : `${t('das')} ${from} ${t('às')} ${until}`;

        if (reward.kind === 'fixed_price' || reward.kind === 'percent_off') {
          const badge =
            reward.kind === 'fixed_price'
              ? new Intl.NumberFormat(getLocale(), { style: 'currency', currency: 'BRL' }).format(
                  (reward.priceCents ?? 0) / 100,
                )
              : t('{percent}% OFF', { percent: reward.percentOff ?? 0 });
          return (
            <div key={reward.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
              <span className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-xl bg-bora-gradient-soft px-2 text-sm font-extrabold text-destaque">
                {badge}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{reward.title}</p>
                {reward.description && <p className="text-xs text-muted">{reward.description}</p>}
                <p className="text-xs text-muted">
                  {t('Válido')} {hours}
                </p>
              </div>
            </div>
          );
        }

        const redeemed = redeemedIds?.includes(reward.id);
        const soldOut = reward.quantityTotal !== null && reward.quantityRedeemed >= reward.quantityTotal;
        return (
          <div key={reward.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bora-gradient-soft text-destaque">
              <Gift className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{reward.title}</p>
              {reward.description && <p className="text-xs text-muted">{reward.description}</p>}
              <p className="text-xs text-muted">
                {t('Válido')} {hours}
                {reward.quantityTotal !== null && (
                  <>
                    {' · '}
                    {reward.quantityTotal - reward.quantityRedeemed} {t('disponíveis')}
                  </>
                )}
              </p>
              {error?.rewardId === reward.id && <p className="mt-1 text-xs text-destaque">{t(error.message)}</p>}
            </div>
            <Button
              size="sm"
              variant={redeemed ? 'outline' : 'gradient'}
              disabled={redeemed || soldOut || pendingId === reward.id}
              onClick={() => handleRedeem(reward.id)}
            >
              {redeemed
                ? t('Resgatado')
                : soldOut
                  ? t('Esgotado')
                  : pendingId === reward.id
                    ? t('Resgatando...')
                    : t('Resgatar')}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
