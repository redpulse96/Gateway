/* eslint-disable @typescript-eslint/no-explicit-any */
import { GatewayInterface, inject, repository, Utils } from '../common';
import { paymentGateways, SERVICE_TYPE, STATUS, ZantelTransactionConstant } from '../constants/';
import { PaymentPartnerController, PaymentVendorController, zantelRabbitMq } from '../controllers';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { NotificationTransactionsRepository } from '../repositories';
const log = new LoggingInterceptor('zantel-transactions.Consumer');

export class ZantelMqConsumer {
  constructor(
    @inject(`controllers.PaymentVendorController`)
    private paymentVendorController: PaymentVendorController,

    @inject(`controllers.PaymentPartnerController`)
    private paymentPartnerController: PaymentPartnerController,

    @repository(NotificationTransactionsRepository)
    public notificationsRepository: NotificationTransactionsRepository,
  ) {}

  private zantelTransactionParameters: GatewayInterface = new GatewayInterface(
    paymentGateways['ZANTEL'],
  );
  private zantelTransactionConstant: any = ZantelTransactionConstant;

  async processZantelTransactionFunction(data: any): Promise<any> {
    try {
      data = JSON.parse(data);
      log.info('---zantelTransactionRequestObj---');
      let callGatewayOptions: any;
      if (data['createTransactionInstance']) {
        delete data['createTransactionInstance']['ZantelTransactionID'];
        callGatewayOptions = {
          apiName: 'addTransaction',
          body: { ...data['createTransactionInstance'] },
        };
      } else if (data['updateTransactionInstance']) {
        callGatewayOptions = {
          apiName: 'updateTransaction',
          body: {
            UpdateFilter: {
              ZantelTransactionID: data['updateTransactionInstance'].ZantelTransactionID,
            },
            UpdateAttributes: data['updateTransactionInstance'],
          },
        };
      } else {
        return {
          success: true,
          statuconstde: 200,
          msg: 'No operations to be performed',
          data: {},
        };
      }
      const [callGatewayError, callGatewayDetails] = await Utils.executePromise(
        this.zantelTransactionParameters.callGateway(callGatewayOptions),
      );
      if (callGatewayError) {
        log.error('---callGatewayError---', callGatewayError);
        return {
          success: false,
          statusCode: callGatewayError.statusCode || 500,
          msg: callGatewayError.message || 'Internal server error',
          data: callGatewayError.data || {},
        };
      }
      log.info('---callGatewayDetails---');
      return {
        success: true,
        statusCode: 200,
        msg: 'Transaction successfully initiated',
        data: {
          transactionDetails: callGatewayDetails,
        },
      };
    } catch (error) {
      log.error('---processZantelTransactionFunction_CATCH_ERROR', error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Transaction successfully initiated',
        data: error.data || {},
      };
    }
  }

