import { domainLabel } from '@/i18n/domain-label';
import { t, useI18n } from '@/i18n';
import { useNavigate } from 'react-router-dom';

import { usePreferencesDraft } from '@/hooks/usePreferencesDraft';
import { Chip } from '@/shared/ui/Chip';

import { PreferencesLayout } from './PreferencesLayout';

const OPTIONS = [
  'sofisticado',
  'casual',
  'animado',
  'tranquilo',
  'balada',
  'bar',
  'rooftop',
  'restaurante',
  'praia',
  'lounge',
];

export function VenueTypesStep() {
  useI18n();
  const navigate = useNavigate();
  const { draft, toggleInArray } = usePreferencesDraft();

  return (
    <PreferencesLayout
      step={3}
      total={5}
      title={t('Tipo de ambiente')}
      onContinue={() => navigate('/preferences/age-distance')}
      continueDisabled={draft.venueVibes.length === 0}
    >
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((vibe) => (
          <Chip
            key={domainLabel(vibe)}
            selected={draft.venueVibes.includes(vibe)}
            onClick={() => toggleInArray('venueVibes', vibe)}
          >
            {domainLabel(vibe)}
          </Chip>
        ))}
      </div>
    </PreferencesLayout>
  );
}
