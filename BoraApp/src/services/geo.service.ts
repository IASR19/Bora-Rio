/** Nominatim/OSM (gratuito, sem chave), o mesmo provedor do mapa e do geocodeAddress do CEP. */
async function nominatim<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/${path}`);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/** Coordenada aproximada (centro) de uma cidade digitada no perfil. Best-effort, como geocodeAddress. */
export async function geocodeCity(city: string): Promise<{ latitude: number; longitude: number } | null> {
  const results = await nominatim<{ lat: string; lon: string }[]>(
    `search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(city)}`,
  );
  if (!results?.length) return null;
  return { latitude: Number(results[0].lat), longitude: Number(results[0].lon) };
}

/** "Cidade - UF" a partir de uma coordenada (GPS do navegador). Best-effort. */
export async function reverseGeocodeCity(latitude: number, longitude: number): Promise<string | null> {
  const result = await nominatim<{ address?: Record<string, string> }>(
    `reverse?format=json&zoom=10&lat=${latitude}&lon=${longitude}`,
  );
  const address = result?.address;
  const city = address?.city ?? address?.town ?? address?.village ?? address?.municipality;
  if (!city) return null;
  const uf = address?.['ISO3166-2-lvl4']?.replace('BR-', '');
  return uf ? `${city} - ${uf}` : city;
}
