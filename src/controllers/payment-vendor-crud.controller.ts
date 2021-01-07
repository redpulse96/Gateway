/* eslint-disable @typescript-eslint/no-explicit-any */
import {
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
import { Utils } from '../common/utility';
import { InterfaceList, ResponseMappings, SecretKeys, STATUS } from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { PaymentVendor } from '../models';
import { PaymentPartnerRepository, PaymentVendorRepository } from '../repositories';

const log = new LoggingInterceptor('payment-vendor.Controller');

interface DefaultResponse {
  success: boolean;
  statusCode: number;
  msg: string;
  data: object | null;
}

export class PaymentVendorCrudController {
  constructor(
    @repository(PaymentVendorRepository)
    public paymentVendorRepository: PaymentVendorRepository,

    @repository(PaymentPartnerRepository)
    public paymentPartnerRepository: PaymentPartnerRepository,
  ) {}

  @post('/AzamPay/PaymentVendor', {
    responses: {
      '200': {
        description: 'PaymentVendor model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(PaymentVendor),
          },
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PaymentVendor, {
            title: 'NewPaymentVendor',
            exclude: ['PaymentVendorID'],
          }),
        },
      },
    })
    paymentVendor: Omit<PaymentVendor, 'PaymentVendorID'>,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const createInstance: any = {
      ...paymentVendor,
      PaymentVendorDescription: paymentVendor.PaymentVendorName.trim().toUpperCase(),
      SecretCode: SecretKeys.PaymentVendor,
      VendorTypeID: paymentVendor.VendorTypeID || undefined,
      VendorCode: Utils.hashBasedEncryption(
        paymentVendor.CodeScheme.toUpperCase(),
        paymentVendor.PaymentVendorName,
        SecretKeys.PaymentVendor,
        Utils.fetchCurrentTimestamp(),
      ),
      Status: STATUS.PENDING,
    };
    log.info('---createInstance---');
    log.info(createInstance);
    return await this.paymentVendorRepository
      .create(createInstance)
      .then((res: any) => {
        log.info('---paymentVendorRepository.create.res---');
        log.info(res);
        return {
          messageCode: ResponseMappings['SUCCESS'],
          data: res,
        };
      })
      .catch((err: any) => {
        log.info('---paymentVendorRepository.create.err---');
        log.info(err);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      });
  }

  @get('/PaymentVendor/count', {
    responses: {
      '200': {
        description: 'PaymentVendor model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(@param.where(PaymentVendor) where?: Where<PaymentVendor>): Promise<DefaultResponse> {
    return this.paymentVendorRepository
      .count(where)
      .then((res: any) => {
        log.info('---res---');
        log.info(res);
        return {
          success: true,
          statusCode: 200,
          msg: 'Successfully executed',
          data: res,
        };
      })
      .catch((err: any) => {
        log.info('---err---');
        log.info(err);
        return {
          success: true,
          statusCode: err.statusCode || 200,
          msg: err.message || 'Internal server error',
          data: err.data || {},
        };
      });
  }

  @get('/PaymentVendor', {
    responses: {
      '200': {
        description: 'Array of PaymentVendor model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(PaymentVendor, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(PaymentVendor) filter?: Filter<PaymentVendor>,
  ): Promise<DefaultResponse> {
    return this.paymentVendorRepository
      .find(filter)
      .then((res: any) => {
        log.info('---res---');
        log.info(res);
        return {
          success: true,
          statusCode: 200,
          msg: 'Successfully executed',
          data: res,
        };
      })
      .catch((err: any) => {
        log.info('---err---');
        log.info(err);
        return {
          success: true,
          statusCode: err.statusCode || 200,
          msg: err.message || 'Internal server error',
          data: err.data || {},
        };
      });
  }

  async findOne(
    @param.filter(PaymentVendor) filter?: Filter<PaymentVendor>,
  ): Promise<DefaultResponse> {
    return this.paymentVendorRepository
      .findOne(filter)
      .then((res: any) => {
        log.info('---res---');
        log.info(res);
        return {
          success: true,
          statusCode: 200,
          msg: 'Successfully executed',
          data: res,
        };
      })
      .catch((err: any) => {
        log.info('---err---');
        log.info(err);
        return {
          success: true,
          statusCode: err.statusCode || 200,
          msg: err.message || 'Internal server error',
          data: err.data || {},
        };
      });
  }

  @patch('/PaymentVendor', {
    responses: {
      '200': {
        description: 'PaymentVendor PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PaymentVendor, { partial: true }),
        },
      },
    })
    paymentVendor: PaymentVendor,
    @param.where(PaymentVendor) where?: Where<PaymentVendor>,
  ): Promise<DefaultResponse> {
    return this.paymentVendorRepository
      .updateAll(paymentVendor, where)
      .then((res: any) => {
        log.info('---res---');
        log.info(res);
        return {
          success: true,
          statusCode: 200,
          msg: 'Successfully executed',
          data: res,
        };
      })
      .catch((err: any) => {
        log.info('---err---');
        log.info(err);
        return {
          success: true,
          statusCode: err.statusCode || 200,
          msg: err.message || 'Internal server error',
          data: err.data || {},
        };
      });
  }

  @get('/PaymentVendor/{id}', {
    responses: {
      '200': {
        description: 'PaymentVendor model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(PaymentVendor, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(PaymentVendor, { exclude: 'where' }) filter?: FilterExcludingWhere<PaymentVendor>,
  ): Promise<DefaultResponse> {
    return this.paymentVendorRepository
      .findById(id, filter)
      .then((res: any) => {
        log.info('---res---');
        log.info(res);
        return {
          success: true,
          statusCode: 200,
          msg: 'Successfully executed',
          data: res,
        };
      })
      .catch((err: any) => {
        log.info('---err---');
        log.info(err);
        return {
          success: true,
          statusCode: err.statusCode || 200,
          msg: err.message || 'Internal server error',
          data: err.data || {},
        };
      });
  }

  @patch('/PaymentVendor/{id}', {
    responses: {
      '204': {
        description: 'PaymentVendor PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PaymentVendor, { partial: true }),
        },
      },
    })
    paymentVendor: PaymentVendor,
  ): Promise<DefaultResponse> {
    return this.paymentVendorRepository
      .updateById(id, paymentVendor)
      .then((res: any) => {
        log.info('---res---');
        log.info(res);
        return {
          success: true,
          statusCode: 200,
          msg: 'Successfully executed',
          data: res,
        };
      })
      .catch((err: any) => {
        log.info('---err---');
        log.info(err);
        return {
          success: true,
          statusCode: err.statusCode || 200,
          msg: err.message || 'Internal server error',
          data: err.data || {},
        };
      });
  }

  @put('/PaymentVendor/{id}', {
    responses: {
      '204': {
        description: 'PaymentVendor PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() paymentVendor: PaymentVendor,
  ): Promise<DefaultResponse> {
    return this.paymentVendorRepository
      .replaceById(id, paymentVendor)
      .then((res: any) => {
        log.info('---res---');
        log.info(res);
        return {
          success: true,
          statusCode: 200,
          msg: 'Successfully executed',
          data: res,
        };
      })
      .catch((err: any) => {
        log.info('---err---');
        log.info(err);
        return {
          success: true,
          statusCode: err.statusCode || 200,
          msg: err.message || 'Internal server error',
          data: err.data || {},
        };
      });
  }

  @del('/PaymentVendor/{id}', {
    responses: {
      '204': {
        description: 'PaymentVendor DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<DefaultResponse> {
    return this.paymentVendorRepository
      .deleteById(id)
      .then((res: any) => {
        log.info('---res---');
        log.info(res);
        return {
          success: true,
          statusCode: 200,
          msg: 'Successfully executed',
          data: res,
        };
      })
      .catch((err: any) => {
        log.info('---err---');
        log.info(err);
        return {
          success: true,
          statusCode: err.statusCode || 200,
          msg: err.message || 'Internal server error',
          data: err.data || {},
        };
      });
  }
}
