import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { BusinessService } from './business.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { BusinessAccountGuard } from './guards/business-account.guard';

@ApiTags('business')
@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  /** Aberto a qualquer conta de comércio (inclusive em análise/rejeitada): alimenta a tela de status. */
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.businessService.me(user.sub);
  }

  @UseGuards(BusinessAccountGuard)
  @Get('events')
  events(@CurrentUser() user: JwtPayload) {
    return this.businessService.events(user.sub);
  }

  @UseGuards(BusinessAccountGuard)
  @Get('dashboard')
  dashboard(@Query() query: DashboardQueryDto, @CurrentUser() user: JwtPayload) {
    return this.businessService.dashboard(user.sub, query.days);
  }
}
