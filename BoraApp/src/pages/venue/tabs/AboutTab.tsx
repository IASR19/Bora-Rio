import { t, useI18n } from '@/i18n';
import { domainLabel } from '@/i18n/domain-label';
import type { Venue } from '@/types/domain';
import { venueCategoryLabel } from '@/shared/constants/venue-categories';

export function AboutTab({ venue }: { venue: Venue }) {
  useI18n();
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-foreground">
        {venue.description ?? t('Um lugar incrível esperando por você.')}
      </p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted">{t('Categoria')}</p>
          <p className="font-semibold">{venueCategoryLabel(venue.category)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">{t('Faixa de preço')}</p>
          <p className="font-semibold capitalize">{domainLabel(venue.priceRange)}</p>
          {venue.catalogMetadata?.priceRangeAccuracy === 'estimate' && (
            <p className="text-xs text-muted">{t('Estimativa')}</p>
          )}
        </div>
      </div>
      {venue.catalogMetadata?.openingHours && (
        <p className="text-sm">
          {t('Horários:')} {venue.catalogMetadata.openingHours}
        </p>
      )}
      {venue.catalogMetadata?.instagramUrl && (
        <a
          className="block text-sm underline"
          href={venue.catalogMetadata.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {' '}
          {t('Instagram do local')}{' '}
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
            ? t('Foto: {credit} · {license}', {
                credit: venue.catalogMetadata.photo.credit,
                license: venue.catalogMetadata.photo.license,
              })
            : t('Fonte e créditos da foto')}
        </a>
      )}
    </div>
  );
}
