import { t, useI18n } from '@/i18n';
import { ArrowLeft, QrCode } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { checkinsService } from '@/services/checkins.service';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';
import { savePendingCheckin } from '@/utils/pendingCheckin';
import { getDeviceId } from '@/utils/deviceId';
import { isInstalledApp } from '@/pages/landing/isInstalledApp';

export function CheckIn() {
  useI18n();
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tokenFromLink = searchParams.get('t');
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const performCheckIn = async (qrToken: string) => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      await checkinsService.confirm(eventId, qrToken, getDeviceId());
      navigate(`/checkin/${eventId}/confirmed`, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && /QR code inválido ou expirado/i.test(err.sourceMessage)) {
        setError('Esse QR expirou. Aponte a câmera para o QR do estabelecimento de novo.');
      } else {
        setError(err instanceof ApiError ? err.sourceMessage : 'Não foi possível confirmar o check-in.');
      }
    } finally {
      setLoading(false);
    }
  };

  // O QR do estabelecimento é um link com ?t=<token>: ao abrir, confirma sozinho (uma vez).
  const autoRan = useRef(false);
  useEffect(() => {
    if (authLoading || autoRan.current || !eventId || !tokenFromLink) return;
    if (!user) {
      savePendingCheckin(`${location.pathname}${location.search}`);
      navigate('/login', { replace: true });
      return;
    }
    autoRan.current = true;
    void performCheckIn(tokenFromLink);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, eventId, tokenFromLink]);

  return (
    <div className="app-shell flex min-h-dvh flex-col bg-background px-6 pb-10 pt-6">
      <button
        type="button"
        aria-label={t('Voltar')}
        onClick={() => navigate(-1)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="mt-8 flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-extrabold">{t('Faça seu check-in')}</h1>
        <p className="mt-2 text-sm text-muted">{t('Aponte a câmera do seu celular para o QR Code do estabelecimento.')}</p>

        <div className="mt-8 flex h-56 w-56 items-center justify-center rounded-2xl border-2 border-dashed border-border">
          <QrCode className="h-16 w-16 text-muted" />
        </div>

        {error && <p className="mt-4 text-sm text-destaque">{t(error)}</p>}

        {loading && <p className="mt-6 text-sm font-semibold">{t('Validando...')}</p>}

        {isInstalledApp() && (
          <Button className="mt-6 w-full" onClick={() => navigate('/scan')}>
            <QrCode className="h-5 w-5" /> {t('Escanear QR')}
          </Button>
        )}

        <div className="mt-6 flex w-full items-center gap-2">
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder={t('Inserir código manualmente')}
            className="h-12 flex-1 rounded-xl border border-border bg-surface px-4 text-sm outline-none"
          />
          <Button variant="outline" onClick={() => performCheckIn(manualCode)} disabled={!manualCode || loading}>
            {' '}
            {t('Validar')}{' '}
          </Button>
        </div>
      </div>
    </div>
  );
}
