import { DefaultCrudRepository, repository, BelongsToAccessor } from '@loopback/repository';
import { UserRoles, UserRoleRelations, Users, Roles } from '../models';
import { IntegrationDataSource } from '../datasources';
import { inject, Getter } from '@loopback/core';
import { RolesRepository, UsersRepository } from '.';

export class UserRolesRepository extends DefaultCrudRepository<
  UserRoles,
  typeof UserRoles.prototype.UserRoleID,
  UserRoleRelations
  > {

  public readonly user: BelongsToAccessor<Users, typeof UserRoles.prototype.UserRoleID>;

  public readonly role: BelongsToAccessor<Roles, typeof UserRoles.prototype.UserRoleID>;

  constructor (
    @inject('datasources.Integration') dataSource: IntegrationDataSource,
    @repository.getter('UsersRepository') protected userRepositoryGetter: Getter<UsersRepository>,
    @repository.getter('RolesRepository') protected roleRepositoryGetter: Getter<RolesRepository>,
  ) {
    super(UserRoles, dataSource);

    this.role = this.createBelongsToAccessorFor('role', roleRepositoryGetter);
    this.registerInclusionResolver('role', this.role.inclusionResolver);

    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