  async processZantelTransactionCallbackRequest(zantelRequestString: any): Promise<any> {
    try {
      const data: any = JSON.parse(zantelRequestString);
      const { zantelTransactionReq, paymentPartnerDetails, zantelTransactionDetails }: any = data;
      log.info('---processZantelTransactionCallbackRequest.data---');
      zantelTransactionReq.ReferenceID = Utils.generateReferenceID(
        zantelTransactionReq.REQUESTID,
        zantelTransactionReq.senderMsisdn,
      );
      zantelTransactionReq.paymentPartnerDetails = paymentPartnerDetails;
      zantelTransactionReq.IncomingRequestType = SERVICE_TYPE['USSD_PUSH'];
      // zantelTransactionReq.Operations
      const operationsObj = {
        operation: 'ussdZantelPushCallbackFunction',
        Status: STATUS.PENDING,
        requestBody: zantelTransactionReq,
      };
      let userFound = null;
      if (
        paymentPartnerDetails &&
        this.zantelTransactionConstant.AZAMTV_CONSTANT_SPID.indexOf(
          paymentPartnerDetails.CollectionAccountNumber,
        ) > -1
      ) {
        zantelTransactionReq.senderMsisdn =
          zantelTransactionDetails.data.zantelTransaction.CustomerReferenceID;
        log.info('---zantelTransactionReq.pay-for-azamtv---');
        userFound = await this.paymentVendorController.checkUserForAzamTV(zantelTransactionReq);
      } else {
        const connectedAppsObj: any = {
          routeInfo: paymentPartnerDetails.payment_vendor,
          request: {
            operator: 'Zantel',
            ReferenceID: zantelTransactionDetails.data.zantelTransaction.ReferenceID,
            utilityref: zantelTransactionDetails?.data.zantelTransaction.CustomerReferenceID,
            Amount: zantelTransactionReq?.Amount,
            TXNID:
              zantelTransactionReq?.REQUESTID ||
              zantelTransactionDetails?.data.zantelTransaction.ExternalReferenceID,
            MSISDN: zantelTransactionDetails?.data.zantelTransaction.SenderMsisdn,
          },
        };
        log.info('---zantelTransactionReq.not-pay-for-azamtv---');
        // userFound = await this.paymentVendorController.checkUserForConnectedApp(connectedAppsObj);
        userFound = {
          success: true,
          isFromMQ: false,
        };
      }
      log.info('---processZantelTransactionRequestFunction.userFound---');
      if (!userFound || (userFound && !userFound.success)) {
        log.info('Not Duplicate');
        return {
          success: false,
          statusCode: 500,
          msg: 'Transaction failed',
          data: {},
        };
      } else if (userFound?.isFromMQ) {
        const mqPaymentObject = {
          routeInfo: paymentPartnerDetails,
          request: {
            operator: paymentGateways.ZANTEL,
            smartCardNo: zantelTransactionDetails?.CustomerReferenceID,
            SenderMsisdn: zantelTransactionDetails?.data.zantelTransaction.SenderMsisdn,
            amount: zantelTransactionReq?.Amount,
            reciptNo: zantelTransactionDetails?.ExternalReferenceID,
            referenceNo: zantelTransactionReq.ReferenceID,
          },
        };
        log.info('---mqPaymentObject---');
        zantelTransactionReq.Operations.push(operationsObj);

        const rabbitMQProducerObj: any = {
          createTransactionInstance: zantelTransactionReq,
        };
        this.processZantelTransactionFunction(JSON.stringify(rabbitMQProducerObj));
        return await this.paymentVendorController.paymentMQServices(mqPaymentObject);
      } else {
        const makePaymentObj = {
          routeDetails: paymentPartnerDetails.payment_vendor,
          request: {
            TransactionStatus: 'success',
            Message: 'Payment successful',
            Operator: 'Zantel',
            ReferenceID: zantelTransactionReq?.ReferenceID,
            ExternalReferenceID: zantelTransactionDetails?.ExternalReferenceID,
            UtilityReference: zantelTransactionDetails?.data.zantelTransaction.CustomerReferenceID,
            Amount:
              zantelTransactionReq?.AMOUNT ||
              zantelTransactionDetails.data.zantelTransaction.Amount,
            TansactionID:
              zantelTransactionReq?.REQUESTID ||
              zantelTransactionDetails?.data.zantelTransaction.ExternalReferenceID,
            Msisdn: zantelTransactionDetails?.data.zantelTransaction.SenderMsisdn,
          },
        };
        log.info('---makePaymentObj---');

        const rabbitMQProducerObj: any = {
          createTransactionInstance: {
            ...zantelTransactionDetails.data.zantelTransaction,
            Status: STATUS.COMPLETED,
          },
        };
        this.processZantelTransactionFunction(JSON.stringify(rabbitMQProducerObj));
        return await this.paymentVendorController.payUserForConnectedApp(makePaymentObj);
      }
    } catch (error) {
      log.error('---processZantelTransactionFunction_CATCH_ERROR');
      log.error(error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Transaction failed',
        data: error.data || {},
      };
    }
  }

  async recieveRabbitMessages(routingKey: any, exchangeName: any): Promise<any> {
    try {
      return await zantelRabbitMq
        .recieveRabbitMessages(routingKey, exchangeName)
        .then((boundQueue: any) => {
          boundQueue.channelRes.consume(boundQueue.channelQRes.queue, async (msg: any) => {
            log.info('---recieveRabbitMessages---');
            if (exchangeName.toUpperCase() === 'GATEWAY') {
              if (msg?.fields?.routingKey === this.zantelTransactionConstant['queueRoutingKey']) {
                await this.processZantelTransactionFunction(msg.content.toString());
              } else if (
                msg?.fields?.routingKey ===
                this.zantelTransactionConstant['ussdPushCallbackQueueRoutingKey']
              ) {
                await this.processZantelTransactionCallbackRequest(msg.content.toString());
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
