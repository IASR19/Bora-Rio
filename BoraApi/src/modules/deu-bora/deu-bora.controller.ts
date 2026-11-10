import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ParseGuidPipe } from '../../shared/pipes/parse-guid.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { UserAccountGuard } from '../business/guards/user-account.guard';
import { DeuBoraService } from './deu-bora.service';
import { SubmitInterestDto } from './dto/submit-interest.dto';

/** Função do lado "usuário": contas de comércio ficam de fora. */
@ApiTags('deu-bora')
@UseGuards(UserAccountGuard)
@Controller('deu-bora')
export class DeuBoraController {
  constructor(private readonly deuBoraService: DeuBoraService) {}

  @Get('matches')
  myMatches(@CurrentUser() user: JwtPayload) {
    return this.deuBoraService.myMatches(user.sub);
  }

  @Get(':eventId/mine')
  myInterests(@Param('eventId', ParseGuidPipe) eventId: string, @CurrentUser() user: JwtPayload) {
    return this.deuBoraService.myInterests(user.sub, eventId);
  }

  @Post(':eventId/interest')
  submitInterest(
    @Param('eventId', ParseGuidPipe) eventId: string,
    @Body() dto: SubmitInterestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.deuBoraService.submitInterest(user.sub, eventId, dto.toUserId);
  }
}
