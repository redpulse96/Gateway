import {DefaultCrudRepository} from '@loopback/repository';
import {NotificationServices, NotificationServicesRelations} from '../models';
import {IntegrationDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class NotificationServicesRepository extends DefaultCrudRepository<
  NotificationServices,
  typeof NotificationServices.prototype.NotificationServiceID,
  NotificationServicesRelations
> {
  constructor(
    @inject('datasources.Integration') dataSource: IntegrationDataSource,
  ) {
    super(NotificationServices, dataSource);
  }
}
