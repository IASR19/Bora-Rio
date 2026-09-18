import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { PriceRange, VenueCategory, VenueVibe } from '../../../shared/constants/domain.constants';

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

  /** Locais do catálogo/seed nascem true; locais cadastrados por usuário ao criar
   * um evento nascem false — controla se eventos ali podem se auto-publicar. */
  @Column({ type: 'boolean', default: true })
  verified: boolean;

  /** Só dígito verificador validado (ver VenuesService.verifyWithCnpj). Não é
   * único — uma rede pode ter várias unidades com o mesmo CNPJ. */
  @Index()
  @Column({ type: 'varchar', length: 14, nullable: true })
  cnpj: string | null;
}
