import { t, useI18n } from '@/i18n';
import { useQuery } from '@tanstack/react-query';
import { Check, Clock, Download, MapPin, ScanLine, Share, X } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { isInstalledApp } from '@/pages/landing/isInstalledApp';
import { type PromoClaim, type PromoPublic, promosService } from '@/services/promos.service';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';
import { getDeviceId } from '@/utils/deviceId';
import { savePromoOrigin } from '@/utils/promoOrigin';

const TZ = 'America/Sao_Paulo';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

function formatTime(iso: string, locale: string, seconds = false) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    ...(seconds ? { second: '2-digit' } : {}),
    hourCycle: 'h23',
  }).format(new Date(iso));
}

function summary(promo: PromoPublic, locale: string): string {
  if (promo.kind === 'fixed_price' && promo.priceCents != null) {
    const price = new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(promo.priceCents / 100);
    return t('{title} a {price}', { title: promo.title, price });
  }
  if (promo.kind === 'percent_off' && promo.percentOff != null) {
    return t('{title} {percent}% OFF', { title: promo.title, percent: promo.percentOff });
  }
  return promo.title;
}

function claimErrorMessage(err: unknown): string {
  // ApiError.message já vem traduzido (inclusive mensagens com horário).
  return err instanceof ApiError ? err.message : t('Não foi possível resgatar agora. Tente novamente em instantes.');
}

function Shell({ children, className }: { children: ReactNode; className: string }) {
  return (
    <div className={`app-shell relative flex min-h-dvh flex-col items-center overflow-hidden px-6 pb-10 pt-10 ${className}`}>
      {children}
    </div>
  );
}

/** Cartão da promoção com a cara do Bora (sem login). */
function PromoCard({ promo, locale }: { promo: PromoPublic; locale: string }) {
  const date = new Intl.DateTimeFormat(locale, { timeZone: TZ, day: '2-digit', month: 'long' }).format(
    new Date(promo.event.startsAt),
  );
  return (
    <div className="w-full overflow-hidden rounded-3xl bg-bora-gradient p-6 text-white shadow-glow">
      <img src="/logo.png" alt="BORA" className="h-10 w-auto" />
      <p className="mt-5 text-3xl font-extrabold leading-tight">{summary(promo, locale)}</p>
      {promo.description && <p className="mt-2 text-sm text-white/85">{promo.description}</p>}
      <div className="mt-5 space-y-2 text-sm font-semibold">
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4" /> {promo.venue.name}
        </p>
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {t('das {from} às {to}', { from: promo.validFrom, to: promo.validUntil })} · {date}
        </p>
        <p className="text-white/85">{promo.event.title}</p>
      </div>
      {(promo.soldOut || !promo.availableNow) && (
        <p className="mt-5 rounded-xl bg-black/30 px-3 py-2 text-sm font-bold">
          {promo.soldOut
            ? t('Esgotado')
            : t('Promoção válida em {date}, das {from} às {to}.', {
                date,
                from: promo.validFrom,
                to: promo.validUntil,
              })}
        </p>
      )}
    </div>
  );
}

function InstallHint() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (isInstalledApp()) return null;
  if (!prompt && !ios) return null;

  return (
    <div className="mt-5 w-full rounded-2xl border border-border bg-surface p-4 text-center text-sm">
      {prompt ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void prompt.prompt();
            setPrompt(null);
          }}
        >
          <Download className="h-4 w-4" /> {t('Instalar o app')}
        </Button>
      ) : (
        <>
          <p className="flex flex-wrap items-center justify-center gap-1 font-semibold">
            <Share className="h-4 w-4" /> {t('Toque em Compartilhar → Adicionar à Tela de Início')}
          </p>
          <p className="mt-2 text-xs text-muted">{t('Dica: abra pelo app instalado para resgatar mais rápido.')}</p>
        </>
      )}
    </div>
  );
}

function ScanAgainButton() {
  const navigate = useNavigate();
  if (!isInstalledApp()) return null;
  return (
    <Button className="mt-6" onClick={() => navigate('/scan')}>
      <ScanLine className="h-5 w-5" /> {t('Escanear QR')}
    </Button>
  );
}

