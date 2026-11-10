import { getLocale, t, useI18n } from "@/i18n";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, QrCode, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { businessService, type PromoStats } from "@/services/business.service";
import { ApiError } from "@/shared/api/client";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { rewardsService, type RewardPayload } from "@/services/rewards.service";
import { Button } from "@/shared/ui/Button";
import { Chip } from "@/shared/ui/Chip";
import { Input } from "@/shared/ui/Input";
import type { Reward } from "@/types/domain";

const KINDS: { value: Reward["kind"]; label: string }[] = [
  { value: "gift", label: "Brinde no check-in" },
  { value: "fixed_price", label: "Preço promocional" },
  { value: "percent_off", label: "Desconto %" },
];

const hhmm = (value: string) => value.slice(0, 5);

function formatCents(cents: number) {
  return (cents / 100).toLocaleString(getLocale(), {
    style: "currency",
    currency: "BRL",
  });
}

/** "10,50", "1.050,00" ou "10.5" -> centavos; NaN se inválido. Com vírgula, os pontos são milhar. */
function parseCents(value: string) {
  const v = value.trim();
  const normalized = v.includes(",")
    ? v.replace(/\./g, "").replace(",", ".")
    : v;
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

interface FormState {
  kind: Reward["kind"];
  title: string;
  description: string;
  price: string;
  percent: string;
  validFrom: string;
  validUntil: string;
  quantity: string;
}

const emptyForm: FormState = {
  kind: "gift",
  title: "",
  description: "",
  price: "",
  percent: "",
  validFrom: "18:00",
  validUntil: "23:00",
  quantity: "",
};

function fromReward(r: Reward): FormState {
  return {
    kind: r.kind,
    title: r.title,
    description: r.description ?? "",
    price:
      r.priceCents != null
        ? (r.priceCents / 100).toFixed(2).replace(".", ",")
        : "",
    percent: r.percentOff != null ? String(r.percentOff) : "",
    validFrom: hhmm(r.validFrom),
    validUntil: hhmm(r.validUntil),
    quantity: r.quantityTotal != null ? String(r.quantityTotal) : "",
  };
}

function PromotionForm({
  eventId,
  editing,
  onDone,
}: {
  eventId: string;
  editing: Reward | null;
  onDone: () => void;
}) {
  useI18n();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(
    editing ? fromReward(editing) : emptyForm,
  );
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = useMutation({
    mutationFn: (payload: RewardPayload) =>
      editing
        ? rewardsService.update(editing.id, payload)
        : rewardsService.create(eventId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["business", "rewards", eventId],
      });
      onDone();
    },
    onError: (err: Error) => setError(err.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) return setError(t("Informe o título da promoção."));
    const payload: RewardPayload = {
      kind: form.kind,
      title: form.title.trim(),
      description: form.description.trim() || (editing ? null : undefined),
      validFrom: form.validFrom,
      validUntil: form.validUntil,
    };
    if (form.kind === "fixed_price") {
      const cents = parseCents(form.price);
      if (!(cents > 0)) return setError(t("Informe um preço válido."));
      payload.priceCents = cents;
    }
    if (form.kind === "percent_off") {
      const pct = Number(form.percent);
      if (!Number.isInteger(pct) || pct < 1 || pct > 100)
        return setError(t("O desconto deve ficar entre 1 e 100."));
      payload.percentOff = pct;
    }
    if (form.kind === "gift" && form.quantity.trim()) {
      const qty = Number(form.quantity);
      if (!Number.isInteger(qty) || qty < 1)
        return setError(t("Informe uma quantidade válida."));
      payload.quantityTotal = qty;
    } else if (form.kind === "gift" && editing) {
      payload.quantityTotal = null;
    }
    save.mutate(payload);
  };

  const label = "mb-2 block text-sm font-semibold text-muted";
  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-border bg-surface p-4"
    >
      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <Chip
            key={k.value}
            selected={form.kind === k.value}
            aria-pressed={form.kind === k.value}
            onClick={() => set("kind", k.value)}
          >
            {t(k.label)}
          </Chip>
        ))}
      </div>
      <div>
        <label className={label} htmlFor="promo-title">
          {t("Título")}
        </label>
        <Input
          id="promo-title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          maxLength={120}
        />
      </div>
      <div>
        <label className={label} htmlFor="promo-description">
          {t("Descrição")}
        </label>
        <textarea
          id="promo-description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-destaque"
        />
      </div>
      {form.kind === "fixed_price" && (
        <div>
          <label className={label} htmlFor="promo-price">
            {t("Preço (R$)")}
          </label>
          <Input
            id="promo-price"
            inputMode="decimal"
            placeholder="10,00"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
          />
        </div>
      )}
      {form.kind === "percent_off" && (
        <div>
          <label className={label} htmlFor="promo-percent">
            {t("Desconto (%)")}
          </label>
          <Input
            id="promo-percent"
            inputMode="numeric"
            placeholder="30"
            value={form.percent}
            onChange={(e) =>
              set("percent", e.target.value.replace(/\D/g, "").slice(0, 3))
            }
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} htmlFor="promo-from">
            {t("Das")}
          </label>
          <Input
            id="promo-from"
            type="time"
            value={form.validFrom}
            onChange={(e) => set("validFrom", e.target.value)}
            required
          />
        </div>
        <div>
          <label className={label} htmlFor="promo-until">
            {t("Até")}
          </label>
          <Input
            id="promo-until"
            type="time"
            value={form.validUntil}
            onChange={(e) => set("validUntil", e.target.value)}
            required
          />
        </div>
      </div>
      {form.kind === "gift" && (
        <div>
          <label className={label} htmlFor="promo-quantity">
            {t("Quantidade (vazio = ilimitado)")}
          </label>
          <Input
            id="promo-quantity"
            inputMode="numeric"
            placeholder={t("Ilimitado")}
            value={form.quantity}
            onChange={(e) => set("quantity", e.target.value.replace(/\D/g, ""))}
          />
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destaque">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={save.isPending}>
          {t("Salvar")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onDone}
          disabled={save.isPending}
        >
          {t("Cancelar")}
        </Button>
      </div>
    </form>
  );
}

function summary(r: Reward) {
  if (r.kind === "fixed_price" && r.priceCents != null)
    return formatCents(r.priceCents);
  if (r.kind === "percent_off" && r.percentOff != null)
    return `${r.percentOff}% off`;
  return r.quantityTotal == null
    ? `${r.quantityRedeemed} ${t("resgatados")} · ${t("Ilimitado")}`
    : `${r.quantityRedeemed}/${r.quantityTotal} ${t("resgatados")}`;
}

const TZ = "America/Sao_Paulo";
const timeFmt = (iso: string) =>
  new Date(iso).toLocaleTimeString(getLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });

