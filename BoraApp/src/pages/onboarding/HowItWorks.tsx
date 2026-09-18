import { Compass, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/shared/ui/Button';

const steps = [
  { number: '01', title: 'DESCUBRA', desc: 'Bares, restaurantes, festas, eventos e experiências.', icon: Compass },
  { number: '02', title: 'CONECTE-SE', desc: 'Veja pessoas que também pretendem ir.', icon: Users },
  { number: '03', title: 'VÁ', desc: 'Confirme sua presença, faça check-in e aproveite.', icon: MapPin },
];

export function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="app-shell flex min-h-dvh flex-col justify-between bg-background px-6 pb-10 pt-16">
      <div>
        <h1 className="text-2xl font-extrabold">Como funciona</h1>
        <div className="mt-8 space-y-6">
          {steps.map(({ number, title, desc, icon: Icon }) => (
            <div key={number} className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bora-gradient-soft text-destaque">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-muted">{number}</p>
                <p className="font-bold">{title}</p>
                <p className="mt-1 text-sm text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button size="lg" className="w-full" onClick={() => navigate('/permissions')}>
        Continuar
      </Button>
    </div>
  );
}
