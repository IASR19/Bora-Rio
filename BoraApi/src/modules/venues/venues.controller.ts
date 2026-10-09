import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ParseGuidPipe } from '../../shared/pipes/parse-guid.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { PreferencesService } from '../preferences/preferences.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { QueryVenuesDto } from './dto/query-venues.dto';
import { VenuesService } from './venues.service';

@ApiTags('venues')
@Controller('venues')
export class VenuesController {
  constructor(
    private readonly venuesService: VenuesService,
    private readonly preferencesService: PreferencesService,
  ) {}

  @Public()
  @Get()
  async search(@Query() query: QueryVenuesDto, @CurrentUser() user: JwtPayload) {
    const preferences = user ? await this.preferencesService.findByUserId(user.sub) : null;
    return this.venuesService.search(query, preferences);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseGuidPipe) id: string) {
    return this.venuesService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateVenueDto) {
    return this.venuesService.createFromUser(dto);
  }
}
