import { Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ParseGuidPipe } from '../../shared/pipes/parse-guid.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  mine(@CurrentUser() user: JwtPayload) {
    return this.favoritesService.myVenueIds(user.sub);
  }

  @Post(':venueId')
  @HttpCode(204)
  add(@Param('venueId', ParseGuidPipe) venueId: string, @CurrentUser() user: JwtPayload) {
    return this.favoritesService.add(user.sub, venueId);
  }

  @Delete(':venueId')
  @HttpCode(204)
  remove(@Param('venueId', ParseGuidPipe) venueId: string, @CurrentUser() user: JwtPayload) {
    return this.favoritesService.remove(user.sub, venueId);
  }
}
