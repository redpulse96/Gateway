import { DefaultCrudRepository, BelongsToAccessor, repository } from '@loopback/repository';
import { RoleAccessRightsMapping, RoleAccessRightsMappingRelations, AccessRights, Roles } from '../models';
import { IntegrationDataSource } from '../datasources';
import { inject, Getter } from '@loopback/core';
import { AccessRightsRepository, RolesRepository } from '.';

export class RoleAccessRightsMappingRepository extends DefaultCrudRepository<
  RoleAccessRightsMapping,
  typeof RoleAccessRightsMapping.prototype.RoleAccessRightsMappingID,
  RoleAccessRightsMappingRelations
  > {

  public readonly role: BelongsToAccessor<Roles, typeof RoleAccessRightsMapping.prototype.RoleID>;

  public readonly access_rights: BelongsToAccessor<AccessRights, typeof RoleAccessRightsMapping.prototype.AccessRightID>;

  constructor (
    @inject('datasources.Integration') dataSource: IntegrationDataSource,
    @repository.getter('RolesRepository') protected roleRepositoryGetter: Getter<RolesRepository>,
    @repository.getter('AccessRightsRepository') protected accessRightsRepositoryGetter: Getter<AccessRightsRepository>,
  ) {
    super(RoleAccessRightsMapping, dataSource);

    this.role = this.createBelongsToAccessorFor('role', roleRepositoryGetter);
    this.registerInclusionResolver('role', this.role.inclusionResolver);

    this.access_rights = this.createBelongsToAccessorFor('access_rights', accessRightsRepositoryGetter);
    this.registerInclusionResolver('access_rights', this.access_rights.inclusionResolver);
  }
}
