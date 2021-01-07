import { DefaultCrudRepository, repository, HasOneRepositoryFactory, HasManyRepositoryFactory } from '@loopback/repository';
import { Users, UserRelations, PaymentVendor, UserRoles } from '../models';
import { IntegrationDataSource } from '../datasources';
import { inject, Getter } from '@loopback/core';
import { PaymentVendorRepository } from './payment-vendor.repository';
import { UserRolesRepository } from './user-roles.repository';

export class UsersRepository extends DefaultCrudRepository<
  Users,
  typeof Users.prototype.UserID,
  UserRelations
  > {

  public readonly payment_vendor: HasOneRepositoryFactory<PaymentVendor, typeof Users.prototype.UserID>;

  public readonly user_roles: HasManyRepositoryFactory<UserRoles, typeof Users.prototype.UserID>;

  constructor (
    @inject('datasources.Integration') dataSource: IntegrationDataSource, @repository.getter('PaymentVendorRepository')
    protected paymentVendorRepositoryGetter: Getter<PaymentVendorRepository>,
    @repository.getter('UserRolesRepository') protected userRolesRepositoryGetter: Getter<UserRolesRepository>,
  ) {
    super(Users, dataSource);
    this.user_roles = this.createHasManyRepositoryFactoryFor('user_roles', userRolesRepositoryGetter);
    this.registerInclusionResolver('user_roles', this.user_roles.inclusionResolver);
    this.payment_vendor = this.createHasOneRepositoryFactoryFor('payment_vendor', paymentVendorRepositoryGetter);
    this.registerInclusionResolver('payment_vendor', this.payment_vendor.inclusionResolver);
  }
}
