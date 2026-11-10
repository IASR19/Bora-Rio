import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ParseGuidPipe } from '../../shared/pipes/parse-guid.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { BusinessAccountGuard } from '../business/guards/business-account.guard';
import { UserAccountGuard } from '../business/guards/user-account.guard';
import { CheckinsService } from './checkins.service';
import { ConfirmCheckinDto } from './dto/confirm-checkin.dto';

@ApiTags('checkins')
@Controller('checkins')
export class CheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  /** QR de check-in: só o comércio aprovado dono do local do evento. */
  @UseGuards(BusinessAccountGuard)
  @Get('qr/:eventId')
  generateQr(@Param('eventId', ParseGuidPipe) eventId: string, @CurrentUser() user: JwtPayload) {
    return this.checkinsService.generateQrToken(user.sub, eventId);
  }

  @Get('mine/count')
  myCount(@CurrentUser() user: JwtPayload) {
    return this.checkinsService.countByUser(user.sub);
  }

  @UseGuards(UserAccountGuard)
  @Post()
  confirm(@Body() dto: ConfirmCheckinDto, @CurrentUser() user: JwtPayload) {
    return this.checkinsService.confirm(user.sub, dto);
  }
}
