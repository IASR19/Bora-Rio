import { domainLabel } from '@/i18n/domain-label';
import { t, useI18n } from '@/i18n';
import { useNavigate } from 'react-router-dom';

import { usePreferencesDraft } from '@/hooks/usePreferencesDraft';
import { Chip } from '@/shared/ui/Chip';

import { PreferencesLayout } from './PreferencesLayout';

const OPTIONS = ['pagode', 'samba', 'sertanejo', 'eletronico', 'funk', 'pop', 'rock', 'mpb', 'jazz', 'outros'];

export function MusicStep() {
  useI18n();
  const navigate = useNavigate();
  const { draft, toggleInArray } = usePreferencesDraft();

  return (
    <PreferencesLayout
      step={2}
      total={5}
      title={t('Seus interesses musicais')}
      onContinue={() => navigate('/preferences/venue-types')}
      continueDisabled={draft.musicGenres.length === 0}
    >
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((genre) => (
          <Chip
            key={domainLabel(genre)}
            selected={draft.musicGenres.includes(genre)}
            onClick={() => toggleInArray('musicGenres', genre)}
          >
            {domainLabel(genre)}
          </Chip>
        ))}
      </div>
    </PreferencesLayout>
  );
}
