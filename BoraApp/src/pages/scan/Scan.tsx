import { t, useI18n } from '@/i18n';
import QrScanner from 'qr-scanner';
import { ArrowLeft, Flashlight, FlashlightOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BORA_HOSTS = ['bora.eztechin.com.br'];

/** Só aceita links do próprio Bora para check-in (/checkin/...) ou promoção (/p/...). */
function toBoraPath(raw: string): string | null {
  try {
    const url = new URL(raw.trim());
    const sameSite = url.origin === window.location.origin || BORA_HOSTS.includes(url.hostname);
    if (!sameSite) return null;
    if (!/^\/(checkin|p)\//.test(url.pathname)) return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

export function Scan() {
  useI18n();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [denied, setDenied] = useState(false);
  const [warning, setWarning] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    const scanner = new QrScanner(
      video,
      (result) => {
        const path = toBoraPath(result.data);
        if (path) {
          scanner.stop();
          navigate(path, { replace: true });
          return;
        }
        setWarning(true);
        clearTimeout(warnTimer.current);
        warnTimer.current = setTimeout(() => setWarning(false), 2500);
      },
      { preferredCamera: 'environment', highlightScanRegion: false, highlightCodeOutline: true, maxScansPerSecond: 15 },
    );
    scannerRef.current = scanner;
    scanner
      .start()
      .then(async () => {
        if (cancelled) return;
        setHasFlash(await scanner.hasFlash().catch(() => false));
      })
      .catch(() => {
        if (!cancelled) setDenied(true);
      });
    return () => {
      cancelled = true;
      clearTimeout(warnTimer.current);
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
    };
  }, [navigate]);

  const toggleFlash = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    await scanner.toggleFlash().catch(() => undefined);
    setFlashOn(scanner.isFlashOn());
  };

  return (
    <div className="app-shell relative flex min-h-dvh flex-col overflow-hidden bg-black">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" muted playsInline />

      <div className="relative z-10 flex items-center justify-between px-5 pt-6">
        <button
          type="button"
          aria-label={t('Voltar')}
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        {hasFlash && (
          <button
            type="button"
            aria-label={t('Lanterna')}
            onClick={toggleFlash}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white"
          >
            {flashOn ? <Flashlight className="h-5 w-5" /> : <FlashlightOff className="h-5 w-5" />}
          </button>
        )}
      </div>

      {denied ? (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center text-white">
          <p className="text-lg font-extrabold">{t('Precisamos da câmera')}</p>
          <p className="mt-2 text-sm text-white/80">
            {t('Permita o acesso à câmera nas configurações do navegador ou do celular e abra esta tela de novo.')}
          </p>
        </div>
      ) : (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8">
          <div className="h-64 w-64 rounded-3xl border-4 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]" />
          <p className="mt-6 text-center text-sm font-semibold text-white">
            {t('Aponte a câmera para o QR Code do estabelecimento.')}
          </p>
          {warning && (
            <p className="mt-3 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white">
              {t('Este QR não é do Bora.')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
