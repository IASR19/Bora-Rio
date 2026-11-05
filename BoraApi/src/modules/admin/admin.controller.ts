import { Body, Controller, Get, Header, Param, ParseUUIDPipe, Patch, Query, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { AdminQuery, AdminReviewDto, AdminUpdateUserDto } from './admin.dto';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}
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
    return this.admin.updateUser(actor.sub, id, dto);
  }
  @Patch('events/:id/review') reviewEvent(
    @CurrentUser() actor: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminReviewDto,
  ) {
    return this.admin.reviewEvent(actor.sub, id, dto);
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
    return this.admin.reviewBusiness(actor.sub, id, dto);
  }
}
