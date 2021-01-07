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
import { ExternalServices } from '../models';
import { ExternalServicesRepository } from '../repositories';

export class ExternalServicesController {
  constructor(
    @repository(ExternalServicesRepository)
    public externalServicesRepository: ExternalServicesRepository,
  ) {}

  @post('/azam/externalservices', {
    responses: {
      '200': {
        description: 'ExternalServices model instance',
        content: { 'application/json': { schema: getModelSchemaRef(ExternalServices) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ExternalServices, {
            title: 'NewExternalServices',
            exclude: ['ExternalServiceID'],
          }),
        },
      },
    })
    externalServices: Omit<ExternalServices, 'ExternalServiceID'>,
  ): Promise<ExternalServices> {
    return this.externalServicesRepository.create(externalServices);
  }

  @get('/azam/externalservices/count', {
    responses: {
      '200': {
        description: 'ExternalServices model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(@param.where(ExternalServices) where?: Where<ExternalServices>): Promise<Count> {
    return this.externalServicesRepository.count(where);
  }

  @get('/azam/externalservices', {
    responses: {
      '200': {
        description: 'Array of ExternalServices model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ExternalServices, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(ExternalServices) filter?: Filter<ExternalServices>,
  ): Promise<ExternalServices[]> {
    return this.externalServicesRepository.find(filter);
  }

  @patch('/azam/externalservices', {
    responses: {
      '200': {
        description: 'ExternalServices PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ExternalServices, { partial: true }),
        },
      },
    })
    externalServices: ExternalServices,
    @param.where(ExternalServices) where?: Where<ExternalServices>,
  ): Promise<Count> {
    return this.externalServicesRepository.updateAll(externalServices, where);
  }

  @get('/azam/externalservices/{id}', {
    responses: {
      '200': {
        description: 'ExternalServices model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ExternalServices, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ExternalServices, { exclude: 'where' })
    filter?: FilterExcludingWhere<ExternalServices>,
  ): Promise<ExternalServices> {
    return this.externalServicesRepository.findById(id, filter);
  }

  @patch('/azam/externalservices/{id}', {
    responses: {
      '204': {
        description: 'ExternalServices PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ExternalServices, { partial: true }),
        },
      },
    })
    externalServices: ExternalServices,
  ): Promise<void> {
    await this.externalServicesRepository.updateById(id, externalServices);
  }

  @put('/azam/externalservices/{id}', {
    responses: {
      '204': {
        description: 'ExternalServices PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() externalServices: ExternalServices,
  ): Promise<void> {
    await this.externalServicesRepository.replaceById(id, externalServices);
  }

  @del('/azam/externalservices/{id}', {
    responses: {
      '204': {
        description: 'ExternalServices DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.externalServicesRepository.deleteById(id);
  }
}
