import { NotFoundException } from '@nestjs/common';

import { CommonErrorCodes } from '../constants/error-codes';

export class ResourceNotFoundException extends NotFoundException {
  constructor(resource: string, identifier?: string) {
    const message = identifier ? `${resource} (${identifier}) not found` : `${resource} not found`;
    super({ message, errorCode: CommonErrorCodes.RESOURCE_NOT_FOUND });
  }
}
