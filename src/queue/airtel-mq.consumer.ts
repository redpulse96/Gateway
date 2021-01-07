/* eslint-disable no-invalid-this */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GatewayInterface, inject, repository, Utils } from '../common';
import { infoBipConstant, SERVICE_TYPE, STATUS } from '../constants';
import { AirtelTransactionsConstants, ApiList, paymentGateways } from '../constants/';
import {
  airtelRabbitMq,
  NotificationTransactionsController,
  PaymentPartnerController,
  PaymentVendorController,
} from '../controllers';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { NotificationTransactionsRepository } from '../repositories';
const log = new LoggingInterceptor('airtel-transactions.Consumer');

export class AirtelMqConsumer {
  constructor(
    @inject(`controllers.PaymentVendorController`)
    private paymentVendorController: PaymentVendorController,

    @inject(`controllers.PaymentPartnerController`)
    private paymentPartnerController: PaymentPartnerController,

    @repository(NotificationTransactionsRepository)
    public notificationsRepository: NotificationTransactionsRepository,
  ) {}
  private notificationTransactionsController: NotificationTransactionsController = new NotificationTransactionsController(
    this.notificationsRepository,
  );
  private airtelTransactionParameters: GatewayInterface = new GatewayInterface(
    paymentGateways['AIRTEL'],
  );
  private airtelTransactionsConstants: any = AirtelTransactionsConstants;
  private infoBipConstant = new infoBipConstant();

  async processAirtelTransactionForPushApi(airtelTransactionRequestObj: any): Promise<any> {
    const { request, routeInfo } = airtelTransactionRequestObj;
    try {
      interface CheckUserForConnectedAppInterface {
        request: object;
        routeInfo: object;
      }
      const operationsObj = {
        operation: ApiList['AIRTEL_USSD_PUSH_API'],
        requestBody: { ...request.Command },
        Status: STATUS.COMPLETED,
        responseBody: {},
      };
      const createAirtelTransactionInstance: any = {
        apiName: 'updateTransaction',
        body: {
          UpdateFilter: {
            AirtelTransactionID: request.AirtelTransactionID,
          },
          UpdateAttributes: {
            ...request,
            Operations: request.Operations,
          },
        },
      };
      delete createAirtelTransactionInstance.body.UpdateAttributes['AirtelTransactionID'];
      delete createAirtelTransactionInstance.body.UpdateAttributes['Command'];
      log.info('---airtelTransactionRequestObj---');
      if (!routeInfo?.PaymentPartnerID) {
        log.info('---paymentPartnerError---');
        return {
          apiPath: ApiList['AIRTEL_ERROR_RESPONSE'],
          body: {
            TYPE: 'failure',
            TXNSTATUS: 500,
            MESSAGE: 'Internal server error',
          },
        };
      }
      log.info('---routeInfo---');
      let userFound = null;
      if (
        routeInfo &&
        this.airtelTransactionsConstants.AZAMTV_CONSTANT_SPID.indexOf(
          routeInfo.CollectionAccountNumber,
        ) > -1
      ) {
        request.senderMsisdn = request?.Content?.Command?.REFERENCEMSISDN;
        userFound = await this.paymentVendorController.checkUserForAzamTV(request);
      } else {
        const connectedAppsObj: CheckUserForConnectedAppInterface = {
          routeInfo: routeInfo.payment_vendor,
          request: {
            operator: 'Airtel',
            ReferenceID: request?.ReferenceID,
            utilityref: request?.Content?.Command?.REFERENCEMSISDN,
            Amount: request?.Content?.Command?.AMOUNT,
            TXNID: request?.Content?.Command?.TransID,
            MSISDN: request?.Content?.Command?.MSISDN,
          },
        };
        // userFound = await this.paymentVendorController.checkUserForConnectedApp(connectedAppsObj);
        userFound = {
          success: true,
          isFromMQ: false,
        };
      }
      log.info('---processAirtelTransactionForNormalApi.userFound---');
      if (!userFound || !userFound?.success) {
        log.info('Not Duplicate');
        createAirtelTransactionInstance.body.UpdateAttributes.Status = STATUS.COMPLETED;
      } else if (userFound?.isFromMQ && request?.Command?.TXNSTATUS == 200) {
        const mqPaymentObject = {
          routeInfo: routeInfo,
          request: {
            operator: paymentGateways.AIRTEL,
            smartCardNo: request?.Content?.Command?.REFERENCEMSISDN,
            SenderMsisdn: Utils.returnDisplayingMsisdn(request?.Content?.Command?.MSISDN),
            amount: request?.Content?.Command?.AMOUNT,
            reciptNo: request?.ReferenceID,
            referenceNo: request?.ExternalReferenceID,
          },
        };
        log.info('---mqPaymentObject---');
        await this.paymentVendorController
          .paymentMQServices(mqPaymentObject)
          .then((res: any) => {
            log.info('---paymentVendorController.paymentMQServices.res---');
            createAirtelTransactionInstance.body.Status = STATUS.COMPLETED;
            request.Operations.push({
              operation: 'paymentMQServices',
              Status: createAirtelTransactionInstance.body.Status,
              requestBody: res.requestBody,
              responseBody: res.responseBody,
            });
          })
          .catch((err: any) => {
            log.error('---paymentVendorController.paymentMQServices.err---', err);
            createAirtelTransactionInstance.body.UpdateAttributes.Status = STATUS.FAILURE;
            request.Operations.push({
              operation: 'paymentMQServices',
              Status: createAirtelTransactionInstance.body.UpdateAttributes.Status,
              requestBody: err.requestBody,
              responseBody: err.responseBody,
            });
          });
      } else if (!userFound?.isFromMQ) {
        const makePaymentObj = {
          routeDetails: routeInfo.payment_vendor,
          request: {
            TransactionStatus: request?.Command?.TXNSTATUS == 200 ? 'success' : 'failed',
            Message: request?.Command?.MESSAGE,
            Operator: 'Airtel',
            ReferenceID: request?.ReferenceID,
            ExternalReferenceID: request?.ExternalReferenceID,
            UtilityReference: request?.Content?.Command.MSISDN2,
            Amount: request?.Content?.Command.AMOUNT,
            TansactionID: request?.Content?.Command?.TransID,
            Msisdn: request?.Content?.Command?.MSISDN,
          },
        };
        log.info('---makePaymentObj---');
        await this.paymentVendorController
          .payUserForConnectedApp(makePaymentObj)
          .then((res: any) => {
            createAirtelTransactionInstance.body.UpdateAttributes.Status =
              request?.Command?.TXNSTATUS == 200 ? STATUS.COMPLETED : STATUS.FAILURE;
            request.Operations.push({
              operation: 'payForConnectedApp',
              Status: createAirtelTransactionInstance.body.UpdateAttributes.Status,
              requestBody: res.requestBody,
              responseBody: res.responseBody,
            });
          })
          .catch((err: any) => {
            createAirtelTransactionInstance.body.UpdateAttributes.Status = STATUS.FAILURE;
            request.Operations.push({
              operation: 'payForConnectedApp',
              Status: createAirtelTransactionInstance.body.UpdateAttributes.Status,
              requestBody: err.requestBody,
              responseBody: err.responseBody,
            });
          });
      } else {
        createAirtelTransactionInstance.body.UpdateAttributes.Status = STATUS.FAILURE;
        request.Operations.push({
          operation: 'paymentMQServices',
          Status: createAirtelTransactionInstance.body.UpdateAttributes.Status,
          requestBody: {},
          responseBody: {},
        });
      }
      request.Operations.push(operationsObj);

      const [airtelTransactionError, airtelTransactionResult]: any[] = await Utils.executePromise(
        this.airtelTransactionParameters.callGateway(createAirtelTransactionInstance),
      );
      if (
        airtelTransactionError ||
        !(airtelTransactionResult.success || airtelTransactionResult?.data?.airtelTransaction)
      ) {
        log.error('---airtelTransactionError---', airtelTransactionError);
        return {
          success: false,
          statusCode: 500,
          msg: 'Internal server error',
          data: {},
        };
      }
      log.info('---airtelTransactionResult---');
      return airtelTransactionResult;
    } catch (error) {
      log.error('---processAirtelTransactionForPushApi_CATCH_ERROR---', error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        data: error.data || {},
      };
    }
  }

