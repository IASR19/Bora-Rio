const assert = require('node:assert/strict');
const { test } = require('node:test');
require('reflect-metadata');
const { isWithinRadius } = require('../dist/shared/helpers/geo.helper');
const { VenuesService } = require('../dist/modules/venues/venues.service');
const { EventsService } = require('../dist/modules/events/events.service');
const { BoraScoreService } = require('../dist/shared/services/bora-score.service');

// Santa Rita do Sapucaí (user) and two places: one in town, one in Copacabana (~270 km).
const USER = { lat: -22.2521, lng: -45.7053 };
const NEAR = { id: 'near', name: 'Perto', latitude: -22.2530, longitude: -45.7040, musicGenres: [], vibes: [], priceRange: 'medio' };
const FAR = { id: 'far', name: 'Longe', latitude: -22.9712, longitude: -43.1823, musicGenres: [], vibes: [], priceRange: 'medio' };

function queryBuilder(rows) {
  const qb = {
    leftJoinAndSelect: () => qb,
    where: () => qb,
    andWhere: () => qb,
    orderBy: () => qb,
    getMany: async () => rows,
  };
  return qb;
}

function venuesService() {
  return new VenuesService({ createQueryBuilder: () => queryBuilder([NEAR, FAR]) }, new BoraScoreService());
}

function eventsService() {
  const events = [NEAR, FAR].map((venue) => ({ id: `event-${venue.id}`, venue, musicGenres: [], targetAge: null }));
  return new EventsService({ createQueryBuilder: () => queryBuilder(events) }, {}, new BoraScoreService(), {}, {});
}

const ids = (rows) => rows.map((row) => row.id).sort();

test('isWithinRadius: 0 means any distance; unknown location never filters', () => {
  assert.equal(isWithinRadius(271, 10), false);
  assert.equal(isWithinRadius(2, 3), true);
  assert.equal(isWithinRadius(271, 0), true);
  assert.equal(isWithinRadius(null, 10), true);
  assert.equal(isWithinRadius(271, null), true);
});

test('venues: explicit radius cuts far places; 0 keeps everything', async () => {
  const service = venuesService();
  assert.deepEqual(ids(await service.search({ ...USER, maxDistanceKm: 10 }, null)), ['near']);
  assert.deepEqual(ids(await service.search({ ...USER, maxDistanceKm: 0 }, null)), ['far', 'near']);
});

test('venues: without explicit radius, the user preference applies', async () => {
  const service = venuesService();
  assert.deepEqual(ids(await service.search({ ...USER }, { maxDistanceKm: 10 })), ['near']);
});

test('venues: without user location nothing is filtered', async () => {
  const service = venuesService();
  assert.deepEqual(ids(await service.search({ maxDistanceKm: 10 }, null)), ['far', 'near']);
});

test('events: radius cuts far events, but a venueId search is never cut', async () => {
  const service = eventsService();
  assert.deepEqual(ids(await service.search({ ...USER, maxDistanceKm: 10 }, null)), ['event-near']);
  assert.deepEqual(
    ids(await service.search({ ...USER, maxDistanceKm: 10, venueId: 'far' }, null)),
    ['event-far', 'event-near'],
  );
});
