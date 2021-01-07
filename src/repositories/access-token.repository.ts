import {DefaultCrudRepository} from '@loopback/repository';
import {AccessToken, AccessTokenRelations} from '../models';
import {IntegrationDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class AccessTokenRepository extends DefaultCrudRepository<
  AccessToken,
  typeof AccessToken.prototype.AccessTokenID,
  AccessTokenRelations
> {
  constructor(
    @inject('datasources.Integration') dataSource: IntegrationDataSource,
  ) {
    super(AccessToken, dataSource);
  }
}
