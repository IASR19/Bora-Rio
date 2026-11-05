import { CommonErrorCodes } from '../../common/constants/error-codes';
import { BusinessException } from '../../common/exceptions/business.exception';
import { Event, EventStatus } from './entities/event.entity';

export function assertEventAcceptsParticipation(event: Pick<Event, 'status'>): void {
  if (event.status === EventStatus.REJECTED) {
    throw new BusinessException(
      'Este evento foi rejeitado e não aceita participação.',
      CommonErrorCodes.EVENT_REJECTED,
    );
  }
}
