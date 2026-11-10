import { t, useI18n } from '@/i18n';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/shared/ui/Button';

const BENEFITS = [
  'Participe de experiências',
  'Veja quem vai',
  'Faça check-in',
  'Receba benefícios',
  'Entre em grupos',
  'E muito mais',
];

export function BoraClub() {
  useI18n();
  const navigate = useNavigate();

  return (
    <div className="app-shell flex min-h-dvh flex-col justify-between bg-background px-6 pb-10 pt-14">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted">{t('Assinatura')}</p>
        <h1 className="mt-1 gradient-text text-3xl font-extrabold">BORA CLUB</h1>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
          {/* Sem preço enquanto não houver pagamento integrado. */}
          <span className="inline-flex rounded-full bg-bora-gradient-soft px-3 py-1 text-xs font-bold uppercase tracking-widest text-destaque">
            {t('Em breve')}
          </span>
          <p className="mt-3 text-sm text-muted">{t('Chega em breve. Por enquanto, tudo no BORA é de graça.')}</p>

          <ul className="mt-6 space-y-3">
            {BENEFITS.map((benefit) => (
              <li key={t(benefit)} className="flex items-center gap-3 text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bora-gradient">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
                {t(benefit)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Button size="lg" className="w-full" onClick={() => navigate('/home')}>
        {t('Continuar grátis')}
      </Button>
    </div>
  );
}
