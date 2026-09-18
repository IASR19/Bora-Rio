import type { Venue } from '@/types/domain';

export function AboutTab({ venue }: { venue: Venue }) {
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-foreground">
        {venue.description ?? 'Um lugar incrível esperando por você.'}
      </p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted">Categoria</p>
          <p className="font-semibold capitalize">{venue.category}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Faixa de preço</p>
          <p className="font-semibold capitalize">{venue.priceRange}</p>
        </div>
      </div>
    </div>
  );
}
