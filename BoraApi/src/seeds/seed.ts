import 'dotenv/config';

import dataSource from '../data-source';
import { Event } from '../modules/events/entities/event.entity';
import { Reward } from '../modules/rewards/entities/reward.entity';
import { Venue } from '../modules/venues/entities/venue.entity';
import { MusicGenre, PriceRange, VenueCategory, VenueVibe } from '../shared/constants/domain.constants';

interface VenueSeed {
  name: string;
  description: string;
  category: VenueCategory;
  musicGenres: MusicGenre[];
  vibes: VenueVibe[];
  priceRange: PriceRange;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  /** Arquivo gerado em BoraApp/public/venues (ver escopo/observacoes/features.md). */
  coverImageSlug: string;
  event: {
    name: string;
    description: string;
    startHour: number;
    daysFromNow: number;
    targetAge: number;
  };
  reward?: {
    title: string;
    validFrom: string;
    validUntil: string;
    quantityTotal: number;
  };
}

/**
 * Estabelecimentos genéricos de demonstração — nomes e exemplos alinhados com
 * escopo.md (#8, #9, #11, #12, #45) e o mockup Fluxo.png, cobrindo as
 * categorias/vibes/faixas de preço do MVP.
 */
const VENUES: VenueSeed[] = [
  {
    name: 'Marea Beach Club',
    description: 'Rooftop com vista para o mar, pagode e open bar na Barra da Tijuca.',
    category: 'rooftop',
    musicGenres: ['pagode', 'samba'],
    vibes: ['rooftop', 'animado', 'praia'],
    priceRange: 'medio',
    address: 'Av. Lúcio Costa, 3300 - Barra da Tijuca, Rio de Janeiro - RJ',
    latitude: -23.0136,
    longitude: -43.3255,
    city: 'Rio de Janeiro',
    coverImageSlug: 'marea-beach-club',
    event: {
      name: 'Sunset do Marea',
      description: 'Um sunset incrível com pagode, boa energia e o mar como cenário.',
      startHour: 22,
      daysFromNow: 0,
      targetAge: 30,
    },
    reward: { title: '2 drinks', validFrom: '19:00:00', validUntil: '22:00:00', quantityTotal: 50 },
  },
  {
    name: 'Quartas do Vidigal',
    description: 'Bar boêmio no Vidigal com roda de pagode e vista pra pedra.',
    category: 'bar',
    musicGenres: ['pagode', 'funk'],
    vibes: ['casual', 'animado'],
    priceRange: 'economico',
    address: 'Estr. do Vidigal, 219 - Vidigal, Rio de Janeiro - RJ',
    latitude: -22.9925,
    longitude: -43.2405,
    city: 'Rio de Janeiro',
    coverImageSlug: 'quartas-do-vidigal',
    event: {
      name: 'Quartas do Vidigal',
      description: 'A quarta boêmia mais animada da zona sul, com pagode ao vivo.',
      startHour: 20,
      daysFromNow: 0,
      targetAge: 27,
    },
    reward: { title: '1 caipirinha', validFrom: '20:00:00', validUntil: '23:00:00', quantityTotal: 40 },
  },
  {
    name: 'Bar do Zeca',
    description: 'Boteco de esquina no Recreio, samba de raiz e petiscos.',
    category: 'praia',
    musicGenres: ['samba', 'mpb'],
    vibes: ['casual', 'praia'],
    priceRange: 'economico',
    address: 'Av. das Américas, 5000 - Recreio dos Bandeirantes, Rio de Janeiro - RJ',
    latitude: -23.0245,
    longitude: -43.468,
    city: 'Rio de Janeiro',
    coverImageSlug: 'bar-do-zeca',
    event: {
      name: 'Sambinha do Zeca',
      description: 'Roda de samba semanal com os amigos do bairro.',
      startHour: 18,
      daysFromNow: 1,
      targetAge: 35,
    },
  },
  {
    name: 'Skyline Rooftop',
    description: 'Rooftop moderno na Barra com DJ, drinks autorais e vista 360°.',
    category: 'rooftop',
    musicGenres: ['eletronico', 'pop'],
    vibes: ['rooftop', 'sofisticado', 'balada'],
    priceRange: 'premium',
    address: 'Av. Embaixador Abelardo Bueno, 1300 - Barra da Tijuca, Rio de Janeiro - RJ',
    latitude: -23.009,
    longitude: -43.32,
    city: 'Rio de Janeiro',
    coverImageSlug: 'skyline-rooftop',
    event: {
      name: 'Skyline Night',
      description: 'Sunset eletrônico com line-up de DJs residentes.',
      startHour: 23,
      daysFromNow: 0,
      targetAge: 28,
    },
    reward: { title: '2 drinks autorais', validFrom: '21:00:00', validUntil: '23:00:00', quantityTotal: 30 },
  },
  {
    name: 'Oro Bistrô',
    description: 'Gastronomia contemporânea no Leblon, ambiente sofisticado e música ao vivo.',
    category: 'restaurante',
    musicGenres: ['mpb', 'jazz'],
    vibes: ['sofisticado', 'restaurante', 'tranquilo'],
    priceRange: 'premium',
    address: 'Rua Dias Ferreira, 45 - Leblon, Rio de Janeiro - RJ',
    latitude: -22.9845,
    longitude: -43.2245,
    city: 'Rio de Janeiro',
    coverImageSlug: 'oro-bistro',
    event: {
      name: 'Jantar ao Vivo no Oro',
      description: 'Trio de jazz acompanhando um menu degustação especial.',
      startHour: 20,
      daysFromNow: 2,
      targetAge: 32,
    },
  },
  {
    name: 'Casa Rosa Lapa',
    description: 'Casa histórica na Lapa com pista de dança e line-up de festa até o amanhecer.',
    category: 'festa',
    musicGenres: ['eletronico', 'funk'],
    vibes: ['balada', 'animado', 'lounge'],
    priceRange: 'medio',
    address: 'Rua do Núncio, 10 - Lapa, Rio de Janeiro - RJ',
    latitude: -22.9133,
    longitude: -43.1809,
    city: 'Rio de Janeiro',
    coverImageSlug: 'casa-rosa-lapa',
    event: {
      name: 'Festa X',
      description: 'A festa eletrônica mais comentada da Lapa, open bar até a 1h.',
      startHour: 23,
      daysFromNow: 0,
      targetAge: 26,
    },
    reward: { title: '2 drinks', validFrom: '23:00:00', validUntil: '01:00:00', quantityTotal: 60 },
  },
];

