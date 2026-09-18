import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ParseGuidPipe } from '../../shared/pipes/parse-guid.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { QueryEventsDto } from './dto/query-events.dto';
import { EventsService } from './events.service';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Public()
  @Get()
  search(@Query() query: QueryEventsDto) {
    return this.eventsService.search(query);
  }

  @Get('mine')
  mine(@CurrentUser() user: JwtPayload) {
    return this.eventsService.getMyEvents(user.sub);
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
