import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { PriceRange, VenueCategory, VenueVibe } from '../../../shared/constants/domain.constants';

export interface VenueCatalogMetadata {
  slug: string;
  state: string;
  researchedAt: string;
  sourceUrls: string[];
  instagramUrl: string | null;
  openingHours: string | null;
  coordinatesAccuracy: 'approximate' | 'verified';
  coordinatesNote: string;
  priceRangeAccuracy: 'estimate' | 'verified';
  photo: { url: string; sourceUrl: string; credit: string; license: string } | null;
  notes: string[];
}

@Entity('venues')
export class Venue extends BaseEntity {
  @Column({ length: 160 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar' })
  category: VenueCategory;

  @Column({ name: 'music_genres', type: 'simple-array', default: '' })
  musicGenres: string[];

  @Column({ type: 'simple-array', default: '' })
  vibes: VenueVibe[];

  @Column({ name: 'price_range', type: 'varchar' })
  priceRange: PriceRange;

  @Column({ type: 'varchar' })
  address: string;

  @Index()
  @Column({ type: 'double precision' })
  latitude: number;

  @Index()
  @Column({ type: 'double precision' })
  longitude: number;

  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  @Column({ name: 'cover_image_url', type: 'varchar', nullable: true })
  coverImageUrl: string | null;

  @Column({ name: 'catalog_metadata', type: 'jsonb', nullable: true })
  catalogMetadata: VenueCatalogMetadata | null;

  /** Locais do catálogo/seed nascem true; local de conta de comércio (e o cadastrado via
   * POST /venues) nasce false e fica fora das buscas até o admin aprovar o comércio. */
  @Column({ type: 'boolean', default: true })
  verified: boolean;

  /** CNPJ da conta de comércio dona do local (ver VenuesService.createForBusiness); acompanha o
   * CNPJ da conta e volta a null quando o admin rejeita o cadastro (ver applyBusinessReview).
   * Não é único — uma rede pode ter várias unidades com o mesmo CNPJ. */
  @Index()
  @Column({ type: 'varchar', length: 14, nullable: true })
  cnpj: string | null;

  /** Conta de comércio dona do local (1 conta = 1 CNPJ = 1 local). Nasce com `verified=false`
   * e vira verificado quando o admin aprova o comércio (ver AdminService.reviewBusiness). */
  @Index()
  @Column({ name: 'owner_user_id', type: 'uuid', nullable: true })
  ownerUserId: string | null;
}
