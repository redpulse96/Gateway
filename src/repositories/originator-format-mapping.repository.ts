import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {OriginatorFormatMapping, OriginatorFormatMappingRelations, PaymentVendor} from '../models';
import {IntegrationDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {PaymentVendorRepository} from './payment-vendor.repository';

export class OriginatorFormatMappingRepository extends DefaultCrudRepository<
  OriginatorFormatMapping,
  typeof OriginatorFormatMapping.prototype.OriginatorFormatMappingID,
  OriginatorFormatMappingRelations
> {

  public readonly payment_vendor: BelongsToAccessor<PaymentVendor, typeof OriginatorFormatMapping.prototype.OriginatorFormatMappingID>;

  constructor(
    @inject('datasources.Integration') dataSource: IntegrationDataSource, @repository.getter('PaymentVendorRepository') protected paymentVendorRepositoryGetter: Getter<PaymentVendorRepository>,
  ) {
    super(OriginatorFormatMapping, dataSource);
    this.payment_vendor = this.createBelongsToAccessorFor('payment_vendor', paymentVendorRepositoryGetter,);
    this.registerInclusionResolver('payment_vendor', this.payment_vendor.inclusionResolver);
  }
}
