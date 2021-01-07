import {DefaultCrudRepository} from '@loopback/repository';
import {BankMerchants, BankMerchantsRelations} from '../models';
import {IntegrationDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class BankMerchantsRepository extends DefaultCrudRepository<
  BankMerchants,
  typeof BankMerchants.prototype.BankMerchantID,
  BankMerchantsRelations
> {
  constructor(
    @inject('datasources.Integration') dataSource: IntegrationDataSource,
  ) {
    super(BankMerchants, dataSource);
  }
}
