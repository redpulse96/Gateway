import { DefaultCrudRepository, repository, HasManyRepositoryFactory, BelongsToAccessor } from '@loopback/repository';
import { Roles, RoleRelations, RoleAccessRightsMapping } from '../models';
import { IntegrationDataSource } from '../datasources';
import { inject, Getter } from '@loopback/core';
import { RoleAccessRightsMappingRepository } from '.';

export class RolesRepository extends DefaultCrudRepository<
  Roles,
  typeof Roles.prototype.RoleID,
  RoleRelations
  > {

  public readonly supervisor_role: BelongsToAccessor<Roles, typeof Roles.prototype.SupervisorRoleID>;

  public readonly role_access_rights: HasManyRepositoryFactory<RoleAccessRightsMapping, typeof Roles.prototype.RoleID>;

  constructor (
    @inject('datasources.Integration') dataSource: IntegrationDataSource,
    @repository.getter('RolesRepository') protected rolesRepositoryGetter: Getter<RolesRepository>,
    @repository.getter('RoleAccessRightsMappingRepository') protected roleAccessRightsMappingRepositoryGetter: Getter<RoleAccessRightsMappingRepository>,
  ) {
    super(Roles, dataSource);

    this.role_access_rights = this.createHasManyRepositoryFactoryFor('role_access_rights', roleAccessRightsMappingRepositoryGetter);
    this.registerInclusionResolver('role_access_rights', this.role_access_rights.inclusionResolver);

    this.supervisor_role = this.createBelongsToAccessorFor('supervisor_role', Getter.fromValue(this));
    this.registerInclusionResolver('supervisor_role', this.supervisor_role.inclusionResolver);
  }
}
