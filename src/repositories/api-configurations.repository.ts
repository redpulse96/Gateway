import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {IntegrationDataSource} from '../datasources';
import {ApiConfigurations, ApiConfigurationsRelations} from '../models';

export class ApiConfigurationsRepository extends DefaultCrudRepository<
  ApiConfigurations,
  typeof ApiConfigurations.prototype.ApiConfigurationID,
  ApiConfigurationsRelations
  > {
  constructor(
    @inject('datasources.Integration') dataSource: IntegrationDataSource,
  ) {
    super(ApiConfigurations, dataSource);
  }
}
