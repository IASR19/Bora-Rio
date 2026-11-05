import { t, useI18n } from '@/i18n';
import { useNavigate } from 'react-router-dom';

import { usePreferencesDraft } from '@/hooks/usePreferencesDraft';
import { preferencesService } from '@/services/preferences.service';
import { Chip } from '@/shared/ui/Chip';

import { PreferencesLayout } from './PreferencesLayout';

const OPTIONS = [
  { value: 'economico', label: 'Econômico' },
  { value: 'medio', label: 'Médio' },
  { value: 'premium', label: 'Premium' },
];

export function BudgetStep() {
  useI18n();
  const navigate = useNavigate();
  const { draft, toggleInArray } = usePreferencesDraft();

  const finish = async () => {
    await preferencesService.updateMine(draft).catch(() => undefined);
    navigate('/subscription');
  };

  return (
    <PreferencesLayout
      step={5}
      total={5}
      title={t('Faixa de preço')}
      onContinue={finish}
      continueDisabled={draft.priceRanges.length === 0}
    >
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <Chip
            key={option.value}
            selected={draft.priceRanges.includes(option.value)}
            onClick={() => toggleInArray('priceRanges', option.value)}
          >
            {t(option.label)}
          </Chip>
        ))}
      </div>
    </PreferencesLayout>
  );
}
