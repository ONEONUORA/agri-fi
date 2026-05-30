import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TradeDeal } from '../../trade-deals/entities/trade-deal.entity';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<TradeDeal> {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return TradeDeal;
  }

  async afterInsert(event: InsertEvent<TradeDeal>): Promise<void> {
    await event.manager.save(AuditLog, {
      entityName: 'TradeDeal',
      entityId: event.entity?.id ?? null,
      action: 'INSERT',
      changes: JSON.stringify(event.entity),
    });
  }

  async afterUpdate(event: UpdateEvent<TradeDeal>): Promise<void> {
    await event.manager.save(AuditLog, {
      entityName: 'TradeDeal',
      entityId: event.entity?.id ?? null,
      action: 'UPDATE',
      changes: JSON.stringify(
        event.updatedColumns?.map((col) => col.propertyName) ?? [],
      ),
    });
  }
}
