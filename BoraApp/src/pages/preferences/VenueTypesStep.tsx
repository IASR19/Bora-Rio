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
  const navigate = useNavigate();
  const { draft, toggleInArray } = usePreferencesDraft();

  return (
    <PreferencesLayout
      step={3}
      total={5}
      title="Tipo de ambiente"
      onContinue={() => navigate('/preferences/age-distance')}
      continueDisabled={draft.venueVibes.length === 0}
    >
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((vibe) => (
          <Chip
            key={vibe}
            selected={draft.venueVibes.includes(vibe)}
            onClick={() => toggleInArray('venueVibes', vibe)}
          >
            {vibe.charAt(0).toUpperCase() + vibe.slice(1)}
          </Chip>
        ))}
      </div>
    </PreferencesLayout>
  );
}
