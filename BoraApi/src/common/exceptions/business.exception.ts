import { BadRequestException } from '@nestjs/common';

import { CommonErrorCode, CommonErrorCodes } from '../constants/error-codes';

export class BusinessException extends BadRequestException {
  constructor(message: string, errorCode: CommonErrorCode = CommonErrorCodes.BUSINESS_RULE_VIOLATION) {
    super({ message, errorCode });
  }
}
