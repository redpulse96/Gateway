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
import { MnoMerchants } from '../models';
import { MnoMerchantsRepository } from '../repositories';

export class MnoMerchantsController {
  constructor(
    @repository(MnoMerchantsRepository)
    private mnoMerchantsRepository: MnoMerchantsRepository,
  ) {}

  @post('/MnoMerchants', {
    responses: {
      '200': {
        description: 'MnoMerchants model instance',
        content: { 'application/json': { schema: getModelSchemaRef(MnoMerchants) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MnoMerchants, {
            title: 'NewMnoMerchants',
            exclude: ['MnoMerchantID'],
          }),
        },
      },
    })
    mnoMerchants: Omit<MnoMerchants, 'MnoMerchantID'>,
  ): Promise<MnoMerchants> {
    return this.mnoMerchantsRepository.create(mnoMerchants);
  }

  @get('/MnoMerchants/count', {
    responses: {
      '200': {
        description: 'MnoMerchants model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(@param.where(MnoMerchants) where?: Where<MnoMerchants>): Promise<Count> {
    return this.mnoMerchantsRepository.count(where);
  }

  @get('/MnoMerchants', {
    responses: {
      '200': {
        description: 'Array of MnoMerchants model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(MnoMerchants, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(@param.filter(MnoMerchants) filter?: Filter<MnoMerchants>): Promise<MnoMerchants[]> {
    return this.mnoMerchantsRepository.find(filter);
  }

  async findOne(filter?: Filter<MnoMerchants>): Promise<any> {
    return this.mnoMerchantsRepository.findOne(filter);
  }

  @patch('/MnoMerchants', {
    responses: {
      '200': {
        description: 'MnoMerchants PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MnoMerchants, { partial: true }),
        },
      },
    })
    mnoMerchants: MnoMerchants,
    @param.where(MnoMerchants) where?: Where<MnoMerchants>,
  ): Promise<Count> {
    return this.mnoMerchantsRepository.updateAll(mnoMerchants, where);
  }

  @get('/MnoMerchants/{id}', {
    responses: {
      '200': {
        description: 'MnoMerchants model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(MnoMerchants, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(MnoMerchants, { exclude: 'where' }) filter?: FilterExcludingWhere<MnoMerchants>,
  ): Promise<MnoMerchants> {
    return this.mnoMerchantsRepository.findById(id, filter);
  }

  @patch('/MnoMerchants/{id}', {
    responses: {
      '204': {
        description: 'MnoMerchants PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MnoMerchants, { partial: true }),
        },
      },
    })
    mnoMerchants: MnoMerchants,
  ): Promise<void> {
    await this.mnoMerchantsRepository.updateById(id, mnoMerchants);
  }

  @put('/MnoMerchants/{id}', {
    responses: {
      '204': {
        description: 'MnoMerchants PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() mnoMerchants: MnoMerchants,
  ): Promise<void> {
    await this.mnoMerchantsRepository.replaceById(id, mnoMerchants);
  }

  @del('/MnoMerchants/{id}', {
    responses: {
      '204': {
        description: 'MnoMerchants DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.mnoMerchantsRepository.deleteById(id);
  }
}
