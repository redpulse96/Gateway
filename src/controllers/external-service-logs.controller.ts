import {
  Count,
  CountSchema,
  del,
  Filter,
  FilterExcludingWhere,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  repository,
  requestBody,
  Where,
} from '../common';
import { ExternalServiceLogs } from '../models';
import { ExternalServiceLogsRepository } from '../repositories';

export class ExternalServiceLogsController {
  constructor(
    @repository(ExternalServiceLogsRepository)
    private ExternalServiceLogsRepository: ExternalServiceLogsRepository,
  ) {}

  @post('/ExternalServiceLogs', {
    responses: {
      '200': {
        description: 'ExternalServiceLogs model instance',
        content: { 'application/json': { schema: getModelSchemaRef(ExternalServiceLogs) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ExternalServiceLogs, {
            title: 'NewExternalServiceLogs',
            exclude: ['ExternalServiceLogID'],
          }),
        },
      },
    })
    ExternalServiceLogs: Omit<ExternalServiceLogs, 'ExternalServiceLogID'>,
  ): Promise<ExternalServiceLogs> {
    return this.ExternalServiceLogsRepository.create(ExternalServiceLogs);
  }

  @get('/ExternalServiceLogs/count', {
    responses: {
      '200': {
        description: 'ExternalServiceLogs model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.where(ExternalServiceLogs) where?: Where<ExternalServiceLogs>,
  ): Promise<Count> {
    return this.ExternalServiceLogsRepository.count(where);
  }

  @get('/ExternalServiceLogs', {
    responses: {
      '200': {
        description: 'Array of ExternalServiceLogs model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ExternalServiceLogs, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(ExternalServiceLogs) filter?: Filter<ExternalServiceLogs>,
  ): Promise<ExternalServiceLogs[]> {
    return this.ExternalServiceLogsRepository.find(filter);
  }

  @patch('/ExternalServiceLogs', {
    responses: {
      '200': {
        description: 'ExternalServiceLogs PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ExternalServiceLogs, { partial: true }),
        },
      },
    })
    ExternalServiceLogs: ExternalServiceLogs,
    @param.where(ExternalServiceLogs) where?: Where<ExternalServiceLogs>,
  ): Promise<Count> {
    return this.ExternalServiceLogsRepository.updateAll(ExternalServiceLogs, where);
  }

  @get('/ExternalServiceLogs/{id}', {
    responses: {
      '200': {
        description: 'ExternalServiceLogs model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ExternalServiceLogs, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ExternalServiceLogs, { exclude: 'where' })
    filter?: FilterExcludingWhere<ExternalServiceLogs>,
  ): Promise<ExternalServiceLogs> {
    return this.ExternalServiceLogsRepository.findById(id, filter);
  }

  @patch('/ExternalServiceLogs/{id}', {
    responses: {
      '204': {
        description: 'ExternalServiceLogs PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ExternalServiceLogs, { partial: true }),
        },
      },
    })
    ExternalServiceLogs: ExternalServiceLogs,
  ): Promise<void> {
    await this.ExternalServiceLogsRepository.updateById(id, ExternalServiceLogs);
  }

  @put('/ExternalServiceLogs/{id}', {
    responses: {
      '204': {
        description: 'ExternalServiceLogs PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() ExternalServiceLogs: ExternalServiceLogs,
  ): Promise<void> {
    await this.ExternalServiceLogsRepository.replaceById(id, ExternalServiceLogs);
  }

  @del('/ExternalServiceLogs/{id}', {
    responses: {
      '204': {
        description: 'ExternalServiceLogs DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.ExternalServiceLogsRepository.deleteById(id);
  }
}
