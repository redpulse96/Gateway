import { DefaultCrudRepository } from '@loopback/repository';
import { ExternalServices, ExternalServicesRelations } from '../models';
import { IntegrationDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class ExternalServicesRepository extends DefaultCrudRepository<
  ExternalServices,
  typeof ExternalServices.prototype.ExternalServiceID,
  ExternalServicesRelations
  > {
  constructor (
    @inject('datasources.Integration') dataSource: IntegrationDataSource,
  ) {
    super(ExternalServices, dataSource);
  }
}
