import { Injectable } from '@nestjs/common';

export interface EventTrustInput {
  phoneVerified: boolean;
  accountAgeDays: number;
  venueVerified: boolean;
  startsAt: Date;
  hasDuplicate: boolean;
}

const MIN_ACCOUNT_AGE_DAYS = 3;
const MAX_DAYS_AHEAD = 180;

const WEIGHTS = {
  phoneVerified: 25,
  accountAge: 15,
  venueVerified: 30,
  plausibleDate: 15,
  noDuplicate: 15,
} as const;

/**
 * Sinais de confiança para publicação de evento criado por usuário (ver
 * escopo.md — pergunta sobre como validar veracidade de evento). Sem ML,
 * só regras — a decisão de publicar ou não também exige `venueVerified`
 * (ver EventsService.create), não só o score.
 */
@Injectable()
export class EventTrustService {
  calculate(input: EventTrustInput): number {
    let score = 0;
    if (input.phoneVerified) score += WEIGHTS.phoneVerified;
    if (input.accountAgeDays >= MIN_ACCOUNT_AGE_DAYS) score += WEIGHTS.accountAge;
    if (input.venueVerified) score += WEIGHTS.venueVerified;
    if (this.isPlausibleDate(input.startsAt)) score += WEIGHTS.plausibleDate;
    if (!input.hasDuplicate) score += WEIGHTS.noDuplicate;
    return score;
  }

  private isPlausibleDate(startsAt: Date): boolean {
    const now = Date.now();
    const maxAhead = now + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000;
    return startsAt.getTime() > now && startsAt.getTime() <= maxAhead;
  }
}
