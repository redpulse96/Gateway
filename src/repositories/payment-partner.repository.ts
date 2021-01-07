import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, repository} from '@loopback/repository';
import {IntegrationDataSource} from '../datasources';
import {PaymentPartner, PaymentPartnerRelations, PaymentVendor} from '../models';
import {PaymentVendorRepository} from './payment-vendor.repository';

export class PaymentPartnerRepository extends DefaultCrudRepository<
  PaymentPartner,
  typeof PaymentPartner.prototype.PaymentPartnerID,
  PaymentPartnerRelations
  > {

  public readonly payment_vendor: BelongsToAccessor<PaymentVendor, typeof PaymentPartner.prototype.PaymentPartnerID>;

  constructor(
    @inject('datasources.Integration') dataSource: IntegrationDataSource, @repository.getter('PaymentVendorRepository') protected paymentVendorRepositoryGetter: Getter<PaymentVendorRepository>,
  ) {
    super(PaymentPartner, dataSource);
    this.payment_vendor = this.createBelongsToAccessorFor('payment_vendor', paymentVendorRepositoryGetter);
    this.registerInclusionResolver('payment_vendor', this.payment_vendor.inclusionResolver);
  }
}
