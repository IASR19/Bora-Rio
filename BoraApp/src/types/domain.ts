export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  phoneVerified: boolean;
  birthDate: string | null;
  gender: string;
  avatarUrl: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  showInWhoIsGoing: boolean;
  subscriptionStatus: 'free' | 'active' | 'canceled';
}

export interface UserPreferences {
  intentions: string[];
  musicGenres: string[];
  venueVibes: string[];
  ageInterestMin: number | null;
  ageInterestMax: number | null;
  maxDistanceKm: number;
  priceRanges: string[];
}

export interface Venue {
  id: string;
  name: string;
  description: string | null;
  category: string;
  musicGenres: string[];
  vibes: string[];
  priceRange: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string | null;
  coverImageUrl: string | null;
  boraScore?: number;
  distanceKm?: number | null;
}

export interface BoraEvent {
  id: string;
  venueId: string;
  venue?: Venue;
  name: string;
  description: string | null;
  musicGenres: string[];
  startsAt: string;
  endsAt: string | null;
  targetAge: number | null;
  coverImageUrl: string | null;
}

export interface PublicParticipant {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface EventParticipants {
  interested: PublicParticipant[];
  confirmed: PublicParticipant[];
  checkedIn: PublicParticipant[];
}

export interface Reward {
  id: string;
  eventId: string;
  title: string;
  validFrom: string;
  validUntil: string;
  quantityTotal: number;
  quantityRedeemed: number;
}
