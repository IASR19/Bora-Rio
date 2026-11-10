import { getLocale, t, useI18n } from "@/i18n";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, Printer, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { businessService } from "@/services/business.service";
import { rewardsService } from "@/services/rewards.service";
import { Button } from "@/shared/ui/Button";
import type { Reward } from "@/types/domain";

const W = 1080;
const H = 1350;
const FONT = "'Sora', system-ui, sans-serif";

function hourLabel(value: string) {
  const [h, m] = value.split(":");
  return m && m !== "00" ? `${Number(h)}h${m}` : `${Number(h)}h`;
}

function dateLabel(startsAt: string | undefined) {
  if (!startsAt) return "";
  const d = new Date(startsAt);
  if (Number.isNaN(d.getTime())) return "";
  const label = d.toLocaleDateString(getLocale(), {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
  return label.replace(/\.(?=,|\s|$)/g, "");
}

function scheduleLabel(r: Reward, startsAt?: string) {
  const from = hourLabel(r.validFrom);
  const to = hourLabel(r.validUntil);
  const hours =
    from === "0h"
      ? t("até {to}", { to })
      : t("das {from} às {to}", { from, to });
  const date = dateLabel(startsAt);
  return date ? `${date} · ${hours}` : hours;
}

function highlightLabel(r: Reward) {
  if (r.kind === "fixed_price" && r.priceCents != null) {
    return (r.priceCents / 100).toLocaleString(getLocale(), {
      style: "currency",
      currency: "BRL",
    });
  }
  if (r.kind === "percent_off" && r.percentOff != null)
    return t("{percent}% OFF", { percent: r.percentOff });
  return t("Escaneie e resgate");
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function drawArt(
  canvas: HTMLCanvasElement,
  reward: Reward,
  venueName: string,
  url: string,
  startsAt?: string,
) {
  const [{ default: QRCode }, logo] = await Promise.all([
    import("qrcode"),
    loadImage("/logo.png"),
    document.fonts.ready,
  ]);
  try {
    await document.fonts.load(`800 60px ${FONT}`);
    await document.fonts.load(`600 40px ${FONT}`);
  } catch {
    /* segue com a fonte de reserva */
  }
  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, url, {
    width: 640,
    margin: 0,
    errorCorrectionLevel: "H",
    color: { dark: "#0B0F1A", light: "#FFFFFF" },
  });

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  // Fundo e brilhos
  ctx.fillStyle = "#0B0F1A";
  ctx.fillRect(0, 0, W, H);
  const glow = (x: number, y: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(11,15,26,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  };
  glow(0, 0, 700, "rgba(255,138,0,0.45)");
  glow(W, 520, 650, "rgba(255,45,149,0.40)");
  glow(0, H, 800, "rgba(122,43,255,0.50)");
  const bar = ctx.createLinearGradient(0, 0, W, 0);
  bar.addColorStop(0, "#FF8A00");
  bar.addColorStop(0.5, "#FF2D95");
  bar.addColorStop(1, "#7A2BFF");
  ctx.fillStyle = bar;
  ctx.fillRect(0, 0, W, 14);

  ctx.textBaseline = "alphabetic";
  // Topo: logo + local
  let y = 60;
  if (logo) {
    const lh = 80;
    const lw = (logo.width / logo.height) * lh;
    ctx.drawImage(logo, 70, y, lw, lh);
  }
  ctx.textAlign = "right";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 34px ${FONT}`;
  let venue = venueName;
  while (venue.length > 3 && ctx.measureText(venue).width > 560)
    venue = venue.slice(0, -2);
  if (venue !== venueName) venue += "…";
  ctx.fillText(venue, W - 70, y + 52);

  // Título (quebra automática, reduz fonte se necessário)
  ctx.textAlign = "center";
  y = 215;
  let size = 96;
  let lines: string[] = [];
  for (; size >= 52; size -= 6) {
    ctx.font = `800 ${size}px ${FONT}`;
    lines = wrapText(ctx, reward.title, W - 140);
    if (lines.length <= 3) break;
  }
  lines = lines.slice(0, 3);
  ctx.fillStyle = "#FFFFFF";
  for (const l of lines) {
    y += size;
    ctx.fillText(l, W / 2, y);
    y += size * 0.12;
  }

  // Destaque por tipo
  y += 30;
  const hl = highlightLabel(reward);
  ctx.font = `800 64px ${FONT}`;
  const pw = Math.min(W - 140, ctx.measureText(hl).width + 100);
  const grad = ctx.createLinearGradient((W - pw) / 2, 0, (W + pw) / 2, 0);
  grad.addColorStop(0, "#FF8A00");
  grad.addColorStop(0.5, "#FF2D95");
  grad.addColorStop(1, "#7A2BFF");
  ctx.fillStyle = grad;
  roundRect(ctx, (W - pw) / 2, y, pw, 100, 50);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(hl, W / 2, y + 71);
  y += 100;

  if (reward.description) {
    ctx.font = `500 34px ${FONT}`;
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    y += 20;
    for (const l of wrapText(ctx, reward.description, W - 180).slice(0, 2)) {
      y += 44;
      ctx.fillText(l, W / 2, y);
    }
  }
  y += 58;
  ctx.font = `700 38px ${FONT}`;
  ctx.fillStyle = "#FFB36B";
  ctx.fillText(scheduleLabel(reward, startsAt), W / 2, y);

  // Cartão do QR (ocupa o espaço restante)
  const footerH = 130;
  const cardTop = y + 40;
  const cardBottom = H - footerH;
  const card = Math.min(cardBottom - cardTop, W - 140);
  const cardX = (W - card) / 2;
  ctx.save();
  ctx.shadowColor = "rgba(255,45,149,0.45)";
  ctx.shadowBlur = 50;
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, cardX, cardTop, card, card, 48);
  ctx.fill();
  ctx.restore();
  const pad = card * 0.07;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    qrCanvas,
    cardX + pad,
    cardTop + pad,
    card - pad * 2,
    card - pad * 2,
  );
  ctx.imageSmoothingEnabled = true;

  // Rodapé
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 38px ${FONT}`;
  ctx.fillText(t("Aponte a câmera do celular"), W / 2, H - 70);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = `600 28px ${FONT}`;
  ctx.fillText(window.location.host, W / 2, H - 28);
}

const toBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));

export function PromoQrArt() {
  useI18n();
  const { id: eventId = "", rewardId = "" } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const fileRef = useRef<File | null>(null);

  const rewards = useQuery({
    queryKey: ["business", "rewards", eventId],
    queryFn: () => rewardsService.getByEvent(eventId),
  });
  const qr = useQuery({
    queryKey: ["business", "rewardQr", rewardId],
    queryFn: () => businessService.rewardQr(rewardId),
  });
  const me = useQuery({
    queryKey: ["business", "me"],
    queryFn: () => businessService.me(),
  });

  const events = useQuery({
    queryKey: ["business", "events"],
    queryFn: () => businessService.events(),
  });

  const reward = rewards.data?.find((r) => r.id === rewardId);
  const venueName = me.data?.venue?.name ?? "";
  const qrPath = qr.data?.path;
  const loadError = rewards.error ?? qr.error;
  const startsAt = events.data?.find((e) => e.id === eventId)?.startsAt;
  const settled =
    (me.isSuccess || me.isError) && (events.isSuccess || events.isError);
  const notFound = rewards.isSuccess && !reward;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !reward || !qrPath || !settled) return;
    let cancelled = false;
    setReady(false);
    fileRef.current = null;
    drawArt(
      canvas,
      reward,
      venueName,
      `${window.location.origin}${qrPath}`,
      startsAt,
    )
      .then(async () => {
        const blob = await toBlob(canvas);
        if (!cancelled) {
          fileRef.current = blob
            ? new File([blob], "bora-promocao.png", { type: "image/png" })
            : null;
          setError(null);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setError(t("Não foi possível gerar a arte."));
      });
    return () => {
      cancelled = true;
    };
  }, [reward, qrPath, venueName, startsAt, settled]);

  const makeFile = async () => {
    const canvas = canvasRef.current;
    const blob = canvas ? await toBlob(canvas) : null;
    return blob
      ? new File([blob], "bora-promocao.png", { type: "image/png" })
      : null;
  };

  const download = (file: File) => {
    const href = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = href;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  const onDownload = async () => {
    const file = await makeFile();
    if (file) download(file);
  };

  const onShare = () => {
    const file = fileRef.current;
    if (!file) return;
    const data = { files: [file], title: reward?.title ?? t("Promoção Bora") };
    if (typeof navigator.canShare !== "function" || !navigator.canShare(data)) {
      download(file);
      return;
    }
    // Sem await antes: o iOS exige que share() rode dentro do gesto do usuário.
    navigator.share(data).catch((err: unknown) => {
      if (!(err instanceof DOMException && err.name === "AbortError"))
        download(file);
    });
  };

  const onPrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const src = canvas.toDataURL("image/png");
    const iframe = document.createElement("iframe");
    iframe.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    if (!doc) {
      iframe.remove();
      return;
    }
    doc.open();
    doc.write(
      `<!doctype html><html><head><title>Bora</title><style>@page{size:A4;margin:0}html,body{margin:0;height:100%}body{display:flex;align-items:center;justify-content:center}img{max-width:100%;max-height:100vh;object-fit:contain}</style></head><body><img src="${src}"></body></html>`,
    );
    doc.close();
    const img = doc.querySelector("img");
    const run = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => iframe.remove(), 60000);
    };
    if (img && !img.complete) img.onload = run;
    else run();
  };

  const failure =
    error ??
    (notFound
      ? t("Promoção não encontrada.")
      : loadError
        ? loadError.message
        : null);

  return (
    <div className="px-5 pb-10 pt-6">
      <button
        type="button"
        onClick={() => navigate(`/business/events/${eventId}`)}
        className="mb-4 flex items-center gap-1 text-sm text-muted"
      >
        <ArrowLeft className="h-4 w-4" /> {t("Voltar")}
      </button>
      <h1 className="mb-4 text-xl font-extrabold">{t("Arte da promoção")}</h1>
      {failure && (
        <p role="alert" className="mb-4 text-sm text-destaque">
          {failure}
        </p>
      )}
      {!failure && !ready && (
        <p className="mb-4 text-sm text-muted">{t("Gerando arte...")}</p>
      )}
      <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-border">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block h-auto w-full"
        />
      </div>
      <div className="mx-auto mt-5 grid max-w-[420px] grid-cols-1 gap-3 sm:grid-cols-3">
        <Button size="sm" onClick={onShare} disabled={!ready}>
          <Share2 className="h-4 w-4" /> {t("Compartilhar")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => void onDownload()}
          disabled={!ready}
        >
          <Download className="h-4 w-4" /> {t("Baixar PNG")}
        </Button>
        <Button size="sm" variant="outline" onClick={onPrint} disabled={!ready}>
          <Printer className="h-4 w-4" /> {t("Imprimir")}
        </Button>
      </div>
    </div>
  );
}
