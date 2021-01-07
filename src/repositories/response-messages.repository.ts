import { DefaultCrudRepository } from '@loopback/repository';
import { ResponseMessages, ResponseMessagesRelations } from '../models';
import { IntegrationDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class ResponseMessagesRepository extends DefaultCrudRepository<
  ResponseMessages,
  typeof ResponseMessages.prototype.ResponseMessageID,
  ResponseMessagesRelations
  > {
  constructor (
    @inject('datasources.Integration') dataSource: IntegrationDataSource,
  ) {
    super(ResponseMessages, dataSource);
  }
}