function PromoStatsRow({
  reward,
  stats,
}: {
  reward: Reward;
  stats?: PromoStats;
}) {
  const items: [string, number][] = [
    ["Escanearam", stats?.scans ?? 0],
    ["Cadastros pelo QR", stats?.newSignups ?? 0],
    ["Já tinham conta", stats?.existingUsers ?? 0],
    ["Liberados", stats?.redeemed ?? 0],
  ];
  if (reward.kind === "gift") items.push(["Entregues", stats?.delivered ?? 0]);
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {items.map(([label, n]) => (
        <span
          key={label}
          className="rounded-full bg-surface-alt px-2.5 py-1 text-[11px] text-muted"
        >
          <b className="text-foreground">{n}</b> {t(label)}
        </span>
      ))}
    </div>
  );
}

function RedemptionsSheet({
  rewardId,
  open,
  onOpenChange,
}: {
  rewardId: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  useI18n();
  const query = useQuery({
    queryKey: ["business", "redemptions", rewardId],
    queryFn: () => businessService.redemptions(rewardId),
    enabled: open,
  });
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Resgates">
      {query.isLoading && (
        <p className="text-sm text-muted">{t("Carregando...")}</p>
      )}
      {query.isError && (
        <p className="text-sm text-destaque">{query.error.message}</p>
      )}
      {query.data?.length === 0 && (
        <p className="text-sm text-muted">{t("Nenhum resgate ainda.")}</p>
      )}
      <ul className="space-y-2">
        {query.data?.map((r) => {
          const status = r.deliveredAt
            ? t("Entregue às {time}", { time: timeFmt(r.deliveredAt) })
            : r.expired
              ? t("Expirado")
              : r.expiresAt
                ? t("No prazo até {time}", { time: timeFmt(r.expiresAt) })
                : t("No prazo");
          const color = r.deliveredAt
            ? "text-green-400"
            : r.expired
              ? "text-destaque"
              : "text-foreground";
          return (
            <li
              key={(r.publicCode ?? "") + r.claimedAt}
              className="rounded-xl border border-border bg-background p-3 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold">
                  {r.publicCode ?? "—"}
                </span>
                <span className="text-xs text-muted">
                  {timeFmt(r.claimedAt)}
                </span>
              </div>
              <p className="text-xs text-muted">{r.firstName}</p>
              <p className={`mt-1 text-xs font-semibold ${color}`}>{status}</p>
            </li>
          );
        })}
      </ul>
    </BottomSheet>
  );
}

