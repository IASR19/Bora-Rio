import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { ClsUser } from '../types/cls-user.type';

@Injectable()
export class CurrentUserService {
  constructor(private readonly cls: ClsService) {}

  get(): ClsUser | undefined {
    return this.cls.get('user');
  }

  getUserId(): string | undefined {
    return this.get()?.userId;
  }
}
