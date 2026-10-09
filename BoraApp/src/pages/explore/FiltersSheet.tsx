import { VENUE_CATEGORY_OPTIONS } from '@/shared/constants/venue-categories';
import { useState } from 'react';

import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import { Chip } from '@/shared/ui/Chip';

export interface Filters {
  category?: string;
  music?: string;
  priceRange?: string;
  maxDistanceKm?: number;
  q?: string;
}

const MUSIC = ['pagode', 'eletronico', 'sertanejo', 'funk', 'pop', 'rock'];
const PRICES = [
  { value: 'economico', label: 'Econômico' },
  { value: 'medio', label: 'Médio' },
  { value: 'premium', label: 'Premium' },
];

export function FiltersSheet({
  open,
  onOpenChange,
  value,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: Filters;
  onApply: (filters: Filters) => void;
}) {
  const [draft, setDraft] = useState<Filters>(value);
  const [wasOpen, setWasOpen] = useState(open);

  // Ao abrir, o rascunho parte dos filtros atuais: eles podem ter mudado por fora
  // (ex.: limpar busca/categoria nos banners do Explorar).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(value);
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Filtros">
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-sm font-semibold text-muted">Categoria</p>
          <div className="flex flex-wrap gap-2">
            {VENUE_CATEGORY_OPTIONS.map(({ value: category, label }) => (
              <Chip
                key={category}
                selected={draft.category === category}
                onClick={() => setDraft((d) => ({ ...d, category: d.category === category ? undefined : category }))}
              >
                {label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-muted">Música</p>
          <div className="flex flex-wrap gap-2">
            {MUSIC.map((genre) => (
              <Chip
                key={genre}
                selected={draft.music === genre}
                onClick={() => setDraft((d) => ({ ...d, music: d.music === genre ? undefined : genre }))}
              >
                {genre}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-muted">Preço</p>
          <div className="flex flex-wrap gap-2">
            {PRICES.map((price) => (
              <Chip
                key={price.value}
                selected={draft.priceRange === price.value}
                onClick={() =>
                  setDraft((d) => ({ ...d, priceRange: d.priceRange === price.value ? undefined : price.value }))
                }
              >
                {price.label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-muted">Distância máxima</p>
          <input
            type="range"
            min={1}
            max={20}
            value={draft.maxDistanceKm ?? 10}
            onChange={(e) => setDraft((d) => ({ ...d, maxDistanceKm: Number(e.target.value) }))}
            className="w-full accent-destaque"
          />
          <p className="mt-1 text-xs text-muted">Até {draft.maxDistanceKm ?? 10} km</p>
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            onApply(draft);
            onOpenChange(false);
          }}
        >
          Aplicar filtros
        </Button>
      </div>
    </BottomSheet>
  );
}
