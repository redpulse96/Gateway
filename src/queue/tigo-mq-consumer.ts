/* eslint-disable @typescript-eslint/no-explicit-any */
import { GatewayInterface, inject, repository, Utils } from '../common';
import {
  ApiList,
  AZAMTV_CONSTANT_SPID,
  paymentGateways,
  STATUS,
  TigoTransactionsConstants,
} from '../constants';
import {
  MnoMerchantsController,
  PaymentPartnerController,
  PaymentVendorController,
  tigoRabbitMq,
} from '../controllers';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { MnoMerchantsRepository } from '../repositories';
const log = new LoggingInterceptor('tigo-transactions.Consumer');

export class TigoMqConsumer {
  constructor(
    @inject(`controllers.PaymentVendorController`)
    private paymentVendorController: PaymentVendorController,

    @inject(`controllers.PaymentPartnerController`)
    private paymentPartnerController: PaymentPartnerController,

    @repository(MnoMerchantsRepository)
    private mnoMerchantsRepository: MnoMerchantsRepository,
  ) {}
  private tigoGatewayParams: GatewayInterface = new GatewayInterface(paymentGateways['TIGO']);
  private tigoTransactionsConstants: any = TigoTransactionsConstants;
  private mnoMerchantsController: MnoMerchantsController = new MnoMerchantsController(
    this.mnoMerchantsRepository,
  );

  async processTransactionFunction(data: any) {
    try {
      let createMnoMerchantInstance: any,
        callGatewayOptions: any,
        createMerchaneErr: any,
        createMerchantDetails: any,
        tigoTransactionErr: any,
        tigoTransactionDetails: any;
      if (data['MnoMerchant'] && data['CreateTransactions']) {
        createMnoMerchantInstance = { ...data['MnoMerchant'] };
        [createMerchaneErr, createMerchantDetails] = await Utils.executePromise(
          this.mnoMerchantsController.create(createMnoMerchantInstance),
        );
        if (createMerchaneErr) {
          log.info('---createMerchaneErr---');
          log.info(createMerchaneErr);
          return {
            success: false,
            msg: createMerchaneErr.message || 'Something went wrong',
            data: createMerchaneErr.data || {},
          };
        }
        log.info('---createMerchantDetails---');
        log.info(createMerchantDetails);
        delete data.CreateTransactions['TigoTransactionID'];
        callGatewayOptions = {
          apiName: 'addTransaction',
          body: {
            ...data['CreateTransactions'],
            MerchantReferenceID: createMerchantDetails.MerchantReferenceID,
          },
        };
        [tigoTransactionErr, tigoTransactionDetails] = await Utils.executePromise(
          this.tigoGatewayParams.callGateway(callGatewayOptions),
        );
        if (tigoTransactionErr) {
          log.info('---tigoTransactionErr---');
          log.info(tigoTransactionErr);
          return {
            success: false,
            msg: tigoTransactionErr.message || 'Something went wrong',
            data: tigoTransactionErr.data || {},
          };
        }
        log.info('---tigoTransactionDetails---');
        log.info(tigoTransactionDetails);
      } else if (data['UpdateTransactions']) {
        const updateAttribs: any = { ...data['UpdateTransactions'] };
        delete updateAttribs['TigoTransactionID'];
        callGatewayOptions = {
          apiName: 'updateTransaction',
          body: {
            UpdateFilter: {
              TigoTransactionID: data['UpdateTransactions'].TigoTransactionID,
            },
            UpdateAttributes: { ...updateAttribs },
          },
        };
        [tigoTransactionErr, tigoTransactionDetails] = await Utils.executePromise(
          this.tigoGatewayParams.callGateway(callGatewayOptions),
        );
      } else if (data['MnoMerchant'] && !data['CreateTransactions']) {
        createMnoMerchantInstance = { ...data['MnoMerchant'] };
        [createMerchaneErr, createMerchantDetails] = await Utils.executePromise(
          this.mnoMerchantsController.create(createMnoMerchantInstance),
        );
        if (createMerchaneErr) {
          log.info('---createMerchaneErr---');
          log.info(createMerchaneErr);
          return {
            success: false,
            msg: createMerchaneErr.message || 'Something went wrong',
            data: createMerchaneErr.data || {},
          };
        }
        log.info('---createMerchantDetails---');
        log.info(createMerchantDetails);
      } else {
        delete data.CreateTransactions['TigoTransactionID'];
        callGatewayOptions = {
          apiName: 'addTransaction',
          body: {
            ...data['CreateTransactions'],
          },
        };
        [tigoTransactionErr, tigoTransactionDetails] = await Utils.executePromise(
          this.tigoGatewayParams.callGateway(callGatewayOptions),
        );
        if (tigoTransactionErr) {
          log.info('---tigoTransactionErr---');
          log.info(tigoTransactionErr);
          return {
            success: false,
            msg: tigoTransactionErr.message || 'Something went wrong',
            data: tigoTransactionErr.data || {},
          };
        }
        log.info('---tigoTransactionDetails---');
        log.info(tigoTransactionDetails);
      }
      return {
        success: true,
        msg: 'Tigo transaction queue successfully executed',
        data: {
          ...tigoTransactionDetails?.data?.tigoTransaction,
        },
      };
    } catch (error) {
      log.error('---processTigoTransactionFunction_CATCH_ERROR---');
      log.error(error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        data: error.data || {},
      };
    }
  }

