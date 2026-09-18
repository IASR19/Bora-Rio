import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BusinessException } from '../../common/exceptions/business.exception';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { isUniqueViolation } from '../../common/utils/database.utils';
import { BlocksService } from '../blocks/blocks.service';
import { Event } from '../events/entities/event.entity';
import { EventParticipation } from '../events/entities/event-participation.entity';
import { UsersService } from '../users/users.service';
import { Conversation, ConversationType } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

const ROOM_CLOSES_HOURS_AFTER_EVENT = 48;

export interface PublicMessage {
  id: string;
  body: string;
  createdAt: Date;
  sender: { id: string; name: string; avatarUrl: string | null };
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation) private readonly conversationsRepository: Repository<Conversation>,
    @InjectRepository(Message) private readonly messagesRepository: Repository<Message>,
    @InjectRepository(Event) private readonly eventsRepository: Repository<Event>,
    @InjectRepository(EventParticipation)
    private readonly participationRepository: Repository<EventParticipation>,
    private readonly blocksService: BlocksService,
    private readonly usersService: UsersService,
  ) {}

  private async toPublicSender(userId: string): Promise<PublicMessage['sender']> {
    const user = await this.usersService.findById(userId);
    return { id: user.id, name: user.name.split(' ')[0], avatarUrl: user.avatarUrl };
  }

  private async ensureRoomAccess(userId: string, eventId: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id: eventId } });
    if (!event) throw new ResourceNotFoundException('Event', eventId);

    if (event.createdBy === userId) return event;

    const participation = await this.participationRepository.findOne({ where: { userId, eventId } });
    const isParticipant = Boolean(participation?.interested || participation?.confirmed || participation?.checkedIn);
    if (!isParticipant) {
      throw new ForbiddenException('Só participantes do evento podem entrar na Bora Room');
    }
    return event;
  }

  private async getOrCreateEventRoom(eventId: string): Promise<Conversation> {
    const existing = await this.conversationsRepository.findOne({ where: { eventId } });
    if (existing) return existing;
    return this.conversationsRepository.save(
      this.conversationsRepository.create({ type: ConversationType.EVENT_ROOM, eventId }),
    );
  }

  async getOrCreateDirectConversation(userAId: string, userBId: string): Promise<Conversation> {
    const [lo, hi] = [userAId, userBId].sort();
    const existing = await this.conversationsRepository.findOne({
      where: { type: ConversationType.DIRECT, userAId: lo, userBId: hi },
    });
    if (existing) return existing;

    try {
      return await this.conversationsRepository.save(
        this.conversationsRepository.create({ type: ConversationType.DIRECT, userAId: lo, userBId: hi }),
      );
    } catch (err) {
      // Corrida: os dois lados de um match mútuo podem chamar isso quase ao mesmo
      // tempo — o índice único em (user_a_id, user_b_id) barra o segundo insert.
      if (!isUniqueViolation(err)) throw err;
      const raceWinner = await this.conversationsRepository.findOne({
        where: { type: ConversationType.DIRECT, userAId: lo, userBId: hi },
      });
      if (raceWinner) return raceWinner;
      throw err;
    }
  }

  private async ensureDirectAccess(userId: string, conversationId: string): Promise<Conversation> {
    const conversation = await this.conversationsRepository.findOne({ where: { id: conversationId } });
    if (!conversation || conversation.type !== ConversationType.DIRECT) {
      throw new ResourceNotFoundException('Conversation', conversationId);
    }
    if (conversation.userAId !== userId && conversation.userBId !== userId) {
      throw new ForbiddenException('Você não faz parte dessa conversa');
    }
    return conversation;
  }

  private async toPublicMessages(userId: string, conversationId: string): Promise<PublicMessage[]> {
    const [messages, blockedIds] = await Promise.all([
      this.messagesRepository.find({
        where: { conversationId },
        relations: ['sender'],
        order: { createdAt: 'ASC' },
      }),
      this.blocksService.myBlockedIds(userId),
    ]);

    const blocked = new Set(blockedIds);
    return messages
      .filter((m) => !blocked.has(m.senderId))
      .map((m) => ({
        id: m.id,
        body: m.body,
        createdAt: m.createdAt,
        sender: { id: m.sender.id, name: m.sender.name.split(' ')[0], avatarUrl: m.sender.avatarUrl },
      }));
  }

  async listRoomMessages(userId: string, eventId: string): Promise<PublicMessage[]> {
    await this.ensureRoomAccess(userId, eventId);
    const room = await this.getOrCreateEventRoom(eventId);
    return this.toPublicMessages(userId, room.id);
  }

  async postRoomMessage(userId: string, eventId: string, body: string): Promise<PublicMessage> {
    const event = await this.ensureRoomAccess(userId, eventId);

    const closesAt = new Date(
      (event.endsAt ?? event.startsAt).getTime() + ROOM_CLOSES_HOURS_AFTER_EVENT * 60 * 60 * 1000,
    );
    if (Date.now() > closesAt.getTime()) {
      throw new BusinessException('Essa Bora Room já encerrou');
    }

    const room = await this.getOrCreateEventRoom(eventId);
    const message = await this.messagesRepository.save(
      this.messagesRepository.create({ conversationId: room.id, senderId: userId, body }),
    );
    return { id: message.id, body: message.body, createdAt: message.createdAt, sender: await this.toPublicSender(userId) };
  }

  async listDirectMessages(userId: string, conversationId: string): Promise<PublicMessage[]> {
    await this.ensureDirectAccess(userId, conversationId);
    return this.toPublicMessages(userId, conversationId);
  }

  async postDirectMessage(userId: string, conversationId: string, body: string): Promise<PublicMessage> {
    await this.ensureDirectAccess(userId, conversationId);
    const message = await this.messagesRepository.save(
      this.messagesRepository.create({ conversationId, senderId: userId, body }),
    );
    return { id: message.id, body: message.body, createdAt: message.createdAt, sender: await this.toPublicSender(userId) };
  }

  /** Conversas diretas do usuário — usado pelo DeuBoraService pra listar matches. */
  myDirectConversations(userId: string): Promise<Conversation[]> {
    return this.conversationsRepository.find({
      where: [
        { type: ConversationType.DIRECT, userAId: userId },
        { type: ConversationType.DIRECT, userBId: userId },
      ],
    });
  }
}
