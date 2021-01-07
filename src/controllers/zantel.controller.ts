import { PaymentVendorController } from '.';
import { zantelDef } from '../api-specs/zantel-transactions';
import {
  api,
  Filter,
  GatewayInterface,
  inject,
  moment,
  repository,
  Request,
  RestBindings,
  Utils,
  xml2Json,
} from '../common';
import {
  ApiList,
  DateTimeFormats,
  InterfaceList,
  paymentGateways,
  ResponseMappings,
  RESPONSE_TYPE,
  SERVICE_TYPE,
  STATUS,
  ZantelTransactionConstant,
} from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { RabbitMqProducer } from '../queue';
import { PaymentPartnerRepository, PaymentVendorRepository } from '../repositories';
export const zantelRabbitMq = new RabbitMqProducer('gateway');
const log = new LoggingInterceptor('zantel.Controllers');
const { DateFormat, TimeFormat, TimstampFormat } = DateTimeFormats;

@api(zantelDef)
export class ZantelTransactions {
  constructor(
    @repository(PaymentVendorRepository)
    private paymentVendorRepository: PaymentVendorRepository,

    @repository(PaymentPartnerRepository)
    private paymentPartnerRepository: PaymentPartnerRepository,
  ) {}
  private zantelGatewayParams: GatewayInterface = new GatewayInterface(paymentGateways['ZANTEL']);
  private zantelTransactionConstant: any = ZantelTransactionConstant;
  private paymentVendorController: PaymentVendorController = new PaymentVendorController(
    this.paymentVendorRepository,
    this.paymentPartnerRepository,
  );

  async ussdZantelPushFunction(zantelTransaction: any): Promise<any> {
    try {
      const zantelTransactionReq: any = { ...zantelTransaction };
      const paymentPartnerFilter = {
        where: {
          PartnerCode: zantelTransactionReq.PartnerCode,
          Status: STATUS.ACTIVE,
        },
        include: [
          {
            relation: 'payment_vendor',
          },
        ],
      };
      const paymentPartnerDetails = await this.paymentPartnerRepository.findOne(
        paymentPartnerFilter,
      );
      if (paymentPartnerDetails?.PaymentPartnerID) {
        const rpObj = {
          apiPath: ApiList['ZANTEL_USSD_PUSH'],
          body: {
            Username: paymentPartnerDetails.Username,
            Password: paymentPartnerDetails.Password,
            Msisdn: zantelTransactionReq.ReferenceMsisdn,
            ReferenceData1: Utils.generateReferenceID(
              zantelTransactionReq.SenderMsisdn,
              zantelTransactionReq.ReferenceMsisdn,
            ),
            ReferenceData2: paymentPartnerDetails?.CollectionAccountNumber,
            Amount: zantelTransactionReq.Amount,
          },
        };
        const [rpError, rpDetails] = await Utils.executePromise(Utils.callRequest(rpObj));
        if (rpError) {
          log.error('---rpError--', rpError);
          return {
            messageCode: ResponseMappings['ZANTEL_TRANSACTION_FAIL'],
            data: rpError.data || {},
          };
        }
        const rpJson = JSON.parse(
          xml2Json.toJson(rpDetails.data.toString().replace(/soap:|ns2:/g, '')),
        );
        if (
          !Utils.findKey({ obj: rpJson, value: 'Envelope' }) &&
          !Utils.findKey({ obj: rpJson['Envelope'], value: 'Body' }) &&
          !Utils.findKey({ obj: rpJson['Envelope']['Body'], value: 'UssdPushRequestResponse' })
        ) {
          log.info('---INVALID RESPONSE---');
          return {
            messageCode: ResponseMappings['INVALID_PARTNER_RESPONSE'],
            data: {},
          };
        }
        const rpJsonBody = rpJson['Envelope']['Body']['UssdPushRequestResponse'];
        const createInstanceObj: any = {
          ReferenceID: rpObj.body.ReferenceData1,
          IncomingReferenceID: zantelTransactionReq.ReferenceField1,
          ExternalReferenceID: rpJsonBody.PushReferenceId,
          PaymentVendorID: paymentPartnerDetails.PaymentVendorID,
          SenderMsisdn: zantelTransactionReq.SenderMsisdn,
          CustomerReferenceID: zantelTransactionReq.ReferenceMsisdn,
          Amount: zantelTransactionReq.Amount,
          IncomingRequestType: SERVICE_TYPE.USSD_PUSH,
          CountryCode: zantelTransactionReq?.CountryCode,
          Status: STATUS.PENDING,
          Operations: [
            {
              operation: 'ussdZantelPush',
              Status: STATUS.PENDING,
              requestBody: rpObj,
              responseBody: rpJsonBody,
            },
          ],
        };
        const rabbitMQProducerObj: any = {
          createTransactionInstance: createInstanceObj,
        };
        zantelRabbitMq.sendToQueue(
          JSON.stringify(rabbitMQProducerObj),
          this.zantelTransactionConstant['queueRoutingKey'],
        );
        log.info('---createInstanceObj---');
        return {
          messageCode: ResponseMappings['SUCCESS'],
          data: {
            ReferenceID: createInstanceObj?.ReferenceID,
            ExternalReferenceID: createInstanceObj?.ExternalReferenceID,
          },
        };
      } else {
        log.info('---Unauthorized_user---');
        return { messageCode: ResponseMappings['BAD_REQUEST'] };
      }
    } catch (error) {
      log.error('---zantelTransactionUssdPush_CATCH_ERROR---', error);
      return {
        messageCode: ResponseMappings['SERVICE_UNAVAILABLE'],
        data: error.data || {},
      };
    }
  }

