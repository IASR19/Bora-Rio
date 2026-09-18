import { CommonErrorCodes } from '../../common/constants/error-codes';
import { BusinessException } from '../../common/exceptions/business.exception';

export class InvalidCredentialsException extends BusinessException {
  constructor() {
    super('Invalid email or password', CommonErrorCodes.INVALID_CREDENTIALS);
  }
}

export class EmailAlreadyRegisteredException extends BusinessException {
  constructor() {
    super('Email already registered', CommonErrorCodes.DUPLICATED_RESOURCE);
  }
}

export class InvalidVerificationCodeException extends BusinessException {
  constructor() {
    super('Invalid or expired verification code');
  }
}

export class InvalidGoogleTokenException extends BusinessException {
  constructor() {
    super('Invalid Google token', CommonErrorCodes.INVALID_CREDENTIALS);
  }
}

export class GoogleLoginNotConfiguredException extends BusinessException {
  constructor() {
    super('Login com Google não está configurado no servidor');
  }
}

export class NoPasswordSetException extends BusinessException {
  constructor() {
    super('Esta conta entra apenas pelo Google e não tem senha para trocar');
  }
}
