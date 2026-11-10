import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ParseGuidPipe } from '../../shared/pipes/parse-guid.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { BusinessAccountGuard } from '../business/guards/business-account.guard';
import { UserAccountGuard } from '../business/guards/user-account.guard';
import { CreateRewardDto, UpdateRewardDto } from './dto/reward.dto';
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

  /** Promoções são criadas, editadas e apagadas só pelo comércio dono do local do evento. */
  @UseGuards(BusinessAccountGuard)
  @Post('event/:eventId')
  create(
    @Param('eventId', ParseGuidPipe) eventId: string,
    @Body() dto: CreateRewardDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.rewardsService.create(user.sub, eventId, dto);
  }

  @UseGuards(BusinessAccountGuard)
  @Patch(':id')
  update(
    @Param('id', ParseGuidPipe) id: string,
    @Body() dto: UpdateRewardDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.rewardsService.update(user.sub, id, dto);
  }

  @UseGuards(BusinessAccountGuard)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseGuidPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.rewardsService.remove(user.sub, id);
  }

  @UseGuards(UserAccountGuard)
  @Post(':id/redeem')
  redeem(@Param('id', ParseGuidPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.rewardsService.redeem(user.sub, id);
  }
}
