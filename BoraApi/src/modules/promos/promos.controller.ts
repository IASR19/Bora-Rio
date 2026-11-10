import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { UserAccountGuard } from '../business/guards/user-account.guard';
import { RecordScanDto } from './dto/promo.dto';
import { PromosService } from './promos.service';

/** Página do QR impresso da promoção (`/p/<código>` no app). */
@ApiTags('promos')
@Controller('promos')
export class PromosController {
  constructor(private readonly promosService: PromosService) {}

  @Public()
  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.promosService.getPromo(code);
  }

  /** Público: conta a leitura com ou sem login (o usuário vem preenchido se houver token). */
  @Public()
  @Post(':code/scans')
  @HttpCode(200)
  recordScan(
    @Param('code') code: string,
    @Body() dto: RecordScanDto,
    @CurrentUser() user: JwtPayload | null | undefined,
  ) {
    return this.promosService.recordScan(code, user?.sub ?? null, dto.deviceId ?? null);
  }

  @UseGuards(UserAccountGuard)
  @Post(':code/claim')
  @HttpCode(200)
  claim(@Param('code') code: string, @CurrentUser() user: JwtPayload) {
    return this.promosService.claim(code, user.sub);
  }

  @UseGuards(UserAccountGuard)
  @Post(':code/signup')
  @HttpCode(200)
  signup(@Param('code') code: string, @CurrentUser() user: JwtPayload) {
    return this.promosService.attributeSignup(code, user.sub);
  }
}