  async processAirtelTransactionRabbitMessage(airtelTransactionRequest: string): Promise<any> {
    const airtelTransactionRequestObj = JSON.parse(airtelTransactionRequest);
    log.info('---processAirtelTransactionRabbitMessage.airtelTransactionRequestObj---');
    log.info(airtelTransactionRequestObj);
    switch (airtelTransactionRequestObj?.request?.IncomingRequestType?.toUpperCase()) {
      case SERVICE_TYPE.USSD_PUSH.toUpperCase():
        return this.processAirtelTransactionForPushApi(airtelTransactionRequestObj);
      // case 'NORMAL':
      //   return this.processAirtelTransactionForNormalApi(airtelTransactionRequestObj);
      default:
    }
  }

  async recieveRabbitMessages(routingKey: any, exchangeName: any): Promise<any> {
    try {
      return await airtelRabbitMq
        .recieveRabbitMessages(routingKey, exchangeName)
        .then((boundQueue: any) => {
          boundQueue.channelRes.consume(boundQueue.channelQRes.queue, async (msg: any) => {
            log.info('---recieveRabbitMessages---');
            if (exchangeName.toUpperCase() == 'GATEWAY') {
              if (msg?.fields?.routingKey == this.airtelTransactionsConstants['queueRoutingKey']) {
                await this.processAirtelTransactionRabbitMessage(msg.content.toString());
              }
            }
            await boundQueue.channelRes.ack(msg);
          });
        })
        .catch((err: any) => {
          log.error('---recieveRabbitMessages---', err);
          return {
            success: false,
            statusCode: 500,
            msg: 'Internal server error',
            data: err || {},
          };
        });
    } catch (error) {
      log.error('---recieveRabbitMessages_CATCH_ERROR---', error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        data: error.data || {},
      };
    }
  }
}
