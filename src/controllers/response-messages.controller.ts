import { Filter, repository } from '../common';
import { STATUS } from '../constants';
import { ResponseMessagesRepository } from '../repositories';

export class ResponseMessagesController {
  constructor(
    @repository(ResponseMessagesRepository)
    private responseMessagesRepository: ResponseMessagesRepository,
  ) {}

  public async fetchResponseMessages(filter: Filter): Promise<any> {
    filter = {
      where: {
        ...filter.where,
        Status: STATUS.ACTIVE,
      },
      fields: {
        Success: true,
        MessageCode: true,
        Message: true,
        StatusCode: true,
        ResponseCode: true,
        ResponseData: true,
        Status: false,
        CreatedAt: false,
        UpdatedAt: false,
      },
      order: ['UpdatedAt DESC', 'CreatedAt DESC'],
    };
    return await this.responseMessagesRepository.find(filter);
  }
}
