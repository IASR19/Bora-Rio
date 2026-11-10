import { t, useI18n } from '@/i18n';
import { Compass, MapPin, PartyPopper, QrCode, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { isInstalledApp } from '@/pages/landing/isInstalledApp';

const ACTIONS = [
  { label: 'BORA agora', icon: PartyPopper, to: '/explore' },
  { label: 'Procurar lugar', icon: MapPin, to: '/explore' },
  { label: 'Procurar evento', icon: Compass, to: '/explore' },
  { label: 'Experiências', icon: Sparkles, to: '/explore' },
  { label: 'Check-in', icon: QrCode, to: '/events' },
];

export function BoraQuickActions() {
  useI18n();
  const navigate = useNavigate();
  const actions = isInstalledApp()
    ? ACTIONS.map((a) => (a.label === 'Check-in' ? { ...a, label: 'Escanear QR', to: '/scan' } : a))
    : ACTIONS;

  return (
    <div className="app-shell flex min-h-dvh flex-col justify-end bg-black/60 px-4 pb-28" onClick={() => navigate(-1)}>
      <div className="space-y-2 rounded-2xl border border-border bg-surface p-3" onClick={(e) => e.stopPropagation()}>
        {actions.map(({ label, icon: Icon, to }) => (
          <button
            key={t(label)}
            onClick={() => navigate(to)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-semibold hover:bg-surface-alt"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bora-gradient-soft text-destaque">
              <Icon className="h-5 w-5" />
            </span>
            {t(label)}
          </button>
        ))}
      </div>
    </div>
  );
}