  async queryZantelTransactionFunction(zantelTransaction: any): Promise<any> {
    try {
      const zantelTransactionReq: any = { ...zantelTransaction };
      const zanTelTransactionFilter: Filter = {
        where: {
          ReferenceID: zantelTransactionReq.ReferenceID,
          Status: STATUS.ACTIVE,
        },
      };
      const paymentPartnerFilter = {
        where: {
          PartnerCode: zantelTransactionReq.PartnerCode,
          Status: STATUS.ACTIVE,
        },
      };
      const callGatewayOptions = {
        apiName: 'fetchTransaction',
        body: { ...zanTelTransactionFilter },
      };
      const [zantelTransactionError, zantelTransactionDetails] = await Utils.executePromise(
        this.zantelGatewayParams.callGateway(callGatewayOptions),
      );
      const paymentPartnerDetails = await this.paymentPartnerRepository.findOne(
        paymentPartnerFilter,
      );
      if (
        zantelTransactionError ||
        !(zantelTransactionDetails.success || zantelTransactionDetails?.data?.zantelTransaction)
      ) {
        log.error('---zantelTransactionError---', zantelTransactionError);
        return {
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          success: zantelTransactionError.success || false,
          statusCode: zantelTransactionError.statusCode || 500,
          msg: zantelTransactionError.msg || 'Internal server error',
          data: zantelTransactionError.data || {},
        };
      }
      if (paymentPartnerDetails?.PartnerPaymentID) {
        const rpObj = {
          apiPath: ApiList['ZANTEL_QUERY_TRANSACTION'],
          body: {
            Username: paymentPartnerDetails.Username,
            Password: paymentPartnerDetails.Password,
            PushReferenceId: zantelTransactionDetails?.data?.zantelTransaction?.ExternalReferenceID,
          },
        };
        log.info('---rpObj---');
        const [rpError, rpDetails] = await Utils.executePromise(Utils.callRequest(rpObj));
        // let [rpError, rpDetails] = [undefined, { body: `` }];
        if (rpError) {
          log.error('---rpError--', rpError);
          return {
            success: false,
            statusCode: rpError.statusCode || 500,
            msg: rpError.message || 'Internal server error',
            data: rpError.data || {},
          };
        }
        const jsonResp = JSON.parse(xml2Json.toJson(rpDetails.body).replace(/soap:|ns2:/g, ''));
        if (
          !Utils.findKey({ obj: jsonResp, value: 'Envelope' }) &&
          !Utils.findKey({ obj: jsonResp['Envelope'], value: 'Body' }) &&
          !Utils.findKey({ obj: jsonResp['Envelope']['Body'], value: 'checkTransactionResponse' })
        ) {
          log.info('---INVALID RESPONSE---');
          return {
            messageCode: ResponseMappings['INVALID_PARTNER_RESPONSE'],
            success: false,
            statusCode: 500,
            msg: 'Something went wrong,\nPlease try again after some time',
            data: {},
          };
        } else if (false /**TODO: Error handling for the xml respnse should be done here */) {
        } else {
          const rpJsonBody = jsonResp['Envelope']['Body']['checkTransactionResponse'];
          const createInstanceObj = {
            ...zantelTransactionDetails.data,
            Operations: {
              requestType: 'queryZantelTransactionFunction',
              amount: rpJsonBody['TransactionDetails'].amount,
              requestObject: rpObj,
              responseObject: rpJsonBody['TransactionDetails'],
              timestamp: Utils.fetchCurrentTimestamp(),
            },
          };
          const rabbitMQProducerObj: any = {
            createTransactionInstance: createInstanceObj,
          };
          zantelRabbitMq.sendToQueue(
            JSON.stringify(rabbitMQProducerObj),
            this.zantelTransactionConstant['queueRoutingKey'],
          );
          return {
            messageCode: ResponseMappings['SUCCESS'],
            success: true,
            statusCode: 200,
            msg: rpJsonBody.StatusDescription || 'Transaction successfully initiated',
            data: {
              transactionDetails: rpJsonBody['TransactionDetails'],
            },
          };
        }
      }
    } catch (error) {
      log.error('---queryZantelTransactionFunction_CATCH_ERROR---', error);
      return {
        messageCode: ResponseMappings['SERVICE_UNAVAILABLE'],
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error,\nPlease try again after some time',
        data: error.data || {},
      };
    }
  }

