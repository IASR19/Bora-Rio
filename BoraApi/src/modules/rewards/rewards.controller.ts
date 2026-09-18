import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ParseGuidPipe } from '../../shared/pipes/parse-guid.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { RewardsService } from './rewards.service';

@ApiTags('rewards')
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Public()
  @Get('event/:eventId')
  findByEvent(@Param('eventId', ParseGuidPipe) eventId: string) {
    return this.rewardsService.findByEvent(eventId);
  }

  @Get('event/:eventId/redemptions/mine')
  myRedemptions(@Param('eventId', ParseGuidPipe) eventId: string, @CurrentUser() user: JwtPayload) {
    return this.rewardsService.myRedemptions(user.sub, eventId);
  }

  @Post(':id/redeem')
  redeem(@Param('id', ParseGuidPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.rewardsService.redeem(user.sub, id);
  }
}