  async processTigoTransactionMessage(tigoTransactionMsg: any) {
    try {
      const { gatewayRequestRes, body, paymentPartnerRes } = JSON.parse(tigoTransactionMsg);
      if (!gatewayRequestRes?.data?.tigoTransaction?.BillerMSISDN) {
        return {
          success: false,
          msg: 'Internal server error',
        };
      }

      const createTransactionInstance: any = {
        UpdateTransactions: { ...gatewayRequestRes.data.tigoTransaction },
      };
      let userFound: any;
      if (
        AZAMTV_CONSTANT_SPID.indexOf(gatewayRequestRes?.data?.tigoTransaction?.BillerMSISDN) > -1
      ) {
        const checkUserForAzamTv: any = {
          senderMsisdn: gatewayRequestRes.data.tigoTransaction.BillerMSISDN,
        };
        userFound = await this.paymentVendorController.checkUserForAzamTV(checkUserForAzamTv);
      } else {
        const connectedAppsObj: any = {
          routeInfo: paymentPartnerRes.payment_vendor,
          request: {
            operator: paymentGateways['TIGO'],
            ReferenceID: gatewayRequestRes?.data?.tigoTransaction?.ReferenceID,
            utilityref: gatewayRequestRes?.data?.tigoTransaction?.BillerMSISDN,
            Amount: body.Amount,
            TXNID: gatewayRequestRes?.data?.tigoTransaction?.ExternalReferenceID,
            MSISDN: gatewayRequestRes?.data?.tigoTransaction?.CUSTOMERREFERENCEID,
          },
        };
        // userFound = await this.paymentVendorController.checkUserForConnectedApp(connectedAppsObj);
        userFound = {
          success: true,
          isFromMQ: false,
        };
      }
      if (!userFound || (userFound && !userFound.success)) {
        log.info('Not Duplicate');
        createTransactionInstance.UpdateTransactions.Status = STATUS.PENDING;
        createTransactionInstance.UpdateTransactions.Operations.push({
          operation: 'CheckUserDetails',
          Status: createTransactionInstance.UpdateTransactions.Status,
          requestBody: {},
          responseBody: {},
        });
      } else if (userFound?.isFromMQ) {
        const mqPaymentObject = {
          routeInfo: paymentPartnerRes,
          request: {
            operator: paymentGateways.TIGO,
            smartCardNo: gatewayRequestRes?.data?.tigoTransaction?.BillerMSISDN,
            SenderMsisdn: gatewayRequestRes?.data?.tigoTransaction?.CUSTOMERREFERENCEID,
            amount: body.Amount,
            reciptNo: gatewayRequestRes?.data?.tigoTransaction?.ReferenceID,
            referenceNo: gatewayRequestRes?.data?.tigoTransaction?.ExternalReferenceID,
          },
        };
        log.info('---mqPaymentObject---');
        await this.paymentVendorController
          .paymentMQServices(mqPaymentObject)
          .then((res: any) => {
            log.info('---paymentVendorController.res---');
            if (res.success) {
              createTransactionInstance.UpdateTransactions.Status = STATUS.COMPLETED;
            } else {
              createTransactionInstance.UpdateTransactions.Status = STATUS.FAILURE;
            }
            createTransactionInstance.UpdateTransactions.Operations.push({
              operation: ApiList['PAYMENT_BY_MQ_SERVICE'],
              Status: createTransactionInstance.UpdateTransactions.Status,
              requestBody: res.requestBody,
              responseBody: res.responseBody,
            });
          })
          .catch((err: any) => {
            log.error('---paymentVendorController.err---', err);
            createTransactionInstance.UpdateTransactions.Status = STATUS.FAILURE;
            createTransactionInstance.UpdateTransactions.Operations.push({
              operation: ApiList['PAYMENT_BY_MQ_SERVICE'],
              Status: createTransactionInstance.UpdateTransactions.Status,
              requestBody: err.requestBody,
              responseBody: err.responseBody,
            });
          });
      } else {
        const makePaymentObj = {
          routeDetails: paymentPartnerRes.payment_vendor,
          request: {
            TransactionStatus: body?.Status ? 'success' : 'failed',
            Message: body?.Description
              ? body?.Description
              : body?.Status
              ? 'Payment successful'
              : 'Payment failed',
            Operator: paymentGateways['TIGO'],
            ReferenceID: gatewayRequestRes.data.tigoTransaction.ReferenceID,
            ExternalReferenceID: gatewayRequestRes.data.tigoTransaction.ExternalReferenceID,
            UtilityReference: gatewayRequestRes.data.tigoTransaction.BillerMSISDN,
            Amount: body?.Amount || gatewayRequestRes.data.tigoTransaction.Amount,
            TansactionID: gatewayRequestRes.data.tigoTransaction.ExternalReferenceID,
            Msisdn: gatewayRequestRes.data.tigoTransaction.CUSTOMERREFERENCEID,
          },
        };
        log.info('---makePaymentObj---');
        log.info(makePaymentObj);
        await this.paymentVendorController
          .payUserForConnectedApp(makePaymentObj)
          .then((res: any) => {
            log.info('---paymentVendorController.res---');
            if (res.success) {
              createTransactionInstance.UpdateTransactions.Status = STATUS.COMPLETED;
            } else {
              createTransactionInstance.UpdateTransactions.Status = STATUS.FAILURE;
            }
            createTransactionInstance.UpdateTransactions.Operations.push({
              operation: 'payUserForConnectedApp',
              Status: createTransactionInstance.UpdateTransactions.Status,
              requestBody: res.requestBody,
              responseBody: res.responseBody,
            });
          })
          .catch((err: any) => {
            log.error('---paymentVendorController.err---', err);
            createTransactionInstance.UpdateTransactions.Status = STATUS.FAILURE;
            createTransactionInstance.UpdateTransactions.Operations.push({
              operation: paymentPartnerRes.payment_vendor,
              Status: createTransactionInstance.UpdateTransactions.Status,
              requestBody: err.requestBody,
              responseBody: err.responseBody,
            });
          });
      }
      log.info('---createTransactionInstance---');
      return await this.processTransactionFunction(createTransactionInstance);
    } catch (error) {
      log.error('---processTigoTransactionFunction_CATCH_ERROR---', error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        data: error.data || {},
      };
    }
  }

  async recieveRabbitMessages(routingKey: any, exchangeName: any): Promise<any> {
    try {
      return await tigoRabbitMq
        .recieveRabbitMessages(routingKey, exchangeName)
        .then((boundQueue: any) => {
          boundQueue.channelRes.consume(boundQueue.channelQRes.queue, async (msg: any) => {
            log.info('---recieveRabbitMessages---');
            if (exchangeName.toUpperCase() === 'GATEWAY') {
              if (msg?.fields?.routingKey === this.tigoTransactionsConstants['queueRoutingKey']) {
                await this.processTigoTransactionMessage(msg.content.toString());
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
