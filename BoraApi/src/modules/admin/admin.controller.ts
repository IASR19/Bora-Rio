import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { setImpersonationCookies } from '../auth/auth.cookies';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { realActorId } from '../auth/impersonation';
import { AuthService } from '../auth/services/auth.service';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { UsersService } from '../users/users.service';
import { AdminQuery, AdminReviewDto, AdminUpdateUserDto } from './admin.dto';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly auth: AuthService,
    private readonly usersService: UsersService,
  ) {}
  @Get('options') options() {
    return this.admin.options();
  }
  @Get('dashboard') dashboard(@Query() q: AdminQuery) {
    return this.admin.dashboard(q);
  }
  @Get('events') events(@Query() q: AdminQuery) {
    return this.admin.events(q);
  }
  @Get('users') users(@Query() q: AdminQuery) {
    return this.admin.users(q);
  }
  @Get('audit') audit(@Query() q: AdminQuery) {
    return this.admin.audit(q);
  }
  @Patch('users/:id') update(
    @CurrentUser() actor: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.admin.updateUser(realActorId(actor), id, dto);
  }
  /**
   * Acesso de suporte: passa a sessão deste navegador para a conta `id`. A sessão do admin fica
   * guardada num cookie à parte até o `POST /auth/impersonation/stop`.
   */
  @Post('users/:id/impersonate') @HttpCode(200) async impersonate(
    @CurrentUser() actor: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (actor.impersonatorId) {
      throw new ForbiddenException('Volte para a sua conta antes de acessar outra.');
    }
    const { actor: admin, target } = await this.admin.impersonate(actor.sub, id);
    const tokens = this.auth.issueImpersonationTokens(target, admin.id);
    setImpersonationCookies(res, this.auth.issueTokens(admin).refreshToken, tokens.refreshToken);
    const user = await this.usersService.withImpersonation(await this.usersService.withBusinessVenue(target), admin.id);
    return { user, accessToken: tokens.accessToken };
  }
  @Patch('events/:id/review') reviewEvent(
    @CurrentUser() actor: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminReviewDto,
  ) {
    return this.admin.reviewEvent(realActorId(actor), id, dto);
  }
  @Get('users/:id/business-document') @Header('Cache-Control', 'no-store') document(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.admin.businessDocument(id);
  }
  @Patch('users/:id/business-review') reviewBusiness(
    @CurrentUser() actor: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminReviewDto,
  ) {
    return this.admin.reviewBusiness(realActorId(actor), id, dto);
  }
}
