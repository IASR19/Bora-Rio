import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { Venue } from '../venues/entities/venue.entity';

/** Local da conta de comércio (1 conta = 1 CNPJ = 1 local), ou null se não houver. */
export function findOwnedVenue(manager: EntityManager, userId: string): Promise<Venue | null> {
  return manager.getRepository(Venue).findOne({ where: { ownerUserId: userId } });
}

export async function getOwnedVenue(manager: EntityManager, userId: string): Promise<Venue> {
  const venue = await findOwnedVenue(manager, userId);
  if (!venue) throw new NotFoundException('Nenhum estabelecimento vinculado a esta conta.');
  return venue;
}

/** Só o comércio dono do local do evento pode gerenciar o evento (promoções, QR de check-in). */
export function assertOwnsEventVenue(
  venue: Pick<Venue, 'ownerUserId'> | null | undefined,
  userId: string,
): void {
  if (!venue || venue.ownerUserId !== userId) {
    throw new ForbiddenException('Este evento não pertence ao seu estabelecimento.');
  }
}
