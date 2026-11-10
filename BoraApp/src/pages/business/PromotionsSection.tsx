import { getLocale, t, useI18n } from '@/i18n';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { rewardsService, type RewardPayload } from '@/services/rewards.service';
import { Button } from '@/shared/ui/Button';
import { Chip } from '@/shared/ui/Chip';
import { Input } from '@/shared/ui/Input';
import type { Reward } from '@/types/domain';

const KINDS: { value: Reward['kind']; label: string }[] = [
  { value: 'gift', label: 'Brinde no check-in' },
  { value: 'fixed_price', label: 'Preço promocional' },
  { value: 'percent_off', label: 'Desconto %' },
];

const hhmm = (value: string) => value.slice(0, 5);

function formatCents(cents: number) {
  return (cents / 100).toLocaleString(getLocale(), {
    style: 'currency',
    currency: 'BRL',
  });
}

/** "10,50", "1.050,00" ou "10.5" -> centavos; NaN se inválido. Com vírgula, os pontos são milhar. */
function parseCents(value: string) {
  const v = value.trim();
  const normalized = v.includes(',') ? v.replace(/\./g, '').replace(',', '.') : v;
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

interface FormState {
  kind: Reward['kind'];
  title: string;
  description: string;
  price: string;
  percent: string;
  validFrom: string;
  validUntil: string;
  quantity: string;
}

const emptyForm: FormState = {
  kind: 'gift',
  title: '',
  description: '',
  price: '',
  percent: '',
  validFrom: '18:00',
  validUntil: '23:00',
  quantity: '',
};

function fromReward(r: Reward): FormState {
  return {
    kind: r.kind,
    title: r.title,
    description: r.description ?? '',
    price: r.priceCents != null ? (r.priceCents / 100).toFixed(2).replace('.', ',') : '',
    percent: r.percentOff != null ? String(r.percentOff) : '',
    validFrom: hhmm(r.validFrom),
    validUntil: hhmm(r.validUntil),
    quantity: r.quantityTotal != null ? String(r.quantityTotal) : '',
  };
}

function PromotionForm({ eventId, editing, onDone }: { eventId: string; editing: Reward | null; onDone: () => void }) {
  useI18n();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(editing ? fromReward(editing) : emptyForm);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const save = useMutation({
    mutationFn: (payload: RewardPayload) =>
      editing ? rewardsService.update(editing.id, payload) : rewardsService.create(eventId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['business', 'rewards', eventId],
      });
      onDone();
    },
    onError: (err: Error) => setError(err.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) return setError(t('Informe o título da promoção.'));
    const payload: RewardPayload = {
      kind: form.kind,
      title: form.title.trim(),
      description: form.description.trim() || (editing ? null : undefined),
      validFrom: form.validFrom,
      validUntil: form.validUntil,
    };
    if (form.kind === 'fixed_price') {
      const cents = parseCents(form.price);
      if (!(cents > 0)) return setError(t('Informe um preço válido.'));
      payload.priceCents = cents;
    }
    if (form.kind === 'percent_off') {
      const pct = Number(form.percent);
      if (!Number.isInteger(pct) || pct < 1 || pct > 100) return setError(t('O desconto deve ficar entre 1 e 100.'));
      payload.percentOff = pct;
    }
    if (form.kind === 'gift' && form.quantity.trim()) {
      const qty = Number(form.quantity);
      if (!Number.isInteger(qty) || qty < 1) return setError(t('Informe uma quantidade válida.'));
      payload.quantityTotal = qty;
    } else if (form.kind === 'gift' && editing) {
      payload.quantityTotal = null;
    }
    save.mutate(payload);
  };

  const label = 'mb-2 block text-sm font-semibold text-muted';
  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-surface p-4">
      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <Chip
            key={k.value}
            selected={form.kind === k.value}
            aria-pressed={form.kind === k.value}
            onClick={() => set('kind', k.value)}
          >
            {t(k.label)}
          </Chip>
        ))}
      </div>
      <div>
        <label className={label} htmlFor="promo-title">
          {t('Título')}
        </label>
        <Input id="promo-title" value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={120} />
      </div>
      <div>
        <label className={label} htmlFor="promo-description">
          {t('Descrição')}
        </label>
        <textarea
          id="promo-description"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-destaque"
        />
      </div>
      {form.kind === 'fixed_price' && (
        <div>
          <label className={label} htmlFor="promo-price">
            {t('Preço (R$)')}
          </label>
          <Input
            id="promo-price"
            inputMode="decimal"
            placeholder="10,00"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
          />
        </div>
      )}
      {form.kind === 'percent_off' && (
        <div>
          <label className={label} htmlFor="promo-percent">
            {t('Desconto (%)')}
          </label>
          <Input
            id="promo-percent"
            inputMode="numeric"
            placeholder="30"
            value={form.percent}
            onChange={(e) => set('percent', e.target.value.replace(/\D/g, '').slice(0, 3))}
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} htmlFor="promo-from">
            {t('Das')}
          </label>
          <Input
            id="promo-from"
            type="time"
            value={form.validFrom}
            onChange={(e) => set('validFrom', e.target.value)}
            required
          />
        </div>
        <div>
          <label className={label} htmlFor="promo-until">
            {t('Até')}
          </label>
          <Input
            id="promo-until"
            type="time"
            value={form.validUntil}
            onChange={(e) => set('validUntil', e.target.value)}
            required
          />
        </div>
      </div>
      {form.kind === 'gift' && (
        <div>
          <label className={label} htmlFor="promo-quantity">
            {t('Quantidade (vazio = ilimitado)')}
          </label>
          <Input
            id="promo-quantity"
            inputMode="numeric"
            placeholder={t('Ilimitado')}
            value={form.quantity}
            onChange={(e) => set('quantity', e.target.value.replace(/\D/g, ''))}
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
          {t('Salvar')}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone} disabled={save.isPending}>
          {t('Cancelar')}
        </Button>
      </div>
    </form>
  );
}

