export const INTENTIONS = [
  'conhecer_pessoas',
  'relacionamento',
  'amizade',
  'sair_hoje',
  'musica',
  'festas',
  'gastronomia',
  'experiencias',
  'turismo',
] as const;
export type Intention = (typeof INTENTIONS)[number];

export const MUSIC_GENRES = [
  'pagode',
  'samba',
  'sertanejo',
  'eletronico',
  'funk',
  'pop',
  'rock',
  'mpb',
  'jazz',
  'outros',
] as const;
export type MusicGenre = (typeof MUSIC_GENRES)[number];

export const VENUE_VIBES = [
  'sofisticado',
  'casual',
  'animado',
  'tranquilo',
  'balada',
  'bar',
  'rooftop',
  'restaurante',
  'praia',
  'lounge',
] as const;
export type VenueVibe = (typeof VENUE_VIBES)[number];

export const PRICE_RANGES = ['economico', 'medio', 'premium'] as const;
export type PriceRange = (typeof PRICE_RANGES)[number];

export const DISTANCE_OPTIONS_KM = [3, 5, 10, 20, 0] as const; // 0 = qualquer distância

export const VENUE_CATEGORIES = ['bar', 'festa', 'restaurante', 'rooftop', 'praia', 'lounge'] as const;
export type VenueCategory = (typeof VENUE_CATEGORIES)[number];

/** Score weights — see escopo.md #10 and #38 */
export const SCORE_WEIGHTS = {
  music: 30,
  venueType: 20,
  age: 15,
  distance: 15,
  price: 10,
  intent: 10,
} as const;
