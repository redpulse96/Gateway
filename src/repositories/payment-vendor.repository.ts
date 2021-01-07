import { Getter, inject } from '@loopback/core';
import { BelongsToAccessor, DefaultCrudRepository, HasManyRepositoryFactory, repository } from '@loopback/repository';
import { IntegrationDataSource } from '../datasources';
import { OriginatorFormatMapping, PaymentPartner, PaymentVendor, PaymentVendorRelations, VendorType } from '../models';
import { OriginatorFormatMappingRepository } from './originator-format-mapping.repository';
import { PaymentPartnerRepository } from './payment-partner.repository';
import { VendorTypeRepository } from './vendor-type.repository';

export class PaymentVendorRepository extends DefaultCrudRepository<
  PaymentVendor,
  typeof PaymentVendor.prototype.PaymentVendorID,
  PaymentVendorRelations
  > {

  public readonly payment_partner: HasManyRepositoryFactory<PaymentPartner, typeof PaymentVendor.prototype.PaymentVendorID>;

  public readonly vendor_type: BelongsToAccessor<VendorType, typeof PaymentVendor.prototype.PaymentVendorID>;

  public readonly originator_formats: HasManyRepositoryFactory<OriginatorFormatMapping, typeof PaymentVendor.prototype.PaymentVendorID>;

  constructor (
    @inject('datasources.Integration') dataSource: IntegrationDataSource, @repository.getter('PaymentPartnerRepository') protected paymentPartnerRepositoryGetter: Getter<PaymentPartnerRepository>, @repository.getter('VendorTypeRepository') protected vendorTypeRepositoryGetter: Getter<VendorTypeRepository>, @repository.getter('OriginatorFormatMappingRepository') protected originatorFormatMappingRepositoryGetter: Getter<OriginatorFormatMappingRepository>,
  ) {
    super(PaymentVendor, dataSource);
    this.originator_formats = this.createHasManyRepositoryFactoryFor('originator_formats', originatorFormatMappingRepositoryGetter,);
    this.registerInclusionResolver('originator_formats', this.originator_formats.inclusionResolver);
    this.vendor_type = this.createBelongsToAccessorFor('vendor_type', vendorTypeRepositoryGetter);
    this.registerInclusionResolver('vendor_type', this.vendor_type.inclusionResolver);
    this.payment_partner = this.createHasManyRepositoryFactoryFor('payment_partner', paymentPartnerRepositoryGetter);
    this.registerInclusionResolver('payment_partner', this.payment_partner.inclusionResolver);
  }
}
