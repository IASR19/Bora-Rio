import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BusinessException } from '../../common/exceptions/business.exception';
import { isUniqueViolation } from '../../common/utils/database.utils';
import { ChatService } from '../chat/chat.service';
import { EventParticipation } from '../events/entities/event-participation.entity';
import { UsersService } from '../users/users.service';
import { DeuBoraInterest } from './entities/deu-bora-interest.entity';

export interface DeuBoraResult {
  matched: boolean;
  conversationId?: string;
}

@Injectable()
export class DeuBoraService {
  constructor(
    @InjectRepository(DeuBoraInterest) private readonly interestsRepository: Repository<DeuBoraInterest>,
    @InjectRepository(EventParticipation)
    private readonly participationRepository: Repository<EventParticipation>,
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  async submitInterest(userId: string, eventId: string, toUserId: string): Promise<DeuBoraResult> {
    if (userId === toUserId) {
      throw new BusinessException('Não dá pra demonstrar interesse em si mesmo');
    }

    const [myCheckin, theirCheckin] = await Promise.all([
      this.participationRepository.findOne({ where: { userId, eventId } }),
      this.participationRepository.findOne({ where: { userId: toUserId, eventId } }),
    ]);
    if (!myCheckin?.checkedIn || !theirCheckin?.checkedIn) {
      throw new BusinessException('Deu Bora só vale entre quem fez check-in no evento');
    }

    const existing = await this.interestsRepository.findOne({ where: { eventId, fromUserId: userId, toUserId } });
    if (!existing) {
      try {
        await this.interestsRepository.save(this.interestsRepository.create({ eventId, fromUserId: userId, toUserId }));
      } catch (err) {
        // Corrida (duplo clique, retry de rede): o índice único já garante que o
        // interesse existe — segue em frente em vez de estourar um 500.
        if (!isUniqueViolation(err)) throw err;
      }
    }

    const reverse = await this.interestsRepository.findOne({
      where: { eventId, fromUserId: toUserId, toUserId: userId },
    });
    if (!reverse) return { matched: false };

    const conversation = await this.chatService.getOrCreateDirectConversation(userId, toUserId);
    return { matched: true, conversationId: conversation.id };
  }

  async myInterests(userId: string, eventId: string): Promise<string[]> {
    const interests = await this.interestsRepository.find({ where: { eventId, fromUserId: userId } });
    return interests.map((i) => i.toUserId);
  }

  async myMatches(userId: string) {
    const conversations = await this.chatService.myDirectConversations(userId);
    return Promise.all(
      conversations.map(async (conversation) => {
        const otherUserId = conversation.userAId === userId ? conversation.userBId! : conversation.userAId!;
        const otherUser = await this.usersService.findById(otherUserId);
        return { conversationId: conversation.id, user: this.usersService.getPublicProfile(otherUser) };
      }),
    );
  }
}
