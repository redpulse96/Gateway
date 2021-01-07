import { Getter, inject } from '@loopback/core';
import { BelongsToAccessor, DefaultCrudRepository, repository } from '@loopback/repository';
import { UsersRepository } from '.';
import { IntegrationDataSource } from '../datasources';
import { AuditLogs, AuditLogsRelations, Users } from '../models';

export class AuditLogsRepository extends DefaultCrudRepository<
  AuditLogs,
  typeof AuditLogs.prototype.AuditLogID,
  AuditLogsRelations
  > {
  public readonly user: BelongsToAccessor<Users, typeof AuditLogs.prototype.AuditLogID>;

  constructor (
    @inject('datasources.Integration') dataSource: IntegrationDataSource,
    @repository.getter('UsersRepository') protected userRepositoryGetter: Getter<UsersRepository>,
  ) {
    super(AuditLogs, dataSource);

    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
