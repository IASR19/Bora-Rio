import { Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ParseGuidPipe } from '../../shared/pipes/parse-guid.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { BlocksService } from './blocks.service';

@ApiTags('blocks')
@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get()
  mine(@CurrentUser() user: JwtPayload) {
    return this.blocksService.myBlockedIds(user.sub);
  }

  @Post(':userId')
  @HttpCode(204)
  block(@Param('userId', ParseGuidPipe) userId: string, @CurrentUser() user: JwtPayload) {
    return this.blocksService.block(user.sub, userId);
  }

  @Delete(':userId')
  @HttpCode(204)
  unblock(@Param('userId', ParseGuidPipe) userId: string, @CurrentUser() user: JwtPayload) {
    return this.blocksService.unblock(user.sub, userId);
  }
}
