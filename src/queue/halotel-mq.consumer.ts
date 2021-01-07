/* eslint-disable no-invalid-this */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GatewayInterface, inject, moment, repository, Utils } from '../common';
import {
  ApiList,
  paymentGateways,
  POST_METHOD,
  RESPONSE_TYPE,
  SERVICE_TYPE,
  STATUS,
} from '../constants';
import { HalotelTransactionConstant } from '../constants/';
import { halotelRabbitMq, PaymentPartnerController, PaymentVendorController } from '../controllers';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { NotificationTransactionsRepository } from '../repositories';
const log = new LoggingInterceptor('halopesa-transactions.Consumer');

export class HalotelConsumer {
  constructor(
    @inject(`controllers.PaymentVendorController`)
    private paymentVendorController: PaymentVendorController,

    @inject(`controllers.PaymentPartnerController`)
    private paymentPartnerController: PaymentPartnerController,

    @repository(NotificationTransactionsRepository)
    public notificationsRepository: NotificationTransactionsRepository,
  ) {}
  private halotelTransactionParameters: GatewayInterface = new GatewayInterface(
    paymentGateways['HALOTEL'],
  );
  private halotelTransactionConstant: any = HalotelTransactionConstant;

  async updateUserWallet(): Promise<any> {
    const options = {
      method: POST_METHOD,
      uri: '',
      body: '',
    };
    await Utils.callRequest(options)
      .then((updateUserWallet: any) => {
        if (updateUserWallet) {
          try {
            // call gateway and store the intimatio response
          } catch (error) {
            return {
              success: false,
              message: 'Something went wrong while parsing the data',
              data: error,
            };
          }
        } else {
          return {
            success: false,
            message: 'Something went wrong while parsing the data',
            data: updateUserWallet,
          };
        }
      })
      .catch((err: any) => {
        return {
          success: false,
          message: 'Something went wrong while requesting halopesa',
          data: err,
        };
      });
  }

  async callHaloPesaForIntimatingPaymentUssdPush(callHalopesaString: any): Promise<any> {
    try {
      log.info('---JSON.parse(callHalopesaString)---');
      const { halopesaReq, paymentPartner } = JSON.parse(callHalopesaString);
      const callGatewayOptions = {
        apiName: 'addTransaction',
        body: {
          RequestID: halopesaReq.requestid,
          Amount: halopesaReq.amount,
          ReferenceID: halopesaReq.ReferenceID,
          CollectionAccountNumber: halopesaReq.beneficiary_accountid,
          PaymentVendorID: paymentPartner.PaymentVendorID,
          SenderMsisdn: halopesaReq.senderMsisdn,
          ReferenceMsisdn: halopesaReq?.ReferenceMsisdn || halopesaReq.senderMsisdn,
          ExternalReferenceID: halopesaReq?.referenceid,
          IncomingRequestType: SERVICE_TYPE.USSD_PUSH,
          Operations: halopesaReq.Operations,
          Status: halopesaReq.Status,
        },
      };
      log.info('---callGatewayOptions---');
      const [gatewayErr, gatewayRes] = await Utils.executePromise(
        this.halotelTransactionParameters.callGateway(callGatewayOptions),
      );
      if (gatewayErr || (gatewayRes && (!gatewayRes.success || !gatewayRes.data))) {
        log.error('---halotelTransactionParameters.gatewayErr---', gatewayErr);
        return {
          success: gatewayErr.success
            ? gatewayErr.success
            : gatewayRes.success
            ? gatewayRes.success
            : false,
          statusCode: gatewayErr.success
            ? gatewayErr.success
            : gatewayRes.success
            ? gatewayRes.success
            : 500,
          msg: gatewayErr.success
            ? gatewayErr.success
            : gatewayRes.success
            ? gatewayRes.success
            : 'Internal server error',
          data: gatewayErr.success
            ? gatewayErr.success
            : gatewayRes.success
            ? gatewayRes.success
            : {},
        };
      }
      log.info('---halotelTransactionParameters.gatewayRes---');
      return {
        success: true,
        statusCode: 200,
        msg: 'Transaction Successfully saved',
        data: gatewayRes.data,
      };
    } catch (error) {
      log.error('---callHaloPesaForIntimatingPaymentUssdPush_CATCH_ERROR---', error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        data: error.data || {},
      };
    }
  }