  async ussdPushCallbackFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body } = request;
    try {
      const zantelTransactionReq: any = { ...body.REQUEST };
      const paymentPartnerFilter = {
        where: {
          PartnerCode: zantelTransactionReq?.ADDDATA,
          Status: STATUS.ACTIVE,
        },
        include: [
          {
            relation: 'payment_vendor',
          },
        ],
      };
      const zanTelTransactionFilter: Filter = {
        where: {
          ReferenceID: zantelTransactionReq?.PAYMENTCODE,
          Status: STATUS.PENDING,
        },
      };
      const callGatewayOptions = {
        apiName: 'fetchTransaction',
        body: { ...zanTelTransactionFilter },
      };
      const [zantelTransactionError, zantelTransactionDetails] = await Utils.executePromise(
        this.zantelGatewayParams.callGateway(callGatewayOptions),
      );
      if (
        zantelTransactionError ||
        !(zantelTransactionDetails.success || zantelTransactionDetails?.data?.zantelTransaction)
      ) {
        log.error('---zantelTransactionError---', zantelTransactionError);
        return {
          responseType: RESPONSE_TYPE['ERROR'],
          REQUESTID: body?.REQUEST?.REQUESTID,
          ReferenceID: zantelTransactionReq.PAYMENTCODE,
          REQUESTTIME: moment().format('YYYYMMDDHHmmss'),
        };
      }
      const paymentPartnerDetails: any = await this.paymentPartnerRepository.findOne(
        paymentPartnerFilter,
      );
      if (paymentPartnerDetails?.PaymentPartnerID) {
        const queueDetails: any = {
          zantelTransactionReq,
          zantelTransactionDetails,
          paymentPartnerDetails,
        };
        zantelRabbitMq.sendToQueue(
          JSON.stringify(queueDetails),
          this.zantelTransactionConstant['ussdPushCallbackQueueRoutingKey'],
        );
        log.info('---paymentPartnerDetails---');
        return {
          responseType: RESPONSE_TYPE['SUCCESS'],
          REQUESTID: body?.REQUEST?.REQUESTID,
          ReferenceID: zantelTransactionReq.PAYMENTCODE,
          REQUESTTIME: moment().format('YYYYMMDDHHmmss'),
        };
      } else {
        log.info('---no.payment.partner.found---');
        return {
          responseType: RESPONSE_TYPE['ERROR'],
          REQUESTID: body?.REQUEST?.REQUESTID,
          ReferenceID: zantelTransactionReq.PAYMENTCODE,
          REQUESTTIME: moment().format('YYYYMMDDHHmmss'),
        };
      }
    } catch (error) {
      log.error('---processZantelTransactionRequestFunction.catch.error---', error);
      return {
        responseType: RESPONSE_TYPE['ERROR'],
        REQUESTID: body?.REQUEST?.REQUESTID,
        ReferenceID: body?.REQUEST?.PAYMENTCODE,
        REQUESTTIME: moment().format('YYYYMMDDHHmmss'),
      };
    }
  }

  async processZantelTransactionRequestFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body } = request;
    try {
      const zantelTransactionReq: any = { ...body.REQUEST };
      const paymentPartnerFilter = {
        where: {
          PartnerCode: zantelTransactionReq?.ADDDATA,
          Status: STATUS.ACTIVE,
        },
        include: [
          {
            relation: 'payment_vendor',
          },
        ],
      };
      const paymentPartnerDetails: any = await this.paymentPartnerRepository.findOne(
        paymentPartnerFilter,
      );
      if (paymentPartnerDetails) {
        log.info('---paymentPartnerDetails---');
        const operationsObj: any = {
          operation: 'processZantelTransactionRequest',
          requestBody: body,
          responseBody: {},
        };
        const createZantelTransactionInstance: any = {
          ReferenceID: Utils.generateReferenceID(
            zantelTransactionReq.REQUESTID,
            zantelTransactionReq?.SENDER,
          ),
          IncomingReferenceID: zantelTransactionReq?.REQUESTID,
          ExternalReferenceID: zantelTransactionReq?.REQUESTID,
          CustomerReferenceID: zantelTransactionReq?.PaymentCode,
          SenderMsisdn: zantelTransactionReq?.SENDER,
          Amount: zantelTransactionReq?.Amount,
          PaymentVendorID: paymentPartnerDetails.PaymentVendorID,
          IncomingRequestType: SERVICE_TYPE.USSD_NORMAL,
          Operations: [operationsObj],
        };
        let userFound = null;
        if (
          paymentPartnerDetails &&
          this.zantelTransactionConstant.AZAMTV_CONSTANT_SPID.indexOf(
            paymentPartnerDetails.CollectionAccountNumber,
          ) > -1
        ) {
          zantelTransactionReq.senderMsisdn = zantelTransactionReq?.PaymentCode;
          userFound = await this.paymentVendorController.checkUserForAzamTV(zantelTransactionReq);
          createZantelTransactionInstance.Operations.push({
            operation: ApiList['CHECK_AZAM_TV_REQUEST'],
            Status: STATUS.SUCCESS,
            requestBody: userFound.requestBody,
            responseBody: userFound.responseBody,
          });
        } else {
          const connectedAppsObj: any = {
            routeInfo: paymentPartnerDetails.payment_vendor,
            request: {
              operator: 'Zantel',
              ReferenceID: createZantelTransactionInstance?.ReferenceID,
              utilityref: paymentPartnerDetails?.PaymentCode,
              Amount: zantelTransactionReq?.Amount,
              TXNID: zantelTransactionReq?.REQUESTID,
              MSISDN: zantelTransactionReq?.SENDER,
            },
          };
          userFound = await this.paymentVendorController.checkUserForConnectedApp(connectedAppsObj);
          createZantelTransactionInstance.Operations.push({
            operation: 'CheckForConnectedApp',
            Status: STATUS.SUCCESS,
            requestBody: userFound.requestBody,
            responseBody: userFound.responseBody,
          });
        }
        log.info('---processZantelTransactionRequestFunction.userFound---');
        if (!userFound || (userFound && !userFound.success)) {
          log.info('Not Duplicate');
          createZantelTransactionInstance.Status = STATUS.FAILURE;
          operationsObj.Status = createZantelTransactionInstance.Status;
          const rabbitMQProducerObj: any = {
            createTransactionInstance: createZantelTransactionInstance,
          };
          zantelRabbitMq.sendToQueue(
            JSON.stringify(rabbitMQProducerObj),
            this.zantelTransactionConstant['queueRoutingKey'],
          );
          return {
            responseType: RESPONSE_TYPE['ERROR'],
            REQUESTID: body?.REQUEST?.REQUESTID,
            ReferenceID: zantelTransactionReq?.ReferenceID,
            REQUESTTIME: moment().format('YYYYMMDDHHmmss'),
          };
        } else if (userFound?.isFromMQ) {
          const mqPaymentObject = {
            routeInfo: paymentPartnerDetails,
            request: {
              operator: paymentGateways.ZANTEL,
              smartCardNo: zantelTransactionReq?.PaymentCode,
              SenderMsisdn: zantelTransactionReq?.SENDER,
              amount: zantelTransactionReq?.Amount,
              reciptNo: zantelTransactionReq?.REQUESTID,
              referenceNo: createZantelTransactionInstance.ReferenceID,
            },
          };
          const makePayment = await this.paymentVendorController.paymentMQServices(mqPaymentObject);
          if (!makePayment.success) {
            log.info('---!makePayment.success---');
            createZantelTransactionInstance.Status = STATUS.FAILURE;
            operationsObj.Status = createZantelTransactionInstance.Status;
            createZantelTransactionInstance.Operations.push({
              operation: ApiList['PAYMENT_BY_MQ_SERVICE'],
              Status: STATUS.SUCCESS,
              requestBody: makePayment.requestBody,
              responseBody: makePayment.responseBody,
            });

            const rabbitMQProducerObj: any = {
              createTransactionInstance: createZantelTransactionInstance,
            };
            zantelRabbitMq.sendToQueue(
              JSON.stringify(rabbitMQProducerObj),
              this.zantelTransactionConstant['queueRoutingKey'],
            );

            return {
              responseType: RESPONSE_TYPE['ERROR'],
              REQUESTID: body?.REQUEST?.REQUESTID,
              ReferenceID: createZantelTransactionInstance?.ReferenceID,
              REQUESTTIME: moment().format('YYYYMMDDHHmmss'),
            };
          } else {
            createZantelTransactionInstance.Status = STATUS.COMPLETED;
            operationsObj.Status = createZantelTransactionInstance.Status;
            createZantelTransactionInstance.Operations.push({
              operation: ApiList['PAYMENT_BY_MQ_SERVICE'],
              Status: STATUS.SUCCESS,
              requestBody: makePayment.requestBody,
              responseBody: makePayment.responseBody,
            });

            const rabbitMQProducerObj: any = {
              createTransactionInstance: createZantelTransactionInstance,
            };
            zantelRabbitMq.sendToQueue(
              JSON.stringify(rabbitMQProducerObj),
              this.zantelTransactionConstant['queueRoutingKey'],
            );

            return {
              responseType: RESPONSE_TYPE['SUCCESS'],
              REQUESTID: body?.REQUEST?.REQUESTID,
              ReferenceID: createZantelTransactionInstance?.ReferenceID,
              REQUESTTIME: moment().format('YYYYMMDDHHmmss'),
            };
          }
        } else {
          const makePaymentObj = {
            routeDetails: paymentPartnerDetails.payment_vendor,
            request: {
              TransactionStatus: 'success',
              Message: 'Payment successful',
              Operator: 'Zantel',
              ReferenceID: createZantelTransactionInstance?.ReferenceID,
              ExternalReferenceID: createZantelTransactionInstance?.ExternalReferenceID,
              UtilityReference: paymentPartnerDetails?.PaymentCode,
              Amount: zantelTransactionReq?.Amount,
              TansactionID: zantelTransactionReq?.REQUESTID,
              Msisdn: zantelTransactionReq?.SENDER,
            },
          };

          const paymentRes = await this.paymentVendorController.payUserForConnectedApp(
            makePaymentObj,
          );
          if (!paymentRes.success) {
            createZantelTransactionInstance.Status = STATUS.FAILURE;
            operationsObj.Status = createZantelTransactionInstance.Status;
            createZantelTransactionInstance.Operations.push({
              operation: ApiList['PAYMENT_BY_MQ_SERVICE'],
              Status: operationsObj.Status,
              requestBody: paymentRes.requestBody,
              responseBody: paymentRes.responseBody,
            });
          } else {
            createZantelTransactionInstance.Status = STATUS.COMPLETED;
            operationsObj.Status = createZantelTransactionInstance.Status;
            createZantelTransactionInstance.Operations.push({
              operation: ApiList['PAYMENT_BY_MQ_SERVICE'],
              Status: operationsObj.Status,
              requestBody: paymentRes.requestBody,
              responseBody: paymentRes.responseBody,
            });
          }

          const rabbitMQProducerObj: any = {
            createTransactionInstance: createZantelTransactionInstance,
          };
          zantelRabbitMq.sendToQueue(
            JSON.stringify(rabbitMQProducerObj),
            this.zantelTransactionConstant['queueRoutingKey'],
          );
          return {
            responseType: RESPONSE_TYPE['SUCCESS'],
            REQUESTID: body?.REQUEST?.REQUESTID,
            ReferenceID: createZantelTransactionInstance?.ReferenceID,
            REQUESTTIME: moment().format('YYYYMMDDHHmmss'),
          };
        }
      } else {
        return {
          responseType: RESPONSE_TYPE['ERROR'],
          REQUESTID: body?.REQUEST?.REQUESTID,
          ReferenceID: body?.REQUEST?.CHECKSUM,
          REQUESTTIME: moment().format('YYYYMMDDHHmmss'),
        };
      }
    } catch (error) {
      log.error('---processZantelTransactionRequestFunction.catch.error---', error);
      return {
        responseType: RESPONSE_TYPE['ERROR'],
        REQUESTID: body?.REQUEST?.REQUESTID,
        ReferenceID: body?.REQUEST?.CHECKSUM,
        REQUESTTIME: moment().format('YYYYMMDDHHmmss'),
      };
    }
  }

  async fetchMultipleTransactions(request: any): Promise<any> {
    const callGatewayOptions: any = {
      apiName: 'fetchMultipleTransactions',
      body: { ...request },
    };
    const [transactionsError, transactionsResult]: any[] = await Utils.executePromise(
      this.zantelGatewayParams.callGateway(callGatewayOptions),
    );
    if (transactionsError || !(transactionsResult?.success || transactionsResult?.data)) {
      log.error('---fetchMultipleTransactions.transactionsError---', transactionsError);
      return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
    }
    log.info('---fetchMultipleTransactions.transactionsResult---');
    return {
      ...transactionsResult,
      messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
    };
  }

  async fetchTransactionsCount(request: any): Promise<any> {
    const callGatewayOptions: any = {
      apiName: 'fetchTransactionsCount',
      body: { ...request },
    };
    const [countError, transactionsCount]: any[] = await Utils.executePromise(
      this.zantelGatewayParams.callGateway(callGatewayOptions),
    );
    if (countError || !(transactionsCount?.success || transactionsCount?.data)) {
      log.error('---fetchTransactionsCount.countError---', countError);
      return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
    }
    log.info('---fetchTransactionsCount.transactionsCount---');
    return {
      ...transactionsCount,
      messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
    };
  }

  async fetchZantelTransactionDetails(query: any): Promise<any> {
    let count: number = Utils.fetchSkipFilter({
      skip: parseInt(query.skip),
      limit: parseInt(query.limit),
    });
    const zantelResponse: InterfaceList.TransactionResponseInstance = {
      totalCount: 0,
      transactions: [],
    };
    let callRequestOptions: any = {
      apiPath: ApiList['FETCH_ZANTEL_TRANSACTIONS'],
      body: {
        where: {
          ...Utils.fetchTimestampFilter(query),
          PaymentVendorID: query.PaymentVendorID,
          Amount: query?.Amount ? query.Amount : undefined,
          Status: query?.Status ? query.Status : undefined,
          SenderMsisdn: query?.SenderMsisdn ? { like: `%${query.SenderMsisdn}%` } : undefined,
          IncomingRequestType: query?.IncomingRequestType ? query.IncomingRequestType : undefined,
          CreatedAt: query?.Time ? { like: `%${query.Time}%` } : undefined,
          ReferenceID: query?.ReferenceID ? { like: `%${query.ReferenceID}%` } : undefined,
          ExternalReferenceID: query?.ExternalReferenceID
            ? { like: `%${query.ExternalReferenceID}%` }
            : undefined,
          CustomerReferenceID: query?.ReferenceMsisdn
            ? { like: `%${query.ReferenceMsisdn}%` }
            : undefined,
        },
        fields: query.fields,
        order: query?.order
          ? query?.order == 'Time'
            ? 'CreatedAt DESC'
            : query?.order == 'ReferenceMsisdn'
            ? 'CustomerReferenceID DESC'
            : `${query?.order} DESC`
          : 'CreatedAt DESC',
        skip: !query?.skipPagination
          ? Utils.fetchSkipFilter({ skip: parseInt(query.skip), limit: parseInt(query.limit) })
          : undefined,
        limit: !query?.skipPagination ? parseInt(query.limit) : undefined,
      },
    };
    const [callRequestError, callRequestResult]: any[] = await Utils.executePromise(
      Utils.callRequest(callRequestOptions),
    );
    callRequestOptions = {
      apiPath: ApiList['FETCH_ZANTEL_TRANSACTIONS_COUNT'],
      body: {
        ...Utils.fetchTimestampFilter(query),
        PaymentVendorID: query.PaymentVendorID,
        Amount: query?.Amount ? query.Amount : undefined,
        Status: query?.Status ? query.Status : undefined,
        SenderMsisdn: query?.SenderMsisdn ? { like: `%${query.SenderMsisdn}%` } : undefined,
        ReferenceID: query?.ReferenceID ? { like: `%${query.ReferenceID}%` } : undefined,
        IncomingRequestType: query?.IncomingRequestType ? query.IncomingRequestType : undefined,
        CreatedAt: query?.Time ? { like: `%${query.Time}%` } : undefined,
        CustomerReferenceID: query?.ReferenceMsisdn
          ? { like: `%${query.ReferenceMsisdn}%` }
          : undefined,
        ExternalReferenceID: query?.ExternalReferenceID
          ? { like: `%${query.ExternalReferenceID}%` }
          : undefined,
      },
    };
    const [totalCountError, totalCount]: any[] = await Utils.executePromise(
      Utils.callRequest(callRequestOptions),
    );

    if (callRequestError || totalCountError) {
      log.error('---callRequestError---', callRequestError);
      log.error('---totalCountError---', totalCountError);
      return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
    } else if (
      !(callRequestResult?.success || callRequestResult?.data?.data?.zantelTransactions) ||
      !(totalCount?.success || totalCount?.data?.data?.zantelTransactions)
    ) {
      log.error(
        '---callRequestResult?.success || callRequestResult?.data?.data?.zantelTransactions---',
      );
      log.error('---totalCount?.success || totalCount?.data?.data?.zantelTransactions---');
      return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
    }

    zantelResponse.totalCount = totalCount?.data?.data?.zantelTransactions?.count;
    if (callRequestResult?.data?.data?.zantelTransactions?.length) {
      callRequestResult.data.data.zantelTransactions.forEach((val: any) => {
        if (val) {
          zantelResponse.transactions.push({
            SerialNo: ++count,
            ReferenceID: val.ReferenceID,
            ExternalReferenceID: val.ExternalReferenceID || val.IncomingReferenceID,
            SenderMsisdn: val.SenderMsisdn,
            ReferenceMsisdn: val.CustomerReferenceID,
            Amount: val.Amount,
            IncomingRequestType: val.IncomingRequestType,
            Status: val.Status,
            Date: Utils.fetchFormattedTimestamp({
              timestamp: val.CreatedAt || val.UpdatedAt,
              format: DateFormat,
            }),
            Time: Utils.fetchFormattedTimestamp({
              timestamp: val.CreatedAt || val.UpdatedAt,
              format: TimeFormat,
            }),
            Operations: val.Operations,
          });
        }
      });
    }
    log.info('---fetchZantelTransactionDetails.zantelResponse---');
    if (!Object.keys(zantelResponse).length) return false;
    return zantelResponse;
  }

  async fetchZantelTransactionsCount(query: any): Promise<any> {
    const filter: any = {
      apiPath: ApiList['FETCH_ZANTEL_TRANSACTIONS'],
      body: { ...query },
    };
    const [zantelError, zantelTransactions]: any[] = await Utils.executePromise(
      Utils.callRequest(filter),
    );
    if (zantelError) {
      log.error('---zantelError---');
      return false;
    } else if (
      !(zantelTransactions?.success || zantelTransactions?.data?.data?.zantelTransactions?.length)
    ) {
      log.info(
        '---!(zantelTransactions?.success || zantelTransactions?.data?.data?.zantelTransactions)---',
      );
      return false;
    }
    log.info('---zantelTransactions---');
    return zantelTransactions.data.data.zantelTransactions;
  }
}
