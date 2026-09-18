import { Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ParseGuidPipe } from '../../shared/pipes/parse-guid.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { FollowsService } from './follows.service';

@ApiTags('follows')
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Get()
  mine(@CurrentUser() user: JwtPayload) {
    return this.followsService.myFollowingIds(user.sub);
  }

  @Post(':userId')
  @HttpCode(204)
  follow(@Param('userId', ParseGuidPipe) userId: string, @CurrentUser() user: JwtPayload) {
    return this.followsService.follow(user.sub, userId);
  }

  @Delete(':userId')
  @HttpCode(204)
  unfollow(@Param('userId', ParseGuidPipe) userId: string, @CurrentUser() user: JwtPayload) {
    return this.followsService.unfollow(user.sub, userId);
  }
}
