import { t, useI18n } from "@/i18n";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { checkinsService } from "@/services/checkins.service";
import { ApiError } from "@/shared/api/client";

const REFRESH_MARGIN_S = 10;

/** QR de check-in em tela cheia: o token vale 60 s, então renova ~10 s antes de expirar. */
export function BusinessQr() {
  useI18n();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [fatal, setFatal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { qrToken, expiresInSeconds } = await checkinsService.getQr(id);
      const { default: QRCode } = await import("qrcode");
      const url = `${window.location.origin}/checkin/${id}?t=${encodeURIComponent(qrToken)}`;
      setDataUrl(
        await QRCode.toDataURL(url, {
          width: 640,
          margin: 2,
          errorCorrectionLevel: "M",
        }),
      );
      setExpiresAt(Date.now() + expiresInSeconds * 1000);
      setRemaining(expiresInSeconds);
      setError(null);
      setFatal(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("Não foi possível gerar o QR Code."),
      );
      setExpiresAt(0);
      // 403/404 não se resolvem sozinhos (evento não aprovado, de outro dono ou removido): não insiste.
      setFatal(
        err instanceof ApiError && (err.status === 403 || err.status === 404),
      );
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    // Mantém a tela acesa enquanto o QR está exposto; falhas são ignoradas.
    let lock = null as WakeLockSentinel | null;
    let cancelled = false;
    if ("wakeLock" in navigator) {
      navigator.wakeLock
        .request("screen")
        .then((sentinel) => {
          if (cancelled) void sentinel.release().catch(() => undefined);
          else lock = sentinel;
        })
        .catch(() => undefined);
    }
    return () => {
      cancelled = true;
      void lock?.release().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    if (error) {
      if (fatal) return;
      const retry = setInterval(() => void load(), 5000);
      return () => clearInterval(retry);
    }
    if (!expiresAt) return;
    const tick = setInterval(() => {
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setRemaining(left);
      if (left <= REFRESH_MARGIN_S) {
        clearInterval(tick);
        void load();
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [expiresAt, error, fatal, load]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white p-6 text-center text-black">
      <button
        onClick={() => navigate(`/business/events/${id}`)}
        aria-label={t("Fechar")}
        className="absolute right-4 top-4 rounded-full bg-black/10 p-2"
      >
        <X className="h-6 w-6" />
      </button>
      <h1 className="mb-4 text-xl font-extrabold">{t("QR de check-in")}</h1>
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={t("QR de check-in")}
          className="aspect-square w-full max-w-[min(90vw,70vh)]"
        />
      ) : (
        !error && <p>{t("Carregando...")}</p>
      )}
      {error && <p className="max-w-xs text-sm text-red-600">{error}</p>}
      <p className="mt-4 max-w-xs text-base font-semibold">
        {t("Aponte a câmera do celular para fazer check-in")}
      </p>
      {dataUrl && !error && (
        <p className="mt-2 text-sm text-black/60">
          {t("Atualiza em {s}s", {
            s: Math.max(0, remaining - REFRESH_MARGIN_S),
          })}
        </p>
      )}
    </div>
  );
}
