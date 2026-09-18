import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ParseGuidPipe } from '../../shared/pipes/parse-guid.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { PreferencesService } from '../preferences/preferences.service';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { EventsService } from './events.service';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly preferencesService: PreferencesService,
  ) {}

  @Public()
  @Get()
  async search(@Query() query: QueryEventsDto, @CurrentUser() user: JwtPayload) {
    const preferences = user ? await this.preferencesService.findByUserId(user.sub) : null;
    return this.eventsService.search(query, preferences);
  }

  @Get('mine')
  mine(@CurrentUser() user: JwtPayload) {
    return this.eventsService.getMyEvents(user.sub);
  }

  @Get('created-by-me')
  createdByMe(@CurrentUser() user: JwtPayload) {
    return this.eventsService.getCreatedByMe(user.sub);
  }

  @Post()
  create(@Body() dto: CreateEventDto, @CurrentUser() user: JwtPayload) {
    return this.eventsService.create(user.sub, dto);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseGuidPipe) id: string) {
    return this.eventsService.findById(id);
  }

  @Public()
  @Get(':id/participants')
  participants(@Param('id', ParseGuidPipe) id: string) {
    return this.eventsService.getParticipants(id);
  }

  @Post(':id/view')
  view(@Param('id', ParseGuidPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.eventsService.markViewed(user.sub, id);
  }

  @Post(':id/interested')
  interested(@Param('id', ParseGuidPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.eventsService.markInterested(user.sub, id);
  }

  @Post(':id/confirmed')
  confirmed(@Param('id', ParseGuidPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.eventsService.markConfirmed(user.sub, id);
  }
}
