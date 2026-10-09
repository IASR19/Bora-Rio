import type { Venue } from '@/types/domain';
import { venueCategoryLabel } from '@/shared/constants/venue-categories';

export function AboutTab({ venue }: { venue: Venue }) {
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-foreground">
        {venue.description ?? 'Um lugar incrível esperando por você.'}
      </p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted">Categoria</p>
          <p className="font-semibold">{venueCategoryLabel(venue.category)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Faixa de preço</p>
          <p className="font-semibold capitalize">{venue.priceRange}</p>
          {venue.catalogMetadata?.priceRangeAccuracy === 'estimate' && (
            <p className="text-xs text-muted">Estimativa</p>
          )}
        </div>
      </div>
      {venue.catalogMetadata?.openingHours && (
        <p className="text-sm">Horários: {venue.catalogMetadata.openingHours}</p>
      )}
      {venue.catalogMetadata?.instagramUrl && (
        <a
          className="block text-sm underline"
          href={venue.catalogMetadata.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram do local
        </a>
      )}
      {venue.catalogMetadata?.photo && (
        <a
          className="block text-xs text-muted underline"
          href={venue.catalogMetadata.photo.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* Licenças CC exigem atribuição visível (autor + licença). */}
          {venue.catalogMetadata.photo.license.startsWith('CC')
            ? `Foto: ${venue.catalogMetadata.photo.credit} · ${venue.catalogMetadata.photo.license}`
            : 'Fonte e créditos da foto'}
        </a>
      )}
    </div>
  );
}
