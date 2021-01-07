/* eslint-disable @typescript-eslint/no-explicit-any */
import { GatewayInterface, inject, moment, Utils, xml2Json } from '../common';
import { ApiList, paymentGateways, STATUS, VodacomTransactionsConstants } from '../constants';
import { PaymentPartnerController, PaymentVendorController, vodacomRabbitMq } from '../controllers';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
const log = new LoggingInterceptor('vodacom-transactions.Consumer');

export class VodacomMqConsumer {
  constructor(
    @inject(`controllers.PaymentVendorController`)
    private paymentVendorController: PaymentVendorController,

    @inject(`controllers.PaymentPartnerController`)
    private paymentPartnerController: PaymentPartnerController,
  ) {}
  private vodacomGatewayParams: GatewayInterface = new GatewayInterface(paymentGateways['VODACOM']);
  private vodacomTransactionsConstants: any = VodacomTransactionsConstants;

  private async processVodacomTransactionMessage(vodacomRequest: any) {
    try {
      const vodaReq: any = JSON.parse(vodacomRequest);
      const isNotduplicateRequest = await this.processDataToGatewayServer(vodaReq);
      const paymentPartner: any = await this.paymentPartnerController.findOne({
        where: {
          CollectionAccountNumber: vodaReq.Request.serviceProvider.CollectionAccountNumber,
          Status: STATUS.ACTIVE,
        },
      });
      log.info('request came here', vodaReq);
      log.info('All the partner i have', paymentPartner);
      log.info('duplicateRequest', isNotduplicateRequest.success);
      const serviceRecipt: any = Utils.generateReferenceID(
        vodaReq.Request.serviceProvider.timestamp.toString(),
        vodaReq.Request.transaction.conversationID.toString(),
      );
      const vodaSuccessObj: any = {
        spId: vodaReq.Request.serviceProvider.CollectionAccountNumber,
        spPassword: vodaReq.Request.serviceProvider.CollectionAccountPassword,
        timestamp: vodaReq.Request.serviceProvider.timestamp,
        resultType: 'Completed',
        resultCode: 0,
        resultDesc: 'Successful',
        serviceReceipt: serviceRecipt,
        serviceDate: moment().format('YYYY-MM-DD HH:mm:ss'),
        originatorConversationID: vodaReq.Request.transaction.originatorConversationID,
        conversationID: vodaReq.Request.transaction.conversationID,
        transactionID: vodaReq.Request.transaction.transactionID,
        initiator: 'AzamPay',
        initiatorPassword: 'AzamPay@123',
      };

      if (isNotduplicateRequest.success) {
        // an example using an object instead of an array
        let userFound = null;
        if (
          paymentPartner &&
          this.vodacomTransactionsConstants.AZAMTV_CONSTANT_SPID.indexOf(
            paymentPartner.CollectionAccountNumber,
          ) > -1
        ) {
          vodaReq.senderMsisdn = vodaReq.Request.transaction.accountReference;
          userFound = await this.paymentVendorController.checkUserForAzamTV(vodaReq);
        } else {
          const connectedAppObj: any = {
            request: vodaReq,
            routeInfo: paymentPartner.payment_vendor,
          };
          userFound = await this.paymentVendorController.checkUserForConnectedApp(connectedAppObj);
        }
        // To get the success or error result to vodacom for sending it.
        if (!userFound || (userFound && !userFound.success)) {
          vodaSuccessObj.resultType = 'failed';
          vodaSuccessObj.resultCode = 999;
          vodaSuccessObj.resultDesc = 'failure';
        }
        if (userFound && userFound.isFromMQ) {
          vodaSuccessObj.isFromMQ = userFound.isFromMQ;
        }
        log.info('Not Duplicate');
      } else {
        log.info('Is a Duplicate');
        vodaSuccessObj.resultType = 'failed';
        vodaSuccessObj.resultCode = 999;
        vodaSuccessObj.resultDesc = 'failure';
        vodaSuccessObj.isDuplicated = true;
        // return the request with no reponse as we dont have a customer of such kind
      }

      const vodacomRes = await this.sendSuccessToVodacom(vodaSuccessObj, vodaReq, paymentPartner);
      log.info('response from voda', vodacomRes);
      if (vodacomRes.success) {
        // set the status of the result
        const callGatewayOptions: any = {
          apiName: 'addTransaction',
          body: {
            ...vodaReq,
            Status: STATUS.COMPLETED,
            Operations: {
              operation: ApiList['VODACOM_RESPONSE_INTIMATION'],
              requestBody: { ...vodaSuccessObj },
              responseBody: vodacomRes.data,
            },
          },
        };
        log.info('---vodacomGatewayParams.callGateway.callGatewayOptions---');
        log.info(callGatewayOptions);
        this.vodacomGatewayParams
          .callGateway(callGatewayOptions)
          .then((res: any) => {
            log.info('---vodacomGatewayParams.callGateway.res---');
            log.info(res);
            return res;
          })
          .catch((err: any) => {
            log.info('---vodacomGatewayParams.callGateway.err---');
            log.info(err);
            return err;
          });
      } else {
        const callGatewayOptions: any = {
          apiName: 'addTransaction',
          body: {
            ...vodaReq,
            Status: STATUS.FAILURE,
            Operations: {
              operation: ApiList['VODACOM_RESPONSE_INTIMATION'],
              requestBody: { ...vodaSuccessObj },
              responseBody: vodacomRes.data,
            },
          },
        };
        log.info('---vodacomGatewayParams.callGateway.callGatewayOptions---');
        log.info(callGatewayOptions);
        this.vodacomGatewayParams
          .callGateway(callGatewayOptions)
          .then((res: any) => {
            log.info('---vodacomGatewayParams.callGateway.res---');
            log.info(res);
            return res;
          })
          .catch((err: any) => {
            log.info('---vodacomGatewayParams.callGateway.err---');
            log.info(err);
            return err;
          });
      }
    } catch (error) {
      log.error('---processVodacomTransactionMessage.catch.error---');
      log.error(error);
      return { success: false };
    }
  }

