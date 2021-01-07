/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { IntegrationDataSource } from '../datasources';
import { NotificationTransactions, NotificationTransactionsRelations } from '../models';

export class NotificationTransactionsRepository extends DefaultCrudRepository<
  NotificationTransactions,
  typeof NotificationTransactions.prototype.ID,
  NotificationTransactionsRelations
  > {
  constructor (
    @inject('datasources.Integration') dataSource: IntegrationDataSource,
  ) {
    super(NotificationTransactions, dataSource);
  }
}