  async recieveHaloPesaResponseUpdatePayment(callHalopesaString: any): Promise<any> {
    try {
      const { paymentPartner, halotelReq }: any = JSON.parse(callHalopesaString);
      log.info('---recieveHaloPesaResponseUpdatePayment.halotelReq---');
      let userFound = null;
      if (
        paymentPartner &&
        this.halotelTransactionConstant.HALOPESA_AZAMTV_CONSTANT_SPID.indexOf(
          paymentPartner.CollectionAccountNumber,
        ) > -1
      ) {
        const checkUserRequest: any = {
          ...halotelReq,
          senderMsisdn: halotelReq.ReferenceMsisdn,
        };
        log.info('---checkUserRequest---');
        userFound = await this.paymentVendorController.checkUserForAzamTV(checkUserRequest);
      } else if (paymentPartner?.payment_vendor && paymentPartner?.PaymentInitiationRoute) {
        const connectedAppsObj: any = {
          routeInfo: paymentPartner.payment_vendor,
          request: {
            operator: 'Halotel',
            ReferenceID: halotelReq.ReferenceID,
            utilityref: halotelReq.ReferenceMsisdn,
            Amount: halotelReq.Amount,
            TXNID: halotelReq.RequestID,
            MSISDN: halotelReq.SenderMsisdn,
          },
        };
        log.info('---connectedAppsObj---');
        // userFound = await this.paymentVendorController.checkUserForConnectedApp(connectedAppsObj);
        userFound = {
          success: true,
          isFromMQ: false,
        };
      } else {
        return {
          TYPE: 'failed',
          TXNSTATUS: 999,
          MESSAGE: 'internal server error',
          isFromMQ: false,
        };
      }
      log.info('---userFound---');
      if (!userFound || (userFound && !userFound.success)) {
        log.info('Not Duplicate');
        return {
          TYPE: 'failed',
          TXNSTATUS: 999,
          MESSAGE: 'failure',
          isFromMQ: userFound?.isFromMQ,
        };
      } else if (userFound?.isFromMQ) {
        const operationsObj: any = {
          operation: ApiList['HALOTEL_PAYMENT_INITIATION'] + 'Callback',
          requestBody: { ...halotelReq },
          responseBody: {},
        };
        const callGatewayOptions: any = {
          apiName: 'updateTransaction',
          body: {
            UpdateFilter: {
              HalotelTransactionID: halotelReq.HalotelTransactionID,
            },
            UpdateAttributes: {
              RequestID: halotelReq.RequestID,
              Amount: halotelReq.Amount,
              ReferenceID: halotelReq.ReferenceID,
              ExternalReferenceID: halotelReq.ExternalReferenceID,
              CollectionAccountNumber: halotelReq.CollectionAccountNumber,
              PaymentVendorID: paymentPartner.PaymentVendorID,
              SenderMsisdn: halotelReq.SenderMsisdn,
              ReferenceMsisdn: halotelReq.ReferenceMsisdn,
              IncomingRequestType: SERVICE_TYPE.USSD_PUSH,
              Operations: halotelReq.Operations,
            },
          },
        };
        const mqPaymentObject = {
          routeInfo: paymentPartner,
          request: {
            operator: paymentGateways.HALOTEL,
            smartCardNo: halotelReq?.ReferenceMsisdn,
            SenderMsisdn: halotelReq.SenderMsisdn,
            amount: halotelReq?.Amount,
            reciptNo: halotelReq?.RequestID,
            referenceNo: Utils.generateReferenceID(
              halotelReq?.SenderMsisdn,
              halotelReq?.ReferenceMsisdn,
              halotelReq?.Amount,
              halotelReq?.RequestID,
            ),
          },
        };
        log.info('---mqPaymentObject---');
        await this.paymentVendorController
          .paymentMQServices(mqPaymentObject)
          .then((res: any) => {
            log.info('---paymentVendorController.paymentMQServices.res---');
            if (res?.success) {
              callGatewayOptions.body.UpdateAttributes.Status = STATUS.COMPLETED;
              operationsObj.Status = callGatewayOptions.body.UpdateAttributes.Status;
              halotelReq.Operations.push({
                operation: ApiList['PAYMENT_BY_MQ_SERVICE'],
                Status: operationsObj.Status,
                requestBody: res.requestBody,
                responseBody: res.responseBody,
              });
            } else {
              callGatewayOptions.body.UpdateAttributes.Status = STATUS.FAILURE;
              operationsObj.Status = callGatewayOptions.body.UpdateAttributes.Status;
              halotelReq.Operations.push({
                operation: ApiList['PAYMENT_BY_MQ_SERVICE'],
                Status: operationsObj.Status,
                requestBody: res.requestBody,
                responseBody: res.responseBody,
              });
            }
          })
          .catch((err: any) => {
            log.error('---paymentVendorController.paymentMQServices.err---', err);
            callGatewayOptions.body.UpdateAttributes.Status = STATUS.FAILURE;
            operationsObj.Status = callGatewayOptions.body.UpdateAttributes.Status;
            halotelReq.Operations.push({
              operation: ApiList['PAYMENT_BY_MQ_SERVICE'],
              Status: operationsObj.Status,
              requestBody: err.requestBody,
              responseBody: err.responseBody,
            });
          });
        halotelReq.Operations.push(operationsObj);

        log.info('---callGatewayOptions----');
        const [callGatewayError, callGatewayResult]: any[] = await Utils.executePromise(
          this.halotelTransactionParameters.callGateway(callGatewayOptions),
        );
        if (callGatewayError || !callGatewayResult?.success) {
          log.error('---halotelTransactionParameters.callGateway.err---', callGatewayError);
          return {
            responseType: RESPONSE_TYPE['ERROR'],
            msg: 'Internal server error',
            data: {},
          };
        } else {
          log.info('---halotelTransactionParameters.callGateway.res---');
          return {
            responseType: RESPONSE_TYPE['SUCCESS'],
            msg: 'Transaction successfully executed',
            reference_id: halotelReq?.ReferenceID,
            response_time: moment().format('YYYYMMDDHHmmss'),
          };
        }
      } else {
        const operationsObj: any = {
          operation: ApiList['HALOTEL_PAYMENT_INITIATION'] + 'Callback',
          requestBody: { ...halotelReq },
          responseBody: {},
        };
        const callGatewayOptions: any = {
          apiName: 'updateTransaction',
          body: {
            UpdateFilter: {
              HalotelTransactionID: halotelReq.HalotelTransactionID,
            },
            UpdateAttributes: {
              RequestID: halotelReq.RequestID,
              Amount: halotelReq.Amount,
              ReferenceID: halotelReq.ReferenceID,
              CollectionAccountNumber: halotelReq.CollectionAccountNumber,
              PaymentVendorID: paymentPartner.PaymentVendorID,
              SenderMsisdn: halotelReq.SenderMsisdn,
              ReferenceMsisdn: halotelReq.ReferenceMsisdn,
              IncomingRequestType: SERVICE_TYPE.USSD_PUSH,
              Operations: halotelReq.Operations,
            },
          },
        };
        const makePaymentObj = {
          routeDetails: paymentPartner.payment_vendor,
          request: {
            TransactionStatus:
              [0, '0'].indexOf(halotelReq?.response_code) > -1 ? 'success' : 'failed',
            Message: halotelReq?.message,
            Operator: 'Halotel',
            ReferenceID: halotelReq.ReferenceID,
            ExternalReferenceID: halotelReq.ExternalReferenceID,
            UtilityReference: halotelReq.ReferenceMsisdn,
            Amount: halotelReq.Amount,
            TansactionID: halotelReq.RequestID,
            Msisdn: halotelReq.SenderMsisdn,
          },
        };
        log.info('---makePaymentObj---');
        await this.paymentVendorController
          .payUserForConnectedApp(makePaymentObj)
          .then((res: any) => {
            log.info('---paymentVendorController.payUserForConnectedApp.res---');
            callGatewayOptions.body.UpdateAttributes.Status = STATUS.COMPLETED;
            operationsObj.Status = callGatewayOptions.body.UpdateAttributes.Status;
            halotelReq.Operations.push({
              operation: 'PayForConnectedApp',
              Status: operationsObj.Status,
              requestBody: res.requestBody,
              responseBody: res.responseBody,
            });
          })
          .catch((err: any) => {
            log.error('---this.paymentVendorController.payUserForConnectedApp.err---', err);
            callGatewayOptions.body.UpdateAttributes.Status = STATUS.FAILURE;
            operationsObj.Status = callGatewayOptions.body.UpdateAttributes.Status;
            halotelReq.Operations.push({
              operation: 'PayForConnectedApp',
              Status: operationsObj.Status,
              requestBody: err.requestBody,
              responseBody: err.responseBody,
            });
          });
        halotelReq.Operations.push(operationsObj);

        log.info('---callGatewayOptions----');
        const [callGatewayError, callGatewayResult]: any[] = await Utils.executePromise(
          this.halotelTransactionParameters.callGateway(callGatewayOptions),
        );
        if (callGatewayError || !callGatewayResult?.success) {
          log.error('---halotelTransactionParameters.callGateway.err---', callGatewayError);
          return {
            responseType: RESPONSE_TYPE['ERROR'],
            msg: 'Internal server error',
            reference_id: halotelReq?.ReferenceID,
            response_time: moment().format('YYYYMMDDHHmmss'),
          };
        } else {
          log.info('---halotelTransactionParameters.callGateway.res---');
          return {
            responseType: RESPONSE_TYPE['SUCCESS'],
            msg: 'Transaction successfully executed',
            reference_id: halotelReq?.ReferenceID,
            response_time: moment().format('YYYYMMDDHHmmss'),
          };
        }
      }
    } catch (error) {
      log.error('---recieveHaloPesaResponseUpdatePayment.catch.error---', error);
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
      return await halotelRabbitMq
        .recieveRabbitMessages(routingKey, exchangeName)
        .then((boundQueue: any) => {
          boundQueue.channelRes.consume(
            boundQueue.channelQRes.queue,
            async (msg: any) => {
              log.info('---recieveRabbitMessages---');
              if (exchangeName.toUpperCase() === 'GATEWAY') {
                switch (msg?.fields?.routingKey) {
                  case this.halotelTransactionConstant['queuePaymentInitiationRoutingKey']:
                    await this.callHaloPesaForIntimatingPaymentUssdPush(msg.content.toString());

                  case this.halotelTransactionConstant['queuePaymentUpdationRoutingKey']:
                    await this.recieveHaloPesaResponseUpdatePayment(msg.content.toString());
                }
              }
              await boundQueue.channelRes.ack(msg);
              return msg.content.toString();
            },
            { noAck: true },
          );
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