async function seed() {
  await dataSource.initialize();

  const venueRepo = dataSource.getRepository(Venue);
  const eventRepo = dataSource.getRepository(Event);
  const rewardRepo = dataSource.getRepository(Reward);

  for (const seedData of VENUES) {
    const coverImageUrl = `/venues/${seedData.coverImageSlug}.webp`;
    let venue = await venueRepo.findOne({ where: { name: seedData.name } });
    if (!venue) {
      venue = await venueRepo.save(
        venueRepo.create({
          name: seedData.name,
          description: seedData.description,
          category: seedData.category,
          musicGenres: seedData.musicGenres,
          vibes: seedData.vibes,
          priceRange: seedData.priceRange,
          address: seedData.address,
          latitude: seedData.latitude,
          longitude: seedData.longitude,
          city: seedData.city,
          coverImageUrl,
        }),
      );
      console.log(`Seeded venue: ${seedData.name}`);
    } else {
      // Mantém o registro existente sincronizado com o seed — evita ter que
      // apagar o banco toda vez que um dado de exemplo muda (ex.: categoria).
      Object.assign(venue, {
        description: seedData.description,
        category: seedData.category,
        musicGenres: seedData.musicGenres,
        vibes: seedData.vibes,
        priceRange: seedData.priceRange,
        address: seedData.address,
        latitude: seedData.latitude,
        longitude: seedData.longitude,
        city: seedData.city,
        coverImageUrl,
      });
      venue = await venueRepo.save(venue);
      console.log(`Updated venue: ${seedData.name}`);
    }

    let event = await eventRepo.findOne({ where: { name: seedData.event.name } });
    if (!event) {
      const startsAt = new Date();
      startsAt.setDate(startsAt.getDate() + seedData.event.daysFromNow);
      startsAt.setHours(seedData.event.startHour, 0, 0, 0);

      event = await eventRepo.save(
        eventRepo.create({
          venueId: venue.id,
          name: seedData.event.name,
          description: seedData.event.description,
          musicGenres: seedData.musicGenres,
          startsAt,
          endsAt: null,
          targetAge: seedData.event.targetAge,
          coverImageUrl,
          ticketUrl: null,
        }),
      );
      console.log(`Seeded event: ${seedData.event.name}`);
    } else if (event.coverImageUrl !== coverImageUrl) {
      event.coverImageUrl = coverImageUrl;
      event = await eventRepo.save(event);
      console.log(`Updated cover image: ${seedData.event.name}`);
    }

    if (seedData.reward) {
      const existingReward = await rewardRepo.findOne({ where: { eventId: event.id } });
      if (!existingReward) {
        await rewardRepo.save(
          rewardRepo.create({
            eventId: event.id,
            title: seedData.reward.title,
            validFrom: seedData.reward.validFrom,
            validUntil: seedData.reward.validUntil,
            quantityTotal: seedData.reward.quantityTotal,
            quantityRedeemed: 0,
          }),
        );
        console.log(`Seeded reward: ${seedData.reward.title} (${seedData.event.name})`);
      }
    }
  }

  await dataSource.destroy();
  console.log('Seed finished.');
}

seed().catch((error) => {
  console.error('Seed failed', error);
  process.exit(1);
});
