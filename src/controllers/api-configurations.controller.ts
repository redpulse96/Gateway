/* eslint-disable @typescript-eslint/no-explicit-any */
import { Filter, repository, xml2Json } from '../common';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { ApiConfigurationsRepository } from '../repositories';
const log = new LoggingInterceptor('api-configurations.Controller');

export class ApiConfigurationsController {
  constructor(
    @repository(ApiConfigurationsRepository)
    private apiConfigurationsRepository: ApiConfigurationsRepository,
  ) {}

  async fetchApiConfiguration(filter: Filter): Promise<any> {
    return this.apiConfigurationsRepository
      .findOne(filter)
      .then((res: any) => {
        log.info('---fetchApiConfiguration.findOne.res---');
        // log.info(res);
        switch (res?.ApiRequestType) {
          case 'object':
            res.ApiRequest = JSON.parse(eval(res.ApiRequest));
            return res;
          case 'string':
            res.ApiRequest = JSON.parse(xml2Json.toJson(eval(res.ApiRequest)));
            return res;
          default:
            return res;
        }
      })
      .catch((err: any) => {
        log.error('---fetchApiConfiguration.findOne.err---', err);
        throw err;
      });
  }

  async fetchApiDetails(filter: Filter): Promise<any> {
    return this.apiConfigurationsRepository.find(filter);
  }
}
