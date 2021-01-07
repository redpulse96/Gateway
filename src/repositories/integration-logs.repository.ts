import {DefaultCrudRepository} from '@loopback/repository';
import {IntegrationLogs, IntegrationLogsRelations} from '../models';
import {IntegrationDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class IntegrationLogsRepository extends DefaultCrudRepository<
  IntegrationLogs,
  typeof IntegrationLogs.prototype.IntegrationLogID,
  IntegrationLogsRelations
> {
  constructor(
    @inject('datasources.Integration') dataSource: IntegrationDataSource,
  ) {
    super(IntegrationLogs, dataSource);
  }
}
