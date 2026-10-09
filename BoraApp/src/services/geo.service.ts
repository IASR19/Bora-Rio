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

/** Coordenada aproximada (centro) de um município já validado pelo IBGE. Best-effort. */
export async function geocodeCity(city: string, uf: string): Promise<{ latitude: number; longitude: number } | null> {
  const results = await nominatim<{ lat: string; lon: string }[]>(
    `search?format=json&limit=1&countrycodes=br&city=${encodeURIComponent(city)}&state=${encodeURIComponent(uf)}`,
  );
  if (!results?.length) return null;
  return { latitude: Number(results[0].lat), longitude: Number(results[0].lon) };
}

/** Município e UF de uma coordenada (GPS do navegador). Best-effort; o nome ainda é conferido no IBGE. */
export async function reverseGeocodeCity(latitude: number, longitude: number): Promise<{ city: string; uf: string } | null> {
  const result = await nominatim<{ address?: Record<string, string> }>(
    `reverse?format=json&zoom=10&lat=${latitude}&lon=${longitude}`,
  );
  const address = result?.address;
  const city = address?.city ?? address?.town ?? address?.village ?? address?.municipality;
  const uf = address?.['ISO3166-2-lvl4']?.replace('BR-', '');
  return city && uf ? { city, uf } : null;
}
