/** Haversine distance in kilometers between two lat/lng points. */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Raio de busca: sem localização conhecida ou com raio 0 ("qualquer distância"), não corta nada. */
export function isWithinRadius(distance: number | null, maxDistanceKm: number | null | undefined): boolean {
  if (distance == null || !maxDistanceKm) return true;
  return distance <= maxDistanceKm;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