  async sendSuccessToVodacom(
    vodaSuccessObj: any,
    requestObject: any,
    paymentPartner: any,
  ): Promise<any> {
    try {
      if (!vodaSuccessObj.isDuplicated) {
        const options = {
          apiPath: ApiList['VODACOM_RESPONSE_INTIMATION'],
          body: {
            spId: vodaSuccessObj?.spId,
            spPassword: vodaSuccessObj?.spPassword,
            timestamp: vodaSuccessObj?.timestamp,
            resultType: vodaSuccessObj?.resultType,
            resultCode: vodaSuccessObj?.resultCode,
            resultDesc: vodaSuccessObj?.resultDesc,
            serviceReceipt: vodaSuccessObj?.serviceReceipt,
            serviceDate: vodaSuccessObj?.serviceDate,
            originatorConversationID: vodaSuccessObj?.originatorConversationID,
            conversationID: vodaSuccessObj?.conversationID,
            transactionID: vodaSuccessObj?.transactionID,
            initiator: vodaSuccessObj?.initiator,
            initiatorPassword: vodaSuccessObj?.initiatorPassword,
          },
        };
        await Utils.callRequest(options)
          .then(async (vodacomSuccess: any) => {
            if (vodacomSuccess.success && vodacomSuccess.data) {
              let vodaSuccess = JSON.parse(xml2Json.toJson(vodacomSuccess.data));
              log.info('vodaSuccess????????????????', vodaSuccess);
              vodaSuccess = { response: { serviceStatus: 'confirming' } };
              if (vodaSuccess?.response?.serviceStatus.toString().toLowerCase() == 'confirming') {
                if (vodaSuccessObj.isFromMQ) {
                  //  Pay MQ
                  const mqPaymentObject = {
                    routeInfo: {},
                    request: {
                      operator: paymentGateways.VODACOM,
                      smartCardNo: requestObject.request.transaction.accountReference,
                      SenderMsisdn: requestObject.request.transaction.initiator,
                      amount: requestObject.request.transaction.amount,
                      reciptNo: requestObject.request.transaction.mpesaReceipt,
                      referenceNo: requestObject.request.transaction.transactionID,
                    },
                  };
                  return await this.paymentVendorController.paymentMQServices(mqPaymentObject);
                } else {
                  const payForConnectedApp = {
                    routeDetails: paymentPartner.payment_vendor,
                    request: {
                      TransactionStatus: 'success',
                      Message: 'Payment successful',
                      Operator: 'Vodacom',
                      ReferenceID: requestObject.request.transaction.mpesaReceipt,
                      ExternalReferenceID: requestObject.request.transaction.mpesaReceipt,
                      UtilityReference: requestObject.ExternalReferenceID,
                      Amount: requestObject.request.transaction.amount,
                      TansactionID: requestObject.request.transaction.transactionID,
                      Msisdn: requestObject.request.transaction.conversationID,
                    },
                  };
                  return await this.paymentVendorController.payUserForConnectedApp(
                    payForConnectedApp,
                  );
                }
              }
            } else {
              log.info('---vodacomSuccess.else---');
              log.info(vodacomSuccess);
              return {
                success: false,
                message: 'Vodacom api returned an invalid response',
                data: vodacomSuccess,
              };
            }
          })
          .catch(async (err: any) => {
            log.info('came inerror busted');
            return {
              success: false,
              message: 'something went wrong while throwing request to Vodacom',
              data: err,
            };
          });
      } else {
        return {
          success: false,
          message: 'Duplicate request found responded with failure',
          data: {},
        };
      }
    } catch (error) {
      log.error('---sendSuccessToVodacom.catch.error---');
      log.error(error);
      return { success: false };
    }
  }