function summary(r: Reward) {
  if (r.kind === 'fixed_price' && r.priceCents != null) return formatCents(r.priceCents);
  if (r.kind === 'percent_off' && r.percentOff != null) return `${r.percentOff}% off`;
  return r.quantityTotal == null
    ? `${r.quantityRedeemed} ${t('resgatados')} · ${t('Ilimitado')}`
    : `${r.quantityRedeemed}/${r.quantityTotal} ${t('resgatados')}`;
}

export function PromotionsSection({ eventId }: { eventId: string }) {
  useI18n();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Reward | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ['business', 'rewards', eventId],
    queryFn: () => rewardsService.getByEvent(eventId),
  });
  const remove = useMutation({
    mutationFn: (id: string) => rewardsService.remove(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['business', 'rewards', eventId],
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
        <h2 className="text-lg font-bold">{t('Promoções')}</h2>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> {t('Nova promoção')}
          </Button>
        )}
      </div>

      {showForm && <PromotionForm key={editing?.id ?? 'new'} eventId={eventId} editing={editing} onDone={closeForm} />}
      {error && (
        <p role="alert" className="mb-2 text-sm text-destaque">
          {error}
        </p>
      )}
      {query.isLoading && <p className="text-sm text-muted">{t('Carregando...')}</p>}
      {query.data?.length === 0 && !showForm && (
        <p className="text-sm text-muted">{t('Nenhuma promoção cadastrada neste evento.')}</p>
      )}
      <div className="mt-3 space-y-3">
        {query.data?.map((r) => (
          <div key={r.id} className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase text-destaque">
                {t(KINDS.find((k) => k.value === r.kind)?.label ?? r.kind)}
              </p>
              <p className="font-semibold">{r.title}</p>
              {r.description && <p className="text-xs text-muted">{r.description}</p>}
              <p className="mt-1 text-xs text-muted">
                {hhmm(r.validFrom)}–{hhmm(r.validUntil)} · {summary(r)}
              </p>
            </div>
            <button
              type="button"
              aria-label={t('Editar')}
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
              aria-label={t('Excluir')}
              className="p-1 text-destaque"
              disabled={remove.isPending}
              onClick={() => {
                if (window.confirm(t('Excluir esta promoção?'))) {
                  setError(null);
                  remove.mutate(r.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
