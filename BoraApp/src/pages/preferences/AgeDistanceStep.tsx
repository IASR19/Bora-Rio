import { useNavigate } from 'react-router-dom';

import { usePreferencesDraft } from '@/hooks/usePreferencesDraft';
import { Chip } from '@/shared/ui/Chip';

import { PreferencesLayout } from './PreferencesLayout';

const DISTANCES = [
  { value: 3, label: '3 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 0, label: 'Qualquer distância' },
];

export function AgeDistanceStep() {
  const navigate = useNavigate();
  const { draft, update } = usePreferencesDraft();

  return (
    <PreferencesLayout
      step={4}
      total={5}
      title="Faixa etária e distância"
      onContinue={() => navigate('/preferences/budget')}
    >
      <p className="text-sm font-semibold text-muted">Idade de interesse</p>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="number"
          min={18}
          max={100}
          value={draft.ageInterestMin}
          onChange={(e) => update({ ageInterestMin: Number(e.target.value) })}
          className="h-12 w-20 rounded-xl border border-border bg-surface text-center text-lg font-bold outline-none"
        />
        <span className="text-muted">—</span>
        <input
          type="number"
          min={18}
          max={100}
          value={draft.ageInterestMax}
          onChange={(e) => update({ ageInterestMax: Number(e.target.value) })}
          className="h-12 w-20 rounded-xl border border-border bg-surface text-center text-lg font-bold outline-none"
        />
      </div>

      <p className="mt-8 text-sm font-semibold text-muted">Distância máxima</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {DISTANCES.map((option) => (
          <Chip
            key={option.value}
            selected={draft.maxDistanceKm === option.value}
            onClick={() => update({ maxDistanceKm: option.value })}
          >
            {option.label}
          </Chip>
        ))}
      </div>
    </PreferencesLayout>
  );
}