  async processDataToGatewayServer(body: any) {
    try {
      log.info('---sendDataToGatewayServer---');
      log.info(body);
      const callGatewayOptions: any = {
        apiName: 'fetchTransaction',
        body: {
          where: {
            ReferenceID: body.ReferenceID,
            or: [
              {
                Status: STATUS.PENDING,
              },
              {
                Status: STATUS.COMPLETED,
              },
            ],
          },
        },
      };
      const [gatewayRequestErr, gatewayRequestRes]: any = await Utils.executePromise(
        this.vodacomGatewayParams.callGateway(callGatewayOptions),
      );
      if (
        gatewayRequestErr ||
        (gatewayRequestRes && !gatewayRequestRes.success) ||
        gatewayRequestRes?.data?.vodacomTransaction
      ) {
        log.info('---gatewayRequestErr---');
        log.info(gatewayRequestErr || gatewayRequestRes);
        return { success: false };
      }
      log.info('---gatewayRequestRes---');
      log.info(gatewayRequestRes);
      return { success: true };
    } catch (error) {
      log.error('---processDataToGatewayServer.catch.error---');
      log.error(error);
      return { success: false };
    }
  }

  async recieveRabbitMessages(routingKey: any, exchangeName: any): Promise<any> {
    try {
      return await vodacomRabbitMq
        .recieveRabbitMessages(routingKey, exchangeName)
        .then((boundQueue: any) => {
          boundQueue.channelRes.consume(
            boundQueue.channelQRes.queue,
            async (msg: any) => {
              log.info('---recieveRabbitMessages---');
              if (exchangeName.toUpperCase() === 'GATEWAY') {
                if (
                  msg?.fields?.routingKey === this.vodacomTransactionsConstants['queueRoutingKey']
                ) {
                  await this.processVodacomTransactionMessage(msg.content.toString());
                }
              }
              await boundQueue.channelRes.ack(msg);
              return msg?.content?.toString();
            },
            { noAck: true },
          );
        })
        .catch((err: any) => {
          log.error('---recieveRabbitMessages---');
          log.error(err);
          return {
            success: false,
            statusCode: 500,
            msg: 'Internal server error',
            data: err || {},
          };
        });
    } catch (error) {
      log.error('---recieveRabbitMessages_CATCH_ERROR---');
      log.error(error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        data: error.data || {},
      };
    }
  }
}
