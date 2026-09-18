import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(@InjectRepository(Favorite) private readonly favoritesRepository: Repository<Favorite>) {}

  async myVenueIds(userId: string): Promise<string[]> {
    const favorites = await this.favoritesRepository.find({ where: { userId } });
    return favorites.map((f) => f.venueId);
  }

  async add(userId: string, venueId: string): Promise<void> {
    const existing = await this.favoritesRepository.findOne({ where: { userId, venueId } });
    if (existing) return;
    await this.favoritesRepository.save(this.favoritesRepository.create({ userId, venueId }));
  }

  async remove(userId: string, venueId: string): Promise<void> {
    await this.favoritesRepository.delete({ userId, venueId });
  }
}
