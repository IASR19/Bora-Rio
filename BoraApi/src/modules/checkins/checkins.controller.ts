import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ParseGuidPipe } from '../../shared/pipes/parse-guid.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { CheckinsService } from './checkins.service';
import { ConfirmCheckinDto } from './dto/confirm-checkin.dto';

@ApiTags('checkins')
@Controller('checkins')
export class CheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  @Get('qr/:eventId')
  generateQr(@Param('eventId', ParseGuidPipe) eventId: string) {
    return this.checkinsService.generateQrToken(eventId);
  }

  @Post()
  confirm(@Body() dto: ConfirmCheckinDto, @CurrentUser() user: JwtPayload) {
    return this.checkinsService.confirm(user.sub, dto);
  }
}
