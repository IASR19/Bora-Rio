const assert = require('node:assert/strict');
const { test } = require('node:test');
const { validateCatalog, seedCatalog } = require('../dist/seeds/seed');
const catalog = require('../dist/seeds/venues.catalog.json');
const dataSource = require('../dist/data-source').default;
const { VENUE_CATEGORIES } = require('../dist/shared/constants/domain.constants');

test('catalog uses known categories; rejects duplicates and missing provenance', () => {
  assert.ok(catalog.length > 0);
  assert.ok(catalog.every((v) => VENUE_CATEGORIES.includes(v.category)));
  validateCatalog(catalog);
  const unknownCategory = structuredClone(catalog);
  unknownCategory[0].category = 'categoria_inexistente';
  assert.throws(() => validateCatalog(unknownCategory), /Invalid catalog entry/);
  assert.throws(() => validateCatalog([...catalog, catalog[0]]), /Duplicate/);
  const invalid = structuredClone(catalog);
  invalid[0].catalogMetadata.photo = null;
  assert.throws(() => validateCatalog(invalid), /provenance/);
});

test('dry run never initializes a database connection', async (t) => {
  t.mock.method(console, 'log', () => {});
  const connect = t.mock.method(dataSource, 'initialize', () => {
    throw new Error('Unexpected connection');
  });
  await seedCatalog(true);
  assert.equal(connect.mock.callCount(), 0);
});

function mockSeedDatabase(t, initialRecords) {
  const records = [...initialRecords];
  const repository = {
    find: async ({ where }) => records.filter((v) => v.name === where.name && v.city === where.city),
    merge: (existing, values) => Object.assign(existing, values),
    create: (values) => ({ id: `new-${records.length}`, ...values }),
    save: async (venue) => {
      if (!records.includes(venue)) records.push(venue);
      return venue;
    },
  };
  const locks = [];
  t.mock.method(dataSource, 'initialize', async () => dataSource);
  t.mock.method(dataSource, 'destroy', async () => {});
  t.mock.method(dataSource, 'transaction', async (callback) =>
    callback({
      query: async (sql) => locks.push(sql),
      getRepository: () => repository,
    }),
  );
  return { records, locks };
}

test('repeated seeds update existing catalog places while preserving id and CNPJ', async (t) => {
  t.mock.method(console, 'log', () => {});
  const first = catalog[0];
  const { records, locks } = mockSeedDatabase(t, [
    { id: 'existing', ...first, description: 'Old description', cnpj: '12345678000199', verified: true },
  ]);
  await seedCatalog();
  await seedCatalog();
  assert.equal(records.length, catalog.length);
  const updated = records.find((v) => v.id === 'existing');
  assert.equal(updated.description, first.description);
  assert.equal(updated.cnpj, '12345678000199');
  assert.equal(updated.verified, true);
  assert.equal(locks.length, 2);
});

test('unverified user-created homonym is left untouched and the catalog creates its own place', async (t) => {
  t.mock.method(console, 'log', () => {});
  const first = catalog[0];
  const userVenue = {
    id: 'user-created',
    name: first.name,
    city: first.city,
    description: 'User description',
    catalogMetadata: null,
    verified: false,
  };
  const { records } = mockSeedDatabase(t, [userVenue]);
  await seedCatalog();
  assert.equal(records.length, catalog.length + 1);
  assert.equal(userVenue.description, 'User description');
  assert.equal(userVenue.verified, false);
  const catalogVenue = records.find((v) => v.name === first.name && v.id !== 'user-created');
  assert.equal(catalogVenue.verified, true);
  assert.equal(catalogVenue.catalogMetadata.slug, first.catalogMetadata.slug);
});

test('homonym verified by its owner via CNPJ keeps the owner data', async (t) => {
  t.mock.method(console, 'log', () => {});
  const first = catalog[0];
  const ownerVenue = {
    id: 'owner-verified',
    name: first.name,
    city: first.city,
    description: 'Owner description',
    address: 'Owner address',
    cnpj: '12345678000199',
    catalogMetadata: null,
    verified: true,
  };
  const { records } = mockSeedDatabase(t, [ownerVenue]);
  await seedCatalog();
  assert.equal(records.length, catalog.length + 1);
  assert.equal(ownerVenue.description, 'Owner description');
  assert.equal(ownerVenue.address, 'Owner address');
  assert.equal(ownerVenue.catalogMetadata, null);
});

test('failed write closes the database connection and propagates the error', async (t) => {
  t.mock.method(console, 'log', () => {});
  t.mock.method(dataSource, 'initialize', async () => dataSource);
  const close = t.mock.method(dataSource, 'destroy', async () => {});
  t.mock.method(dataSource, 'transaction', async (callback) =>
    callback({
      query: async () => {},
      getRepository: () => ({
        find: async () => [],
        create: (v) => v,
        save: async () => {
          throw new Error('Write failed');
        },
      }),
    }),
  );
  await assert.rejects(seedCatalog(), /Write failed/);
  assert.equal(close.mock.callCount(), 1);
});
