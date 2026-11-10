export interface CepAddress {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

/** ViaCEP — API pública brasileira, gratuita e sem chave. */
export async function lookupCep(cep: string): Promise<CepAddress | null> {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) return null;

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!response.ok) return null;

  const data = await response.json();
  if (data.erro) return null;

  return {
    cep: data.cep,
    street: data.logradouro ?? '',
    neighborhood: data.bairro ?? '',
    city: data.localidade ?? '',
    state: data.uf ?? '',
  };
}

/**
 * Geocodifica o endereço resolvido pelo CEP pra coordenadas (usadas no cálculo de
 * distância/BORA Score). Best-effort: usa o mesmo provedor gratuito (Nominatim/OSM)
 * do mapa — se não achar, o cadastro segue sem lat/lng, só com a cidade.
 */
async function geocodeQuery(query: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const results = await response.json();
    if (!Array.isArray(results) || results.length === 0) return null;

    const latitude = Number(results[0].lat);
    const longitude = Number(results[0].lon);
    return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
  } catch {
    return null;
  }
}

export async function geocodeAddress(address: CepAddress): Promise<{ latitude: number; longitude: number } | null> {
  return geocodeQuery(
    [address.street, address.neighborhood, address.city, address.state, 'Brasil'].filter(Boolean).join(', '),
  );
}

/** Tenta consultas cada vez mais curtas (rua+cidade+UF, cidade+UF, CEP) até achar coordenadas. */
export async function geocodeWithFallback(
  address: CepAddress,
): Promise<{ latitude: number; longitude: number } | null> {
  const queries = [
    [address.street, address.city, address.state, 'Brasil'],
    [address.city, address.state, 'Brasil'],
    [address.cep, 'Brasil'],
  ]
    .map((parts) => parts.filter(Boolean).join(', '))
    .filter((query, index, all) => query && all.indexOf(query) === index);
  for (const query of queries) {
    const found = await geocodeQuery(query);
    if (found) return found;
  }
  return null;
}
