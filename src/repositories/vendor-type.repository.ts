import {DefaultCrudRepository} from '@loopback/repository';
import {VendorType, VendorTypeRelations} from '../models';
import {IntegrationDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class VendorTypeRepository extends DefaultCrudRepository<
  VendorType,
  typeof VendorType.prototype.VendorTypeID,
  VendorTypeRelations
> {
  constructor(
    @inject('datasources.Integration') dataSource: IntegrationDataSource,
  ) {
    super(VendorType, dataSource);
  }
}
