import { LocateFixed } from 'lucide-react';

import type { CityLocation } from '@/hooks/useCityLocation';
import { Select } from '@/shared/ui/Select';

/** Estado + cidade (IBGE) + "usar minha localização atual"; o estado vem do useCityLocation. */
export function LocationFields({ location }: { location: CityLocation }) {
  return (
    <>
      <div>
        <label className="mb-2 block text-sm font-semibold text-muted">Estado</label>
        <Select value={location.uf} onChange={(e) => location.setUf(e.target.value)}>
          <option value="">Selecione o estado</option>
          {location.states?.map((state) => (
            <option key={state.sigla} value={state.sigla}>
              {state.nome}
            </option>
          ))}
        </Select>
        {location.statesError && <p className="mt-1 text-xs text-destaque">Não foi possível carregar os estados.</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-muted">Cidade</label>
        <Select
          value={location.cityName}
          disabled={!location.uf || location.citiesLoading}
          onChange={(e) => location.setCityName(e.target.value)}
        >
          <option value="">{location.citiesLoading ? 'Carregando cidades...' : 'Selecione a cidade'}</option>
          {location.cities?.map((c) => (
            <option key={c.id} value={c.nome}>
              {c.nome}
            </option>
          ))}
        </Select>
        {location.citiesError && <p className="mt-1 text-xs text-destaque">Não foi possível carregar as cidades.</p>}
        <button
          type="button"
          onClick={location.detectCurrentLocation}
          disabled={location.locating}
          className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-destaque"
        >
          <LocateFixed className="h-4 w-4" />
          {location.locating
            ? 'Localizando...'
            : location.coords
              ? 'Localização atual definida'
              : 'Usar minha localização atual'}
        </button>
        <p className="mt-1 text-xs text-muted">Usada para mostrar o que está perto de você.</p>
      </div>
    </>
  );
}