function GiftActive({ claim, locale }: { claim: Extract<PromoClaim, { kind: 'gift' }>; locale: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const expiresMs = claim.expiresAt ? new Date(claim.expiresAt).getTime() : null;
  const remaining = expiresMs == null ? null : Math.max(0, Math.floor((expiresMs - now) / 1000));
  const nowIso = new Date(now).toISOString();

  if (remaining === 0) {
    return (
      <Shell className="bg-gradient-to-b from-zinc-700 to-zinc-900 text-white">
        <Clock className="mt-16 h-20 w-20 text-zinc-300" />
        <h1 className="mt-6 text-center text-2xl font-extrabold">{t('Seu tempo acabou.')}</h1>
        <p className="mt-3 text-center text-sm text-zinc-200">
          {t('Se a promoção ainda estiver valendo, leia o QR de novo para gerar outro.')}
        </p>
        <ScanAgainButton />
      </Shell>
    );
  }

  const mm = remaining == null ? '' : String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = remaining == null ? '' : String(remaining % 60).padStart(2, '0');

  return (
    <Shell className="bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-800 text-white">
      <style>{`
        @keyframes bora-sweep { 0% { transform: translateX(-120%); } 100% { transform: translateX(220%); } }
        @keyframes bora-pulse { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
      `}</style>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden">
        <div
          className="absolute inset-y-0 w-1/3 -skew-x-12 bg-white/15 blur-md"
          style={{ animation: 'bora-sweep 3.2s linear infinite' }}
        />
      </div>

      <div className="relative flex w-full flex-col items-center text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-emerald-600 shadow-lg">
          <Check className="h-14 w-14" strokeWidth={3} />
        </div>
        <p className="mt-5 text-sm font-bold uppercase tracking-widest text-emerald-100">{t('Benefício a ser resgatado')}</p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight">{claim.title}</h1>

        <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-emerald-100">{t('Seu código Bora')}</p>
        <p className="mt-1 break-all font-mono text-4xl font-black tracking-[0.2em]">{claim.publicCode}</p>
        <p className="mt-3 text-sm font-semibold">{t('Mostre esta tela no balcão')}</p>

        {claim.expiresAt && (
          <div className="mt-8 rounded-2xl bg-black/25 px-6 py-4">
            <p className="text-sm font-semibold">{t('Válido até {time}', { time: formatTime(claim.expiresAt, locale) })}</p>
            <p className="mt-1 font-mono text-4xl font-black tabular-nums">
              {mm}:{ss}
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center gap-2 font-mono text-lg font-bold tabular-nums">
          <span className="h-2.5 w-2.5 rounded-full bg-white" style={{ animation: 'bora-pulse 1s ease-in-out infinite' }} />
          {formatTime(nowIso, locale, true)}
        </div>
      </div>
    </Shell>
  );
}

function ClaimView({ claim, promo, locale }: { claim: PromoClaim; promo: PromoPublic; locale: string }) {
  if (claim.status === 'info') {
    return (
      <Shell className="bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-800 text-white">
        <div className="mt-8 flex h-24 w-24 items-center justify-center rounded-full bg-white text-emerald-600">
          <Check className="h-14 w-14" strokeWidth={3} />
        </div>
        <h1 className="mt-6 text-center text-3xl font-extrabold leading-tight">{summary(promo, locale)}</h1>
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold">
          <MapPin className="h-4 w-4" /> {promo.venue.name}
        </p>
        <p className="mt-1 text-sm font-semibold">{t('das {from} às {to}', { from: promo.validFrom, to: promo.validUntil })}</p>
        <p className="mt-8 rounded-full bg-black/25 px-6 py-3 text-lg font-extrabold">{t('Peça no balcão')}</p>
      </Shell>
    );
  }

  if (claim.status === 'delivered') {
    return (
      <Shell className="bg-gradient-to-b from-red-600 to-red-900 text-white">
        <div className="mt-12 flex h-24 w-24 items-center justify-center rounded-full bg-white text-red-600">
          <X className="h-14 w-14" strokeWidth={3} />
        </div>
        <h1 className="mt-6 text-center text-2xl font-extrabold">{t('Você já resgatou este benefício.')}</h1>
        <p className="mt-2 text-center text-base">{claim.title}</p>
        {claim.deliveredAt && (
          <p className="mt-4 text-sm font-semibold">{t('Entregue às {time}', { time: formatTime(claim.deliveredAt, locale) })}</p>
        )}
      </Shell>
    );
  }

  if (claim.status === 'expired') {
    return (
      <Shell className="bg-gradient-to-b from-zinc-600 to-zinc-900 text-white">
        <Clock className="mt-16 h-20 w-20 text-zinc-300" />
        <h1 className="mt-6 text-center text-2xl font-extrabold">{t('Esta promoção já encerrou.')}</h1>
        <p className="mt-2 text-center text-base">{claim.title}</p>
        <p className="mt-4 text-sm font-semibold">{t('Encerrou às {time}', { time: promo.validUntil })}</p>
      </Shell>
    );
  }

  return <GiftActive claim={claim} locale={locale} />;
}

export function Promo() {
  const { locale } = useI18n();
  const { code = '' } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const promoQuery = useQuery({
    queryKey: ['promo', code],
    queryFn: () => promosService.get(code),
    retry: false,
  });

  const [claim, setClaim] = useState<PromoClaim | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const scanned = useRef(false);
  const claimed = useRef(false);

  const canClaim = !!user && user.accountType !== 'business' && user.emailVerified;

  // Leitura do QR (uma vez por abertura, já com o token se a pessoa estiver logada).
  useEffect(() => {
    if (authLoading || scanned.current || !code) return;
    scanned.current = true;
    void promosService.recordScan(code, getDeviceId()).catch(() => undefined);
    if (!user) savePromoOrigin(code);
  }, [authLoading, code, user]);

  // Resgate (uma vez, mesmo com StrictMode).
  useEffect(() => {
    if (authLoading || !canClaim || claimed.current || !code) return;
    claimed.current = true;
    promosService
      .claim(code)
      .then(setClaim)
      .catch((err) => {
        if (err instanceof ApiError && err.errorCode === 'EMAIL_NOT_VERIFIED') setNeedsVerification(true);
        else setClaimError(claimErrorMessage(err));
      });
  }, [authLoading, canClaim, code]);

  if (promoQuery.isLoading || authLoading) {
    return <Shell className="bg-background text-foreground">{null}</Shell>;
  }

  if (promoQuery.isError || !promoQuery.data) {
    const notFound = promoQuery.error instanceof ApiError && promoQuery.error.status === 404;
    return (
      <Shell className="bg-background text-foreground">
        <h1 className="mt-24 text-center text-2xl font-extrabold">
          {notFound ? t('Promoção não encontrada') : t('Não foi possível carregar a promoção.')}
        </h1>
        <Button className="mt-8" variant="outline" onClick={() => navigate('/')}>
          {t('Voltar')}
        </Button>
      </Shell>
    );
  }

  const promo = promoQuery.data;

  if (user && claim) return <ClaimView claim={claim} promo={promo} locale={locale} />;

  return (
    <Shell className="bg-background text-foreground">
      <PromoCard promo={promo} locale={locale} />

      {!user && (
        <>
          <p className="mt-5 w-full rounded-2xl border-2 border-destaque bg-destaque/10 p-4 text-center text-sm font-bold">
            {t('Depois de entrar, leia o QR de novo para resgatar.')}
          </p>
          <div className="mt-5 flex w-full flex-col gap-3">
            <Button onClick={() => navigate('/register?tipo=usuario')}>{t('Cadastre-se')}</Button>
            <Button variant="outline" onClick={() => navigate('/login')}>
              {t('Entrar')}
            </Button>
          </div>
          <InstallHint />
        </>
      )}

      {user?.accountType === 'business' && (
        <p className="mt-6 text-center text-sm font-semibold text-muted">
          {t('Contas de estabelecimento não resgatam promoções.')}
        </p>
      )}

      {user && user.accountType !== 'business' && (!user.emailVerified || needsVerification) && (
        <Button className="mt-6 w-full" onClick={() => navigate('/verification', { state: { next: `/p/${code}` } })}>
          {t('Confirme seu e-mail para resgatar')}
        </Button>
      )}

      {canClaim && !claimError && <p className="mt-6 text-sm text-muted">{t('Validando...')}</p>}
      {claimError && (
        <p className="mt-6 w-full rounded-2xl border border-destaque p-4 text-center text-sm font-semibold text-destaque">
          {claimError}
        </p>
      )}
    </Shell>
  );
}
