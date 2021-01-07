import {
  ApiConfigurationsController,
  ExternalServiceLogsController,
  ExternalServicesController,
  NotificationServicesController,
  PaymentPartnerController,
  PaymentVendorController,
  ResponseMessagesController,
} from '.';
import { get, inject, repository, ResponseObject, Utils } from '../common';
import { InterfaceList, STATUS } from '../constants';
import { RabbitMq } from '../queue';
import {
  BankMerchantsRepository,
  MnoMerchantsRepository,
  NotificationTransactionsRepository,
} from '../repositories';

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          greeting: { type: 'string' },
          date: { type: 'string' },
          url: { type: 'string' },
          headers: {
            type: 'object',
            properties: {
              'Content-Type': { type: 'string' },
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  public rabbitMq: any;
  constructor(
    @repository(BankMerchantsRepository)
    public bankMerchantsRepository: BankMerchantsRepository,

    @repository(NotificationTransactionsRepository)
    public notificationsRepository: NotificationTransactionsRepository,

    @repository(MnoMerchantsRepository)
    private mnoMerchantsRepository: MnoMerchantsRepository,

    @inject(`controllers.PaymentVendorController`)
    private paymentVendorController: PaymentVendorController,

    @inject(`controllers.PaymentPartnerController`)
    private paymentPartnerController: PaymentPartnerController,

    @inject(`controllers.ApiConfigurationsController`)
    public apiConfigurationsController: ApiConfigurationsController,

    @inject(`controllers.ResponseMessagesController`)
    public responseMessagesController: ResponseMessagesController,

    @inject(`controllers.ExternalServicesController`)
    public externalServicesController: ExternalServicesController,

    @inject(`controllers.ExternalServiceLogsController`)
    public externalServiceLogsController: ExternalServiceLogsController,

    @inject(`controllers.NotificationServicesController`)
    public notificationServicesController: NotificationServicesController,
  ) {
    this.rabbitMq = new RabbitMq(
      this.paymentVendorController,
      this.paymentPartnerController,
      this.bankMerchantsRepository,
      this.notificationsRepository,
      this.mnoMerchantsRepository,
    );
  }

  @get('/initiatequeue', {
    responses: {
      '200': PING_RESPONSE,
    },
  })
  async initiateQueue(): Promise<object> {
    await this.rabbitMq.receiveMessages();
    return {
      greeting: 'Hello from LoopBack',
      date: new Date(),
    };
  }

  // Map to `GET /ping`
  @get('/ping', {
    responses: {
      '200': PING_RESPONSE,
    },
  })
  async ping(): Promise<object> {
    const loadedConfigs: InterfaceList.LoadingConfigs = {
      apiConfigs: [],
      responseMessages: [],
      notificationServices: [],
      externalServices: [],
      externalServiceLogsController: this.externalServiceLogsController,
    };
    loadedConfigs.apiConfigs = await this.apiConfigurationsController.fetchApiDetails({
      where: {
        Status: STATUS.ACTIVE,
      },
    });
    loadedConfigs.responseMessages = await this.responseMessagesController.fetchResponseMessages({
      where: {
        Status: STATUS.ACTIVE,
      },
    });
    loadedConfigs.notificationServices = await this.notificationServicesController.find({
      where: {
        Status: STATUS.ACTIVE,
      },
    });
    loadedConfigs.externalServices = await this.externalServicesController.find({
      where: {
        Status: STATUS.ACTIVE,
      },
    });
    Utils.setLoadedOptions(loadedConfigs);
    return {
      greeting: 'Hello from LoopBack',
      date: new Date(),
    };
  }
}
