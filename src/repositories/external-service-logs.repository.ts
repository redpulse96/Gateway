import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {IntegrationDataSource} from '../datasources';
import {ExternalServiceLogs, ExternalServiceLogsRelations} from '../models';

export class ExternalServiceLogsRepository extends DefaultCrudRepository<
  ExternalServiceLogs,
  typeof ExternalServiceLogs.prototype.ExternalServiceLogID,
  ExternalServiceLogsRelations
  > {
  constructor(
    @inject('datasources.Integration') dataSource: IntegrationDataSource,
  ) {
    super(ExternalServiceLogs, dataSource);
  }
}
