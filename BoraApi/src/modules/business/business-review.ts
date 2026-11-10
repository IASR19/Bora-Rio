import { ConflictException, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { Event, EventStatus } from '../events/entities/event.entity';
import { BusinessVerificationStatus, User } from '../users/entities/user.entity';
import { Venue } from '../venues/entities/venue.entity';

export type BusinessReviewDecision = 'approved' | 'rejected';

/**
 * Decisão do admin sobre um cadastro de comércio em análise. Usada pelo painel
 * (AdminService.reviewBusiness) e pelo script `npm run business:review`, pra valerem as mesmas regras.
 * Roda dentro da transação de quem chama e trava a linha da conta (decisões simultâneas entram em fila).
 *
 * - Aprovar: verifica o local do comércio (passa a aparecer nas buscas) e publica os eventos
 *   comerciais dele que estavam em análise.
 * - Rejeitar: solta o CNPJ (na conta e no local), pra que o dono de verdade consiga se cadastrar
 *   caso alguém tenha usado o CNPJ dele. A conta rejeitada pode reenviar, digitando o CNPJ de novo
 *   (POST /users/me/business-verification). Razão social e local continuam.
 */
export async function applyBusinessReview(
  manager: EntityManager,
  userId: string,
  decision: BusinessReviewDecision,
  note: string,
): Promise<{ user: User; publishedEvents: number }> {
  const user = await manager.findOne(User, { where: { id: userId }, lock: { mode: 'pessimistic_write' } });
  if (!user) throw new NotFoundException();
  if (user.businessVerificationStatus !== BusinessVerificationStatus.PENDING)
    throw new ConflictException('Este cadastro já foi revisado.');

  const approved = decision === 'approved';
  user.businessVerificationStatus = approved
    ? BusinessVerificationStatus.APPROVED
    : BusinessVerificationStatus.REJECTED;
  user.businessVerificationNote = note;
  user.businessVerifiedAt = approved ? new Date() : null;

  if (!approved) {
    user.businessCnpj = null;
    await manager.save(user);
    await manager.update(Venue, { ownerUserId: userId }, { cnpj: null });
    return { user, publishedEvents: 0 };
  }

  await manager.save(user);
  await manager.update(
    Venue,
    { ownerUserId: userId },
    user.businessCnpj ? { verified: true, cnpj: user.businessCnpj } : { verified: true },
  );
  const published = await manager.update(
    Event,
    { createdBy: userId, createdAsBusiness: true, status: EventStatus.PENDING_REVIEW },
    { status: EventStatus.PUBLISHED },
  );
  return { user, publishedEvents: published.affected ?? 0 };
}
