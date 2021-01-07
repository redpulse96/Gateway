import { DefaultCrudRepository, repository, HasOneRepositoryFactory } from '@loopback/repository';
import { AccessRights, AccessRightsRelations, Roles } from '../models';
import { IntegrationDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class AccessRightsRepository extends DefaultCrudRepository<
  AccessRights,
  typeof AccessRights.prototype.AccessRightID,
  AccessRightsRelations
  > {
  constructor (
    @inject('datasources.Integration') dataSource: IntegrationDataSource,
  ) {
    super(AccessRights, dataSource);
  }
}
