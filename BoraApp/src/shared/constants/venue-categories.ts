export const VENUE_CATEGORY_OPTIONS = [
  { value: 'festa', label: 'Baladas e casas noturnas' },
  { value: 'bar', label: 'Bares, pubs e botecos' },
  { value: 'samba', label: 'Samba, pagode e música ao vivo' },
  { value: 'beach_club', label: 'Beach clubs e quiosques' },
  { value: 'rooftop', label: 'Bares com vista e rooftops' },
  { value: 'praia', label: 'Praias' },
  { value: 'ponto_turistico', label: 'Pontos turísticos' },
  { value: 'cultura', label: 'Museus, cultura e história' },
  { value: 'parque', label: 'Parques e atrações familiares' },
  { value: 'aventura', label: 'Mirantes, trilhas e aventura' },
  { value: 'restaurante', label: 'Restaurantes' },
  { value: 'lounge', label: 'Lounges' },
] as const;

export type VenueCategory = (typeof VENUE_CATEGORY_OPTIONS)[number]['value'];

export function isVenueCategory(value: string | null): value is VenueCategory {
  return VENUE_CATEGORY_OPTIONS.some((option) => option.value === value);
}

export function venueCategoryLabel(category: string): string {
  return VENUE_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category;
}
