/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  authenticate,
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
import {
  InterfaceList,
  JWT_STRATEGY_NAME,
  ResponseMappings,
  SecretKeys,
  STATUS,
} from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { PaymentPartner } from '../models';
import { PaymentPartnerRepository } from '../repositories';
const log = new LoggingInterceptor('payment-partner.Controller');

interface DefaultResponse {
  success: boolean;
  statusCode: number;
  msg: string;
  data: object | null;
}

// @api(paymentVendorDef)
export class PaymentPartnerController {
  constructor(
    @repository(PaymentPartnerRepository)
    public paymentPartnerRepository: PaymentPartnerRepository,
  ) {}

  async findOne(
    @param.filter(PaymentPartner) filter?: Filter<PaymentPartner>,
  ): Promise<DefaultResponse> {
    return this.paymentPartnerRepository
      .findOne(filter)
      .then((res: any) => {
        log.info('---res---');
        log.info(res);
        return res;
      })
      .catch((err: any) => {
        log.info('---err---');
        log.info(err);
        return null;
      });
  }

  @post('/AzamPay/PaymentPartner', {
    responses: {
      '200': {
        description: 'PaymentPartner model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(PaymentPartner),
          },
        },
      },
    },
  })
  @authenticate(JWT_STRATEGY_NAME)
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PaymentPartner, {
            title: 'NewPaymentPartner',
            exclude: ['PaymentPartnerID'],
          }),
        },
      },
    })
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { body } = request;
    const createInstance: any = {
      ...body,
      PaymentPartnerDescription: body?.PaymentPartnerName.trim().toUpperCase(),
      SecretCode: SecretKeys.PaymentPartner,
      Status: STATUS.PENDING,
      PartnerCode: Utils.hashBasedEncryption(
        body?.CodeScheme.toUpperCase(),
        body.PaymentPartnerName,
        body?.CollectionAccountNumber,
        body?.CollectionAccountPassword,
        body?.Username,
        body?.Password,
        SecretKeys.PaymentPartner,
        Utils.fetchCurrentTimestamp(),
      ),
    };
    return await this.paymentPartnerRepository
      .create(createInstance)
      .then((res: any) => {
        log.info('---createInstance.res---');
        log.info(res);
        return {
          messageCode: ResponseMappings['SUCCESS'],
          data: res,
        };
      })
      .catch((err: any) => {
        log.info('---createInstance.err---');
        log.info(err);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      });
  }

  @get('/PaymentPartner/count', {
    responses: {
      '200': {
        description: 'PaymentPartner model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(@param.where(PaymentPartner) where?: Where<PaymentPartner>): Promise<Count> {
    return this.paymentPartnerRepository.count(where);
  }

  @get('/PaymentPartner', {
    responses: {
      '200': {
        description: 'Array of PaymentPartner model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(PaymentPartner, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(PaymentPartner) filter?: Filter<PaymentPartner>,
  ): Promise<DefaultResponse> {
    return this.paymentPartnerRepository
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

  @patch('/PaymentPartner', {
    responses: {
      '200': {
        description: 'PaymentPartner PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PaymentPartner, { partial: true }),
        },
      },
    })
    paymentPartner: PaymentPartner,
    @param.where(PaymentPartner) where?: Where<PaymentPartner>,
  ): Promise<DefaultResponse> {
    return this.paymentPartnerRepository
      .updateAll(paymentPartner, where)
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

  @get('/PaymentPartner/{id}', {
    responses: {
      '200': {
        description: 'PaymentPartner model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(PaymentPartner, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(PaymentPartner, { exclude: 'where' })
    filter?: FilterExcludingWhere<PaymentPartner>,
  ): Promise<DefaultResponse> {
    return this.paymentPartnerRepository
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

  @patch('/PaymentPartner/{id}', {
    responses: {
      '204': {
        description: 'PaymentPartner PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PaymentPartner, { partial: true }),
        },
      },
    })
    paymentPartner: PaymentPartner,
  ): Promise<DefaultResponse> {
    return this.paymentPartnerRepository
      .updateById(id, paymentPartner)
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

  @put('/PaymentPartner/{id}', {
    responses: {
      '204': {
        description: 'PaymentPartner PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() paymentPartner: PaymentPartner,
  ): Promise<DefaultResponse> {
    return this.paymentPartnerRepository
      .replaceById(id, paymentPartner)
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

  @del('/PaymentPartner/{id}', {
    responses: {
      '204': {
        description: 'PaymentPartner DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<DefaultResponse> {
    return this.paymentPartnerRepository
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
