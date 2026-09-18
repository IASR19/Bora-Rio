import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ParseGuidPipe } from '../../shared/pipes/parse-guid.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms/:eventId/messages')
  listRoomMessages(@Param('eventId', ParseGuidPipe) eventId: string, @CurrentUser() user: JwtPayload) {
    return this.chatService.listRoomMessages(user.sub, eventId);
  }

  @Post('rooms/:eventId/messages')
  postRoomMessage(
    @Param('eventId', ParseGuidPipe) eventId: string,
    @Body() dto: CreateMessageDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatService.postRoomMessage(user.sub, eventId, dto.body);
  }

  @Get('direct/:conversationId/messages')
  listDirectMessages(@Param('conversationId', ParseGuidPipe) conversationId: string, @CurrentUser() user: JwtPayload) {
    return this.chatService.listDirectMessages(user.sub, conversationId);
  }

  @Post('direct/:conversationId/messages')
  postDirectMessage(
    @Param('conversationId', ParseGuidPipe) conversationId: string,
    @Body() dto: CreateMessageDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatService.postDirectMessage(user.sub, conversationId, dto.body);
  }
}
