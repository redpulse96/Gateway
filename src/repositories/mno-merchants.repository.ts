import {DefaultCrudRepository} from '@loopback/repository';
import {MnoMerchants, MnoMerchantsRelations} from '../models';
import {IntegrationDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class MnoMerchantsRepository extends DefaultCrudRepository<
  MnoMerchants,
  typeof MnoMerchants.prototype.MnoMerchantID,
  MnoMerchantsRelations
> {
  constructor(
    @inject('datasources.Integration') dataSource: IntegrationDataSource,
  ) {
    super(MnoMerchants, dataSource);
  }
}
