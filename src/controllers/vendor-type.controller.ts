import {
  Count,
  CountSchema,
  del,
  Filter,
  FilterExcludingWhere,
  get,
  getModelSchemaRef,
  inject,
  param,
  patch,
  post,
  put,
  repository,
  Request,
  requestBody,
  RestBindings,
  Utils,
  Where,
} from '../common';
import { InterfaceList, ResponseMappings, STATUS } from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { VendorType } from '../models';
import { VendorTypeRepository } from '../repositories';

const log = new LoggingInterceptor('user.Controllers');

export class VendorTypeController {
  constructor(
    @repository(VendorTypeRepository)
    public vendorTypeRepository: VendorTypeRepository,
  ) {}

  @post('/azam/vendortype', {
    responses: {
      '200': {
        description: 'VendorType model instance',
        content: { 'application/json': { schema: getModelSchemaRef(VendorType) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(VendorType, {
            title: 'NewVendorType',
            exclude: ['VendorTypeID'],
          }),
        },
      },
    })
    vendorType: Omit<VendorType, 'VendorTypeID'>,
  ): Promise<VendorType> {
    return this.vendorTypeRepository.create(vendorType);
  }

  @get('/azam/vendortype/count', {
    responses: {
      '200': {
        description: 'VendorType model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(@param.where(VendorType) where?: Where<VendorType>): Promise<Count> {
    return this.vendorTypeRepository.count(where);
  }

  @get('/azam/vendortype', {
    responses: {
      '200': {
        description: 'Array of VendorType model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(VendorType, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(@param.filter(VendorType) filter?: Filter<VendorType>): Promise<VendorType[]> {
    return this.vendorTypeRepository.find(filter);
  }

  @get('/azam/vendortype/fetch', {
    responses: {
      '200': {
        description: 'Array of VendorType model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(VendorType, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async fetchVendorTypes(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    try {
      const { query }: any = request;
      log.info('---fetchVendorTypes.query---');
      log.info(query);

      const filter: Filter = { where: { Status: STATUS.ACTIVE } };
      const [vendorTypeErr, vendorTypes]: any[] = await Utils.executePromise(
        this.vendorTypeRepository.find(filter),
      );
      if (vendorTypeErr || !vendorTypes?.length) {
        log.info('---vendorTypeErr---');
        log.info(vendorTypeErr);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      }

      const resp: any[] = [];
      vendorTypes.forEach((val: any) => {
        resp.push({
          VendorTypeID: val.VendorTypeID,
          VendorTypeCode: val.VendorTypeCode,
          VendorType: val.VendorType,
          VendorName: val.VendorName,
          VendorDescription: val.VendorDescription,
        });
      });
      log.info('---vendorTypes---');
      log.info(resp);

      return {
        messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
        data: { vendorTypes: resp },
      };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  @patch('/azam/vendortype', {
    responses: {
      '200': {
        description: 'VendorType PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(VendorType, { partial: true }),
        },
      },
    })
    vendorType: VendorType,
    @param.where(VendorType) where?: Where<VendorType>,
  ): Promise<Count> {
    return this.vendorTypeRepository.updateAll(vendorType, where);
  }

  @get('/azam/vendortype/{id}', {
    responses: {
      '200': {
        description: 'VendorType model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(VendorType, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(VendorType, { exclude: 'where' }) filter?: FilterExcludingWhere<VendorType>,
  ): Promise<VendorType> {
    return this.vendorTypeRepository.findById(id, filter);
  }

  @patch('/azam/vendortype/{id}', {
    responses: {
      '204': {
        description: 'VendorType PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(VendorType, { partial: true }),
        },
      },
    })
    vendorType: VendorType,
  ): Promise<void> {
    await this.vendorTypeRepository.updateById(id, vendorType);
  }

  @put('/azam/vendortype/{id}', {
    responses: {
      '204': {
        description: 'VendorType PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() vendorType: VendorType,
  ): Promise<void> {
    await this.vendorTypeRepository.replaceById(id, vendorType);
  }

  @del('/azam/vendortype/{id}', {
    responses: {
      '204': {
        description: 'VendorType DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.vendorTypeRepository.deleteById(id);
  }
}
