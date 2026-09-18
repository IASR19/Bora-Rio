import { BadRequestException } from '@nestjs/common';

import { CommonErrorCodes } from '../constants/error-codes';

export interface FieldError {
  field: string;
  message: string;
}

export class ValidationException extends BadRequestException {
  constructor(fieldErrors: FieldError[], message = 'Validation failed') {
    super({ message, errorCode: CommonErrorCodes.VALIDATION_ERROR, fieldErrors });
  }
}
