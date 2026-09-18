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
export async function geocodeAddress(address: CepAddress): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const query = [address.street, address.neighborhood, address.city, address.state, 'Brasil']
      .filter(Boolean)
      .join(', ');
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const results = await response.json();
    if (!Array.isArray(results) || results.length === 0) return null;

    return { latitude: Number(results[0].lat), longitude: Number(results[0].lon) };
  } catch {
    return null;
  }
}
