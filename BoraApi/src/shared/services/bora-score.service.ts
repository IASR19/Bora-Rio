import { Injectable } from '@nestjs/common';

import { SCORE_WEIGHTS } from '../constants/domain.constants';

export interface ScoreInput {
  userMusicGenres: string[];
  venueMusicGenres: string[];
  userVibes: string[];
  venueVibes: string[];
  userAgeMin: number | null;
  userAgeMax: number | null;
  venueTargetAge: number | null;
  userMaxDistanceKm: number;
  distanceKm: number;
  userPriceRanges: string[];
  venuePriceRange: string;
  userIntentions: string[];
  venueIntentions: string[];
}

/**
 * Rule-based BORA Score (see escopo.md #10 e #38).
 * No ML in the MVP — pure weighted overlap, kept as the single source of truth
 * so every screen that shows a score agrees with the others.
 */
@Injectable()
export class BoraScoreService {
  calculate(input: ScoreInput): number {
    const musicScore = this.overlapRatio(input.userMusicGenres, input.venueMusicGenres) * SCORE_WEIGHTS.music;
    const venueTypeScore = this.overlapRatio(input.userVibes, input.venueVibes) * SCORE_WEIGHTS.venueType;
    const ageScore = this.ageMatch(input) * SCORE_WEIGHTS.age;
    const distanceScore = this.distanceMatch(input) * SCORE_WEIGHTS.distance;
    const priceScore = this.overlapRatio(input.userPriceRanges, [input.venuePriceRange]) * SCORE_WEIGHTS.price;
    const intentScore = this.overlapRatio(input.userIntentions, input.venueIntentions) * SCORE_WEIGHTS.intent;

    const total = musicScore + venueTypeScore + ageScore + distanceScore + priceScore + intentScore;
    return Math.round(Math.min(100, Math.max(0, total)));
  }

  private overlapRatio(a: string[], b: string[]): number {
    if (!a?.length || !b?.length) return 0;
    const set = new Set(b);
    const matches = a.filter((item) => set.has(item)).length;
    return Math.min(1, matches / Math.max(1, Math.min(a.length, b.length)));
  }

  private ageMatch(input: ScoreInput): number {
    if (!input.venueTargetAge || !input.userAgeMin || !input.userAgeMax) return 0.5;
    return input.venueTargetAge >= input.userAgeMin && input.venueTargetAge <= input.userAgeMax ? 1 : 0.2;
  }

  private distanceMatch(input: ScoreInput): number {
    if (!input.userMaxDistanceKm) return 1; // "qualquer distância"
    if (input.distanceKm > input.userMaxDistanceKm) return 0;
    return 1 - input.distanceKm / input.userMaxDistanceKm;
  }
}
