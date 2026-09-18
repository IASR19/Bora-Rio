import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { PreferencesService } from './preferences.service';

@ApiTags('preferences')
@Controller('preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get('me')
  getMine(@CurrentUser() user: JwtPayload) {
    return this.preferencesService.findByUserId(user.sub);
  }

  @Put('me')
  updateMine(@CurrentUser() user: JwtPayload, @Body() dto: UpdatePreferencesDto) {
    return this.preferencesService.update(user.sub, dto);
  }
}
