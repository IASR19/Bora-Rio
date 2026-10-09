import 'dotenv/config';

import dataSource from '../data-source';
import { Venue } from '../modules/venues/entities/venue.entity';
import {
  MUSIC_GENRES,
  PRICE_RANGES,
  VENUE_CATEGORIES,
  VENUE_VIBES,
} from '../shared/constants/domain.constants';
import catalog from './venues.catalog.json';
import pending from './venues.pending.json';

export function validateCatalog(entries: typeof catalog): void {
  const identities = new Set<string>();
  const slugs = new Set<string>();
  for (const entry of entries) {
    const identity = `${entry.city}:${entry.name}`;
    if (identities.has(identity) || slugs.has(entry.catalogMetadata.slug))
      throw new Error(`Duplicate catalog entry: ${identity}`);
    identities.add(identity);
    slugs.add(entry.catalogMetadata.slug);
    if (
      !entry.name ||
      !entry.address ||
      !entry.city ||
      !entry.catalogMetadata.sourceUrls.length ||
      !(VENUE_CATEGORIES as readonly string[]).includes(entry.category) ||
      !(PRICE_RANGES as readonly string[]).includes(entry.priceRange) ||
      entry.vibes.some((v) => !(VENUE_VIBES as readonly string[]).includes(v)) ||
      entry.musicGenres.some((v) => !(MUSIC_GENRES as readonly string[]).includes(v)) ||
      !Number.isFinite(entry.latitude) ||
      !Number.isFinite(entry.longitude) ||
      entry.latitude < -90 ||
      entry.latitude > 90 ||
      entry.longitude < -180 ||
      entry.longitude > 180
    ) {
      throw new Error(`Invalid catalog entry: ${identity}`);
    }
    for (const url of [...entry.catalogMetadata.sourceUrls, entry.coverImageUrl].filter(Boolean)) {
      if (new URL(url!).protocol !== 'https:') throw new Error(`Invalid source/photo URL: ${identity}`);
    }
    if (entry.coverImageUrl !== (entry.catalogMetadata.photo?.url ?? null))
      throw new Error(`Missing photo provenance: ${identity}`);
  }
}

export async function seedCatalog(dryRun = false): Promise<void> {
  validateCatalog(catalog);
  console.log(
    `Catalog: ${catalog.length} places (${[...new Set(catalog.map((entry) => entry.city))].join(', ')}).`,
  );
  console.log(`Pending identification/operation: ${pending.map((entry) => entry.name).join(', ')}.`);
  if (dryRun) {
    console.log('Dry run passed. No database connection or writes.');
    return;
  }
  await dataSource.initialize();
  try {
    await dataSource.transaction(async (manager) => {
      // Serialize concurrent startup seeds: venues has no unique name constraint.
      await manager.query('SELECT pg_advisory_xact_lock($1)', [709102026]);
      const repository = manager.getRepository(Venue);
      for (const entry of catalog) {
        // Homonyms registered by users (unverified, or verified by their owner via CNPJ) are
        // not taken over: their data belongs to the owner. The catalog creates its own record.
        const candidates = await repository.find({ where: { name: entry.name, city: entry.city } });
        const existing =
          candidates.find((venue) => venue.catalogMetadata?.slug === entry.catalogMetadata.slug) ??
          candidates.find((venue) => venue.verified && !venue.cnpj) ??
          null;
        const values = entry as unknown as Partial<Venue>;
        const venue = existing
          ? repository.merge(existing, values)
          : repository.create({ ...values, verified: true });
        await repository.save(venue);
        console.log(`${existing ? 'Updated' : 'Created'}: ${entry.name} (${entry.city})`);
      }
    });
  } finally {
    await dataSource.destroy();
  }
  console.log('Catalog seed finished.');
}

if (require.main === module) {
  seedCatalog(process.argv.includes('--dry-run')).catch((error) => {
    console.error('Catalog seed failed', error);
    process.exitCode = 1;
  });
}
