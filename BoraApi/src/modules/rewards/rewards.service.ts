import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BusinessException } from '../../common/exceptions/business.exception';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { CheckIn } from '../checkins/entities/checkin.entity';
import { Reward } from './entities/reward.entity';
import { RewardRedemption } from './entities/reward-redemption.entity';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward) private readonly rewardsRepository: Repository<Reward>,
    @InjectRepository(RewardRedemption)
    private readonly redemptionsRepository: Repository<RewardRedemption>,
    @InjectRepository(CheckIn) private readonly checkinsRepository: Repository<CheckIn>,
  ) {}

  findByEvent(eventId: string): Promise<Reward[]> {
    return this.rewardsRepository.find({ where: { eventId } });
  }

  async redeem(userId: string, rewardId: string): Promise<RewardRedemption> {
    const reward = await this.rewardsRepository.findOne({ where: { id: rewardId } });
    if (!reward) throw new ResourceNotFoundException('Reward', rewardId);

    if (reward.quantityRedeemed >= reward.quantityTotal) {
      throw new BusinessException('Benefício esgotado');
    }

    const checkin = await this.checkinsRepository.findOne({ where: { userId, eventId: reward.eventId } });
    if (!checkin) {
      throw new BusinessException('É necessário fazer check-in antes de resgatar o benefício');
    }

    reward.quantityRedeemed += 1;
    await this.rewardsRepository.save(reward);

    return this.redemptionsRepository.save(
      this.redemptionsRepository.create({ rewardId, userId, redeemedAt: new Date() }),
    );
  }
}
