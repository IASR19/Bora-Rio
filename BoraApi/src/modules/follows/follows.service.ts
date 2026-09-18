import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Follow } from './entities/follow.entity';

@Injectable()
export class FollowsService {
  constructor(@InjectRepository(Follow) private readonly followsRepository: Repository<Follow>) {}

  async myFollowingIds(userId: string): Promise<string[]> {
    const follows = await this.followsRepository.find({ where: { followerId: userId } });
    return follows.map((f) => f.followingId);
  }

  async follow(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) return;
    const existing = await this.followsRepository.findOne({ where: { followerId, followingId } });
    if (existing) return;
    await this.followsRepository.save(this.followsRepository.create({ followerId, followingId }));
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    await this.followsRepository.delete({ followerId, followingId });
  }
}
