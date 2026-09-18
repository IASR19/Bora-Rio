import { ArrowLeft, QrCode } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { checkinsService } from '@/services/checkins.service';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';

function getDeviceId(): string {
  const key = 'bora:device-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function CheckIn() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const performCheckIn = async (qrToken: string) => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      await checkinsService.confirm(eventId, qrToken, getDeviceId());
      navigate(`/checkin/${eventId}/confirmed`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível confirmar o check-in.');
    } finally {
      setLoading(false);
    }
  };

  // Demonstra o fluxo completo: em produção este QR é exibido na tela do estabelecimento.
  const handleSimulateScan = async () => {
    if (!eventId) return;
    const { qrToken } = await checkinsService.getQr(eventId);
    performCheckIn(qrToken);
  };

  return (
    <div className="app-shell flex min-h-dvh flex-col bg-background px-6 pb-10 pt-6">
      <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="mt-8 flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-extrabold">Faça seu check-in</h1>
        <p className="mt-2 text-sm text-muted">Escaneie o QR Code do estabelecimento.</p>

        <div className="mt-8 flex h-56 w-56 items-center justify-center rounded-2xl border-2 border-dashed border-border">
          <QrCode className="h-16 w-16 text-muted" />
        </div>

        {error && <p className="mt-4 text-sm text-destaque">{error}</p>}

        <Button size="lg" className="mt-8 w-full" onClick={handleSimulateScan} disabled={loading}>
          {loading ? 'Validando...' : 'Escanear (demo)'}
        </Button>

        <div className="mt-6 flex w-full items-center gap-2">
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Inserir código manualmente"
            className="h-12 flex-1 rounded-xl border border-border bg-surface px-4 text-sm outline-none"
          />
          <Button variant="outline" onClick={() => performCheckIn(manualCode)} disabled={!manualCode || loading}>
            Validar
          </Button>
        </div>
      </div>
    </div>
  );
}
