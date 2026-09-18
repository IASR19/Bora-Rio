import 'dotenv/config';

import dataSource from '../data-source';
import { Event } from '../modules/events/entities/event.entity';
import { Reward } from '../modules/rewards/entities/reward.entity';
import { Venue } from '../modules/venues/entities/venue.entity';

async function seed() {
  await dataSource.initialize();

  const venueRepo = dataSource.getRepository(Venue);
  const eventRepo = dataSource.getRepository(Event);
  const rewardRepo = dataSource.getRepository(Reward);

  let venue = await venueRepo.findOne({ where: { name: 'Marea Beach Club' } });
  if (!venue) {
    venue = await venueRepo.save(
      venueRepo.create({
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
        coverImageUrl: null,
      }),
    );
    console.log('Seeded venue: Marea Beach Club');
  }

  let event = await eventRepo.findOne({ where: { name: 'Sunset do Marea' } });
  if (!event) {
    const startsAt = new Date();
    startsAt.setHours(22, 0, 0, 0);

    event = await eventRepo.save(
      eventRepo.create({
        venueId: venue.id,
        name: 'Sunset do Marea',
        description: 'Um sunset incrível com pagode, boa energia e o mar como cenário.',
        musicGenres: ['pagode'],
        startsAt,
        endsAt: null,
        targetAge: 30,
        coverImageUrl: null,
        ticketUrl: null,
      }),
    );
    console.log('Seeded event: Sunset do Marea');
  }

  const existingReward = await rewardRepo.findOne({ where: { eventId: event.id } });
  if (!existingReward) {
    await rewardRepo.save(
      rewardRepo.create({
        eventId: event.id,
        title: '2 drinks',
        validFrom: '19:00:00',
        validUntil: '22:00:00',
        quantityTotal: 50,
        quantityRedeemed: 0,
      }),
    );
    console.log('Seeded reward: 2 drinks');
  }

  await dataSource.destroy();
  console.log('Seed finished.');
}

seed().catch((error) => {
  console.error('Seed failed', error);
  process.exit(1);
});
