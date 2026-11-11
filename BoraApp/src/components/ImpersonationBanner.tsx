import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/i18n';

/**
 * Faixa fixa no topo enquanto um admin está dentro da conta de outra pessoa (acesso de suporte):
 * deixa claro de quem é a conta na tela e é o único caminho de volta para a conta do admin.
 */
export function ImpersonationBanner() {
  const { user, stopImpersonation } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = Boolean(user?.impersonation);

  // As telas ocupam a altura toda (`min-h-dvh`): desconta a faixa para não sobrar rolagem.
  useEffect(() => {
    const banner = ref.current;
    if (!active || !banner) return;
    const root = document.documentElement;
    const sync = () => root.style.setProperty('--support-banner-height', `${banner.offsetHeight}px`);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(banner);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--support-banner-height');
    };
  }, [active]);

  if (!user?.impersonation) return null;

  const leave = async () => {
    setLeaving(true);
    try {
      await stopImpersonation();
      navigate('/admin', { replace: true });
    } catch {
      navigate('/login', { replace: true });
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div
      ref={ref}
      role="status"
      className="sticky top-0 z-[60] flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-destaque px-4 py-2 text-center text-sm font-semibold text-white"
    >
      <span className="flex min-w-0 items-center gap-2">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span className="truncate">{t('Acesso de suporte: você está na conta de {name}', { name: user.name })}</span>
      </span>
      <button
        type="button"
        onClick={leave}
        disabled={leaving}
        className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-destaque disabled:opacity-60"
      >
        {t(leaving ? 'Saindo...' : 'Voltar para minha conta')}
      </button>
    </div>
  );
}
