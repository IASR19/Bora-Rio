import { Check } from 'lucide-react';
import { useState } from 'react';
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
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <div className="app-shell flex min-h-dvh flex-col justify-between bg-background px-6 pb-10 pt-14">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Assinatura</p>
        <h1 className="mt-1 gradient-text text-3xl font-extrabold">BORA CLUB</h1>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <p className="text-4xl font-extrabold">
            R$ 4,99<span className="text-base font-medium text-muted">/mês</span>
          </p>

          <ul className="mt-6 space-y-3">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bora-gradient">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-3">
        {showComingSoon && (
          <p className="rounded-xl border border-border bg-surface px-4 py-3 text-center text-sm text-muted">
            Pagamentos chegando em breve — comece grátis por enquanto.
          </p>
        )}
        <Button size="lg" className="w-full" onClick={() => setShowComingSoon(true)}>
          Assinar agora
        </Button>
        <Button size="lg" variant="ghost" className="w-full" onClick={() => navigate('/home')}>
          Continuar grátis
        </Button>
        <p className="text-center text-xs text-muted">Talvez depois</p>
      </div>
    </div>
  );
}