function DeliverBox({
  rewardId,
  eventId,
}: {
  rewardId: string;
  eventId: string;
}) {
  useI18n();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const deliver = useMutation({
    mutationFn: (c: string) => businessService.deliver(rewardId, c),
    onSuccess: async (res) => {
      setErr(null);
      setOk(
        t("Entregue para {name} · {code}", {
          name: res.firstName,
          code: res.publicCode,
        }),
      );
      setCode("");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["business", "promoStats", eventId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["business", "redemptions", rewardId],
        }),
      ]);
    },
    onError: (e: Error) => {
      setOk(null);
      setErr(
        e instanceof ApiError ? e.message : t("Não foi possível concluir."),
      );
    },
  });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOk(null);
    setErr(null);
    if (!code.trim()) return setErr(t("Informe o código da pessoa."));
    deliver.mutate(code.trim());
  };
  return (
    <form onSubmit={submit} className="mt-3">
      <p className="mb-1.5 text-xs font-semibold text-muted">
        {t("Dar baixa")}
      </p>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="BORA-XXXXX"
          autoCapitalize="characters"
          autoComplete="off"
          maxLength={12}
          aria-label={t("Dar baixa")}
        />
        <Button
          type="submit"
          size="sm"
          className="shrink-0"
          disabled={deliver.isPending}
        >
          {t("Confirmar entrega")}
        </Button>
      </div>
      {ok && (
        <p role="status" className="mt-2 text-sm font-semibold text-green-400">
          {ok}
        </p>
      )}
      {err && (
        <p role="alert" className="mt-2 text-sm text-destaque">
          {err}
        </p>
      )}
    </form>
  );
}

function PromoActions({
  reward,
  eventId,
}: {
  reward: Reward;
  eventId: string;
}) {
  useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link to={`/business/events/${eventId}/promotions/${reward.id}/qr`}>
            <QrCode className="h-4 w-4" /> {t("QR para imprimir")}
          </Link>
        </Button>
        {reward.kind === "gift" && (
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            {t("Ver resgates")}
          </Button>
        )}
      </div>
      {reward.kind === "gift" && (
        <>
          <DeliverBox rewardId={reward.id} eventId={eventId} />
          <RedemptionsSheet
            rewardId={reward.id}
            open={open}
            onOpenChange={setOpen}
          />
        </>
      )}
    </>
  );
}

export function PromotionsSection({ eventId }: { eventId: string }) {
  useI18n();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Reward | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["business", "rewards", eventId],
    queryFn: () => rewardsService.getByEvent(eventId),
  });
  const statsQuery = useQuery({
    queryKey: ["business", "promoStats", eventId],
    queryFn: () => businessService.promoStats(eventId),
  });
  const remove = useMutation({
    mutationFn: (id: string) => rewardsService.remove(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["business", "rewards", eventId],
      }),
    onError: (err: Error) => setError(err.message),
  });

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
  };
  const showForm = creating || editing;

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">{t("Promoções")}</h2>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> {t("Nova promoção")}
          </Button>
        )}
      </div>

      {showForm && (
        <PromotionForm
          key={editing?.id ?? "new"}
          eventId={eventId}
          editing={editing}
          onDone={closeForm}
        />
      )}
      {error && (
        <p role="alert" className="mb-2 text-sm text-destaque">
          {error}
        </p>
      )}
      {query.isLoading && (
        <p className="text-sm text-muted">{t("Carregando...")}</p>
      )}
      {query.data?.length === 0 && !showForm && (
        <p className="text-sm text-muted">
          {t("Nenhuma promoção cadastrada neste evento.")}
        </p>
      )}
      <div className="mt-3 space-y-3">
        {query.data?.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase text-destaque">
                  {t(KINDS.find((k) => k.value === r.kind)?.label ?? r.kind)}
                </p>
                <p className="font-semibold">{r.title}</p>
                {r.description && (
                  <p className="text-xs text-muted">{r.description}</p>
                )}
                <p className="mt-1 text-xs text-muted">
                  {hhmm(r.validFrom)}–{hhmm(r.validUntil)} · {summary(r)}
                </p>
              </div>
              <button
                type="button"
                aria-label={t("Editar")}
                className="p-1 text-muted"
                onClick={() => {
                  setCreating(false);
                  setEditing(r);
                }}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={t("Excluir")}
                className="p-1 text-destaque"
                disabled={remove.isPending}
                onClick={() => {
                  if (window.confirm(t("Excluir esta promoção?"))) {
                    setError(null);
                    remove.mutate(r.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <PromoStatsRow
              reward={r}
              stats={statsQuery.data?.find((x) => x.rewardId === r.id)}
            />
            <PromoActions reward={r} eventId={eventId} />
          </div>
        ))}
      </div>
    </section>
  );
}
