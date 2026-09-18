import { ForbiddenException } from '@nestjs/common';

import { CommonErrorCodes } from '../constants/error-codes';

export class UnauthorizedOperationException extends ForbiddenException {
  constructor(message = 'You are not allowed to perform this operation') {
    super({ message, errorCode: CommonErrorCodes.UNAUTHORIZED_OPERATION });
  }
}
