import {
  CountSchema,
  del, Filter, FilterExcludingWhere,
  get, getModelSchemaRef, param, patch, post, put, repository,
  requestBody, Where
} from '../common';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { ApiConfigurations } from '../models';
import { ApiConfigurationsRepository } from '../repositories';
const log = new LoggingInterceptor('api-configurations.Controller');

interface DefaultResponse {
  success: boolean,
  statusCode: number,
  msg: string,
  data: object | null;
};

export class ApiConfigurationsCrudController {
  constructor (
    @repository(ApiConfigurationsRepository)
    public apiConfigurationsRepository: ApiConfigurationsRepository,
  ) { }

  @post('/apiConfigurations', {
    responses: {
      '200': {
        description: 'ApiConfigurations model instance',
        content: { 'application/json': { schema: getModelSchemaRef(ApiConfigurations) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ApiConfigurations, {
            title: 'NewApiConfigurations',
            exclude: ['ApiConfigurationID'],
          }),
        },
      },
    })
    apiConfigurations: Omit<ApiConfigurations, 'ApiConfigurationID'>,
  ): Promise<any> {
    await this.apiConfigurationsRepository.create(apiConfigurations)
      .then((res: any) => {
        log.info('---res---');
        log.info(res);
        return {
          success: true,
          statusCode: 200,
          msg: 'Successfully executed',
          data: res
        };
      })
      .catch((err: any) => {
        log.info('---err---');
        log.info(err);
        return {
          success: true,
          statusCode: err.statusCode || 200,
          msg: err.message || 'Internal server error',
          data: err.data || {}
        };
      });
  }

  @get('/apiConfigurations/count', {
    responses: {
      '200': {
        description: 'ApiConfigurations model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.where(ApiConfigurations) where?: Where<ApiConfigurations>,
  ): Promise<any> {
    await this.apiConfigurationsRepository.count(where)
      .then((res: any) => {
        log.info('---res---');
        log.info(res);
        return {
          success: true,
          statusCode: 200,
          msg: 'Successfully executed',
          data: res
        };
      })
      .catch((err: any) => {
        log.info('---err---');
        log.info(err);
        return {
          success: true,
          statusCode: err.statusCode || 200,
          msg: err.message || 'Internal server error',
          data: err.data || {}
        };
      });
  }

  @get('/apiConfigurations', {
    responses: {
      '200': {
        description: 'Array of ApiConfigurations model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ApiConfigurations, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(ApiConfigurations) filter?: Filter<ApiConfigurations>,
  ): Promise<any> {
    await this.apiConfigurationsRepository.find(filter)
      .then((res: any) => {
        log.info('---res---');
        log.info(res);
        return {
          success: true,
          statusCode: 200,
          msg: 'Successfully executed',
          data: res
        };
      })
      .catch((err: any) => {
        log.info('---err---');
        log.info(err);
        return {
          success: true,
          statusCode: err.statusCode || 200,
          msg: err.message || 'Internal server error',
          data: err.data || {}
        };
      });
  }

  @patch('/apiConfigurations', {
    responses: {
      '200': {
        description: 'ApiConfigurations PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ApiConfigurations, { partial: true }),
        },
      },
    })
    apiConfigurations: ApiConfigurations,
    @param.where(ApiConfigurations) where?: Where<ApiConfigurations>,
  ): Promise<any> {
    await this.apiConfigurationsRepository.updateAll(apiConfigurations, where)
      .then((res: any) => {
        log.info('---res---');
        log.info(res);
        return {
          success: true,
          statusCode: 200,
          msg: 'Successfully executed',
          data: res
        };
      })
      .catch((err: any) => {
        log.info('---err---');
        log.info(err);
        return {
          success: true,
          statusCode: err.statusCode || 200,
          msg: err.message || 'Internal server error',
          data: err.data || {}
        };
      });
  }

  @get('/apiConfigurations/{id}', {
    responses: {
      '200': {
        description: 'ApiConfigurations model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ApiConfigurations, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ApiConfigurations, { exclude: 'where' }) filter?: FilterExcludingWhere<ApiConfigurations>
  ): Promise<any> {
    await this.apiConfigurationsRepository.findById(id, filter)
      .then((res: any) => {
        log.info('---res---');
        log.info(res);
        return {
          success: true,
          statusCode: 200,
          msg: 'Successfully executed',
          data: res
        };
      })
      .catch((err: any) => {
        log.info('---err---');
        log.info(err);
        return {
          success: true,
          statusCode: err.statusCode || 200,
          msg: err.message || 'Internal server error',
          data: err.data || {}
        };
      });
  }

  @patch('/apiConfigurations/{id}', {
    responses: {
      '204': {
        description: 'ApiConfigurations PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ApiConfigurations, { partial: true }),
        },
      },
    })
    apiConfigurations: ApiConfigurations,
  ): Promise<any> {
    await this.apiConfigurationsRepository.updateById(id, apiConfigurations)
      .then((res: any) => {
        log.info('---res---');
        log.info(res);
        return {
          success: true,
          statusCode: 200,
          msg: 'Successfully executed',
          data: res
        };
      })
      .catch((err: any) => {
        log.info('---err---');
        log.info(err);
        return {
          success: true,
          statusCode: err.statusCode || 200,
          msg: err.message || 'Internal server error',
          data: err.data || {}
        };
      });
  }

  @put('/apiConfigurations/{id}', {
    responses: {
      '204': {
        description: 'ApiConfigurations PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() apiConfigurations: ApiConfigurations,
  ): Promise<any> {
    await this.apiConfigurationsRepository.replaceById(id, apiConfigurations)
      .then((res: any) => {
        log.info('---res---');
        log.info(res);
        return {
          success: true,
          statusCode: 200,
          msg: 'Successfully executed',
          data: res
        };
      })
      .catch((err: any) => {
        log.info('---err---');
        log.info(err);
        return {
          success: true,
          statusCode: err.statusCode || 200,
          msg: err.message || 'Internal server error',
          data: err.data || {}
        };
      });
  }

  @del('/apiConfigurations/{id}', {
    responses: {
      '204': {
        description: 'ApiConfigurations DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<any> {
    await this.apiConfigurationsRepository.deleteById(id)
      .then((res: any) => {
        log.info('---res---');
        log.info(res);
        return {
          success: true,
          statusCode: 200,
          msg: 'Successfully executed',
          data: res
        };
      })
      .catch((err: any) => {
        log.info('---err---');
        log.info(err);
        return {
          success: true,
          statusCode: err.statusCode || 200,
          msg: err.message || 'Internal server error',
          data: err.data || {}
        };
      });
  }
}
