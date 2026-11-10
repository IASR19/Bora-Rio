import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ParseGuidPipe } from '../../shared/pipes/parse-guid.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { BusinessAccountGuard } from '../business/guards/business-account.guard';
import { DeliverRewardDto } from './dto/promo.dto';
import { PromosService } from './promos.service';

/** Lado do comércio do QR impresso: só o estabelecimento aprovado dono do local da promoção. */
@ApiTags('business')
@UseGuards(BusinessAccountGuard)
@Controller('business')
export class BusinessPromosController {
  constructor(private readonly promosService: PromosService) {}

  @Get('rewards/:id/qr')
  qr(@Param('id', ParseGuidPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.promosService.getQr(user.sub, id);
  }

  @Get('events/:eventId/promotions/stats')
  stats(@Param('eventId', ParseGuidPipe) eventId: string, @CurrentUser() user: JwtPayload) {
    return this.promosService.eventStats(user.sub, eventId);
  }

  @Get('rewards/:id/redemptions')
  redemptions(@Param('id', ParseGuidPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.promosService.redemptions(user.sub, id);
  }

  @Post('rewards/:id/deliver')
  @HttpCode(200)
  deliver(
    @Param('id', ParseGuidPipe) id: string,
    @Body() dto: DeliverRewardDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.promosService.deliver(user.sub, id, dto.publicCode);
  }
}
