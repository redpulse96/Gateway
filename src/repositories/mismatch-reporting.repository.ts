import {DefaultCrudRepository} from '@loopback/repository';
import {MismatchReporting, MismatchReportingRelations} from '../models';
import {IntegrationDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class MismatchReportingRepository extends DefaultCrudRepository<
  MismatchReporting,
  typeof MismatchReporting.prototype.MistmacthReportingID,
  MismatchReportingRelations
> {
  constructor(
    @inject('datasources.Integration') dataSource: IntegrationDataSource,
  ) {
    super(MismatchReporting, dataSource);
  }
}
