import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { geocodeCity, reverseGeocodeCity } from '@/services/geo.service';
import { formatCityWithUf, ibgeService, parseCityWithUf, sameCityName } from '@/services/ibge.service';
import type { User } from '@/types/domain';

const citiesQuery = (uf: string) => ({
  queryKey: ['ibge', 'cities', uf],
  queryFn: () => ibgeService.cities(uf),
  staleTime: Infinity,
});

export interface ResolvedLocation {
  city: string;
  latitude?: number;
  longitude?: number;
  /** Cidade nova sem ponto no mapa: a busca por distância seguiria usando o ponto antigo. */
  geocodeFailed: boolean;
}

/**
 * Cidade do usuário escolhida sempre na lista do IBGE (UF -> município), sem texto livre: evita
 * grafias conflitantes e garante um município que o geocoding acha. Usado no Editar perfil e no
 * seletor de localização da Home.
 */
export function useCityLocation(user: User | null) {
  const queryClient = useQueryClient();
  const saved = parseCityWithUf(user?.city);
  const [uf, setUfState] = useState(saved?.uf ?? '');
  const [cityName, setCityNameState] = useState(saved?.city ?? '');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** O usuário mexeu na localização (select ou GPS) nesta tela. */
  const [touched, setTouched] = useState(false);

  const { data: states, isError: statesError } = useQuery({
    queryKey: ['ibge', 'states'],
    queryFn: ibgeService.states,
    staleTime: Infinity,
  });
  const {
    data: cities,
    isFetching: citiesLoading,
    isError: citiesError,
  } = useQuery({ ...citiesQuery(uf), enabled: Boolean(uf) });

  // Cidade salva com grafia diferente da oficial: troca pelo nome do IBGE, ou limpa se não existir,
  // pra o valor salvo nunca ficar escondido atrás de um select mostrando "Selecione a cidade".
  if (cities && cityName && !cities.some((c) => c.nome === cityName)) {
    setCityNameState(cities.find((c) => sameCityName(c.nome, cityName))?.nome ?? '');
  }

  const setUf = (value: string) => {
    setTouched(true);
    setUfState(value);
    setCityNameState('');
    setCoords(null);
  };

  const setCityName = (value: string) => {
    setTouched(true);
    setCityNameState(value);
    setCoords(null);
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Seu navegador não permite acessar a localização.');
      return;
    }
    setError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: position }) => {
        const detected = await reverseGeocodeCity(position.latitude, position.longitude);
        const ibgeCities = detected ? await queryClient.fetchQuery(citiesQuery(detected.uf)).catch(() => []) : [];
        const match = detected && ibgeCities.find((c) => sameCityName(c.nome, detected.city));
        // A coordenada só vale junto com a cidade correspondente: sem match, nada muda e o
        // usuário escolhe na lista (cidade e ponto no mapa nunca ficam em desacordo).
        if (detected && match) {
          setTouched(true);
          setUfState(detected.uf);
          setCityNameState(match.nome);
          setCoords({ latitude: position.latitude, longitude: position.longitude });
        } else {
          setError('Não conseguimos identificar sua cidade. Selecione estado e cidade na lista.');
        }
        setLocating(false);
      },
      () => {
        setError('Não foi possível obter sua localização. Verifique a permissão do navegador.');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 15000 },
    );
  };

  /** Valida a seleção e resolve a coordenada: GPS tem prioridade; cidade nova (ou sem coordenada
   * salva ainda) vira o centro do município. `null` = seleção incompleta (erro já exibido). */
  const resolve = async (): Promise<ResolvedLocation | null> => {
    setError(null);
    if (!uf || !cityName) {
      setError('Selecione o estado e a cidade.');
      return null;
    }
    const city = formatCityWithUf(cityName, uf);
    const needsGeocode = !coords && (city !== user?.city || user?.latitude == null);
    const location = coords ?? (needsGeocode ? await geocodeCity(cityName, uf) : null);
    return { city, ...(location ?? {}), geocodeFailed: needsGeocode && !location };
  };

  return {
    uf,
    cityName,
    setUf,
    setCityName,
    states,
    statesError,
    cities,
    citiesLoading,
    citiesError,
    coords,
    touched,
    locating,
    detectCurrentLocation,
    error,
    setError,
    resolve,
  };
}

export type CityLocation = ReturnType<typeof useCityLocation>;
