import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';

import { BaseEntity } from '../entities/base.entity';

@Injectable()
@EventSubscriber()
export class BaseEntitySubscriber implements EntitySubscriberInterface<BaseEntity> {
  constructor(
    dataSource: DataSource,
    private readonly cls: ClsService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo(): typeof BaseEntity {
    return BaseEntity;
  }

  beforeInsert(event: InsertEvent<BaseEntity>): void {
    const userId = this.cls.get('user')?.userId;
    if (userId && event.entity) {
      event.entity.createdBy = userId;
      event.entity.updatedBy = userId;
    }
  }

  beforeUpdate(event: UpdateEvent<BaseEntity>): void {
    const userId = this.cls.get('user')?.userId;
    if (userId && event.entity) {
      event.entity.updatedBy = userId;
    }
  }
}
