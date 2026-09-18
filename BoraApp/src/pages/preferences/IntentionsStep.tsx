import { useNavigate } from 'react-router-dom';

import { usePreferencesDraft } from '@/hooks/usePreferencesDraft';
import { Chip } from '@/shared/ui/Chip';

import { PreferencesLayout } from './PreferencesLayout';

const OPTIONS = [
  { value: 'conhecer_pessoas', label: 'Conhecer pessoas' },
  { value: 'relacionamento', label: 'Relacionamento' },
  { value: 'amizade', label: 'Amizade' },
  { value: 'sair_hoje', label: 'Sair hoje' },
  { value: 'musica', label: 'Música' },
  { value: 'festas', label: 'Festas' },
  { value: 'gastronomia', label: 'Gastronomia' },
  { value: 'experiencias', label: 'Experiências' },
  { value: 'turismo', label: 'Turismo' },
];

export function IntentionsStep() {
  const navigate = useNavigate();
  const { draft, toggleInArray } = usePreferencesDraft();

  return (
    <PreferencesLayout
      step={1}
      total={5}
      title="O que você procura?"
      onContinue={() => navigate('/preferences/music')}
      continueDisabled={draft.intentions.length === 0}
    >
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <Chip
            key={option.value}
            selected={draft.intentions.includes(option.value)}
            onClick={() => toggleInArray('intentions', option.value)}
          >
            {option.label}
          </Chip>
        ))}
      </div>
    </PreferencesLayout>
  );
}
