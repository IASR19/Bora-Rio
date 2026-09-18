import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BlockedUser } from './entities/blocked-user.entity';

@Injectable()
export class BlocksService {
  constructor(@InjectRepository(BlockedUser) private readonly blocksRepository: Repository<BlockedUser>) {}

  async myBlockedIds(userId: string): Promise<string[]> {
    const blocks = await this.blocksRepository.find({ where: { blockerId: userId } });
    return blocks.map((b) => b.blockedId);
  }

  async block(blockerId: string, blockedId: string): Promise<void> {
    if (blockerId === blockedId) return;
    const existing = await this.blocksRepository.findOne({ where: { blockerId, blockedId } });
    if (existing) return;
    await this.blocksRepository.save(this.blocksRepository.create({ blockerId, blockedId }));
  }

  async unblock(blockerId: string, blockedId: string): Promise<void> {
    await this.blocksRepository.delete({ blockerId, blockedId });
  }
}
