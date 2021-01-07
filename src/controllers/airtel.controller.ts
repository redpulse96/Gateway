/* eslint-disable no-invalid-this */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  NotificationTransactionsController,
  PaymentPartnerController,
  PaymentVendorController,
} from '.';
import { airtelDef } from '../api-specs/airtel-transactions';
import { api, GatewayInterface, inject, repository, Request, RestBindings, Utils } from '../common';
import {
  AirtelTransactionsConstants,
  ApiList,
  DateTimeFormats,
  infoBipConstant,
  InterfaceList,
  paymentGateways,
  ResponseMappings,
  RESPONSE_TYPE,
  SERVICE_TYPE,
  STATUS,
} from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { RabbitMqProducer } from '../queue';
import {
  NotificationTransactionsRepository,
  PaymentPartnerRepository,
  PaymentVendorRepository,
} from '../repositories';
const log = new LoggingInterceptor('airtel.Controller');
const { DateFormat, TimeFormat } = DateTimeFormats;
export const airtelRabbitMq = new RabbitMqProducer('gateway');
@api(airtelDef)
export class AirtelTransactions {
  constructor(
    @repository(PaymentVendorRepository)
    public paymentVendorRepository: PaymentVendorRepository,

    @repository(PaymentPartnerRepository)
    public paymentPartnerRepository: PaymentPartnerRepository,

    @repository(NotificationTransactionsRepository)
    private notificationsRepository: NotificationTransactionsRepository,
  ) {}
  private notificationTransactionsController: NotificationTransactionsController = new NotificationTransactionsController(
    this.notificationsRepository,
  );
  private infoBipConstant = new infoBipConstant();
  private airtelGatewayParams: GatewayInterface = new GatewayInterface(paymentGateways['AIRTEL']);
  private airtelTransactionsConstants = AirtelTransactionsConstants;
  private paymentVendorController: PaymentVendorController = new PaymentVendorController(
    this.paymentVendorRepository,
    this.paymentPartnerRepository,
  );
  private paymentPartnerController: PaymentPartnerController = new PaymentPartnerController(
    this.paymentPartnerRepository,
  );

  generateCommandObject(requestObj: any): any {
    const inputObj = {
      ...requestObj,
      REFERENCE_NO: Utils.generateReferenceID(requestObj.MSISDN),
      EXT_TRID: Utils.generateReferenceID(requestObj.MSISDN, requestObj.MSISDN2),
    };
    return inputObj;
  }

  generateIntegrationPartnerObject(requestObj: any): any {
    const IntegrationPartnerObj = {
      spId: requestObj.MSISDN2,
      timestamp: Utils.fetchCurrentTimestamp(),
    };
    return IntegrationPartnerObj;
  }

  // this is xml reuest to be hit by Airtel
  async airtelUssdPushCallbackFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body } = request;
    log.info('---airtelUssdPushCallbackFunction.body---');
    try {
      const callGatewayOptions: InterfaceList.GatewayFormats.fetchTransaction = {
        apiName: 'fetchTransaction',
        body: {
          where: {
            ExternalReferenceID: body.Command.ExternalReferenceID,
            STATUS: STATUS.PENDING,
          },
        },
      };
      const [callGatewayErr, callGatewayRes] = await Utils.executePromise(
        this.airtelGatewayParams.callGateway(callGatewayOptions),
      );
      if (callGatewayErr || !(callGatewayRes && callGatewayRes.success) || !callGatewayRes.data) {
        log.error('---callGatewayErr---', callGatewayErr);
        return {
          responseType: RESPONSE_TYPE.ERROR,
        };
      }
      log.info('---callGatewayRes---');
      const queueRequest: any = {
        request: {
          ...callGatewayRes?.data?.airtelTransaction,
          ...body,
        },
        routeInfo: callGatewayRes?.data?.airtelTransaction?.Content?.PaymentPartner,
      };
      airtelRabbitMq.sendToQueue(
        JSON.stringify(queueRequest),
        this.airtelTransactionsConstants['queueRoutingKey'],
      );
      return {
        responseType: RESPONSE_TYPE.SUCCESS,
      };
    } catch (error) {
      log.error('airtelTransactionUssdPushUpdatedFunction.catch.error', error);
      return {
        responseType: RESPONSE_TYPE.ERROR,
      };
    }
  }

  // this is a JSON request to be hit by an application
  async incomingApplicationFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body } = request;
    try {
      const paymentPartnerFilter: any = {
        where: {
          PartnerCode: body.PartnerCode,
          Status: STATUS.ACTIVE,
        },
        include: [
          {
            relation: 'payment_vendor',
          },
        ],
      };
      const [paymentPartnerErr, paymentPartnerRes]: any = await Utils.executePromise(
        this.paymentPartnerRepository.findOne(paymentPartnerFilter),
      );
      if (paymentPartnerErr || !paymentPartnerRes?.PaymentPartnerID) {
        log.error('---paymentPartnerErr---', paymentPartnerErr || paymentPartnerRes);
        return {
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          data: paymentPartnerErr?.data ? paymentPartnerErr?.data : {},
        };
      }
      log.info('---paymentPartnerRes---');
      const callRequestOptions: any = {
        apiPath: ApiList['AIRTEL_CALLBACK'],
        body: {
          CustomerMsisdn: body.CustomerMsisdn,
          MSISDN2: paymentPartnerRes.CollectionAccountNumber,
          InterfaceName: paymentPartnerRes.PaymentPartnerName,
          Amount: body.Amount,
          ReferenceID: Utils.generateReferenceID(body.CustomerMsisdn, body.Amount),
          ExternalReferenceID: Utils.generateReferenceID(
            ApiList['AIRTEL_CALLBACK'],
            body.CustomerMsisdn,
            body?.ReferenceMsisdn,
            body.Amount,
          ),
        },
      };
      const operationsObj: any = {
        operation: ApiList['AIRTEL_CALLBACK'],
        Status: STATUS.PENDING,
      };
      const callGatewayOptions: InterfaceList.GatewayFormats.addTransaction = {
        apiName: 'addTransaction',
        body: {
          ReferenceID: callRequestOptions.body.ReferenceID,
          ExternalReferenceID: callRequestOptions.body.ExternalReferenceID,
          PaymentVendorID: paymentPartnerRes.PaymentVendorID,
          SenderMsisdn: callRequestOptions?.body?.CustomerMsisdn,
          ReferenceMsisdn: body?.ReferenceMsisdn,
          IncomingRequestType: SERVICE_TYPE.USSD_PUSH,
          Amount: body.Amount,
          Operations: [],
          Content: {
            Command: {
              MSISDN: callRequestOptions?.body?.CustomerMsisdn,
              REFERENCEMSISDN: body?.ReferenceMsisdn,
              MSISDN2: paymentPartnerRes?.CollectionAccountNumber,
              TransID: callRequestOptions?.body?.ExternalReferenceID,
              AMOUNT: callRequestOptions?.body?.Amount,
            },
            PaymentPartner: paymentPartnerRes,
          },
          Status: STATUS.PENDING,
        },
      };
      const [callRequestErr, callRequestRes]: any = await Utils.executePromise(
        Utils.callRequest(callRequestOptions),
      );
      if (callRequestErr) {
        log.error('---callRequestErr---', callRequestErr);
        operationsObj.requestBody = callRequestErr?.requestBody || {};
        operationsObj.responseBody = callRequestErr?.responseBody || {};
        callGatewayOptions.body.Status = STATUS.FAILURE;
      } else {
        log.info('---callRequestRes---');
        operationsObj.requestBody = callRequestRes?.requestBody || {};
        operationsObj.responseBody = callRequestRes?.responseBody || {};
      }
      callGatewayOptions.body.Operations.push(operationsObj);

      const [callGatewayErr]: any = await Utils.executePromise(
        this.airtelGatewayParams.callGateway(callGatewayOptions),
      );
      if (callGatewayErr) {
        log.error('---callGatewayErr---', callGatewayErr);
        return {
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          data: callGatewayErr?.data || {},
        };
      }
      log.info('---callGatewayRes---');

      return {
        messageCode: ResponseMappings['SUCCESS'],
        data: {
          ReferenceID: callRequestOptions.body.ReferenceID,
          ExternalReferenceID: callRequestOptions.body.ExternalReferenceID,
        },
      };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  async processAirtelTransactionForNormalApi(airtelTransactionRequestObj: any): Promise<any> {
    try {
      log.info('---airtelTransactionRequestObj---');
      const gatewayOptions: any = {
        ...airtelTransactionRequestObj,
        Operations: [],
      };
      const paymentPartnerFilter = {
        where: {
          CollectionAccountNumber: airtelTransactionRequestObj?.Content?.IntegrationPartner?.spId,
          Username: airtelTransactionRequestObj?.Content?.RequestToken?.APIusername,
          Password: airtelTransactionRequestObj?.Content?.RequestToken?.APIPassword,
          Status: STATUS.ACTIVE,
        },
        include: [
          {
            relation: 'payment_vendor',
          },
        ],
      };
      const paymentPartnerResult = await this.paymentPartnerRepository.findOne(
        paymentPartnerFilter,
      );
      if (!paymentPartnerResult) {
        log.error('---paymentPartnerError---');
        gatewayOptions.Status = STATUS.FAILURE;
        return {
          apiPath: ApiList['AIRTEL_ERROR_RESPONSE'],
          body: {
            TYPE: 'failure',
            TXNSTATUS: 500,
            MESSAGE: 'Internal server error',
          },
        };
      } else {
        log.info('---paymentPartnerResult---');
        let userFound = null;
        if (
          paymentPartnerResult &&
          this.airtelTransactionsConstants.AZAMTV_CONSTANT_SPID.indexOf(
            paymentPartnerResult.CollectionAccountNumber,
          ) > -1
        ) {
          airtelTransactionRequestObj.senderMsisdn =
            airtelTransactionRequestObj?.Content?.RequestToken?.ReferenceField;
          userFound = await this.paymentVendorController.checkUserForAzamTV(
            airtelTransactionRequestObj,
          );
        } else {
          const connectedAppsObj: InterfaceList.CheckUserForConnectedAppInterface = {
            routeInfo: paymentPartnerResult.payment_vendor,
            request: {
              operator: 'Airtel',
              ReferenceID: airtelTransactionRequestObj?.ReferenceID,
              utilityref: airtelTransactionRequestObj?.Content?.RequestToken?.Msisdn,
              Amount: airtelTransactionRequestObj?.Content?.RequestToken?.Amount,
              TXNID: airtelTransactionRequestObj?.Content?.RequestToken?.TransID,
              MSISDN: airtelTransactionRequestObj?.Content?.RequestToken?.ReferenceField,
            },
          };
          userFound = await this.paymentVendorController.checkUserForConnectedApp(connectedAppsObj);
        }
        if (!userFound || (userFound && !userFound.success)) {
          log.info('Not Duplicate');
          this.notificationTransactionsController.callNotificationTransactions({
            MobileNumber: airtelTransactionRequestObj?.Content?.RequestToken?.ReferenceField,
            Text: this.infoBipConstant.MESSAGES['TEST_OTP'],
          });

          gatewayOptions.Status = STATUS.FAILURE;
          const callAirtelPushApiOptions: InterfaceList.GatewayFormats.addTransaction = {
            apiName: 'addTransaction',
            body: {
              ...gatewayOptions,
              Operations: [
                {
                  operation: 'AirtelUssdNormal',
                  request: { ...airtelTransactionRequestObj },
                },
              ],
            },
          };
          const [callGatewayErr, callGatewayRes]: any[] = await Utils.executePromise(
            this.airtelGatewayParams.callGateway(callAirtelPushApiOptions),
          );
          if (callGatewayErr) {
            log.error('---callGatewayErr---', callGatewayErr);
            return {
              success: false,
              message: 'Internal server error',
              statusCode: 500,
              data: {},
            };
          }
          log.info('---callGatewayRes---');
          return {
            success: true,
            statusCode: 200,
            message: 'Transaction successfully executed',
            data: callGatewayRes,
          };
        } else if (userFound?.isFromMQ) {
          const mqPaymentObject = {
            routeInfo: paymentPartnerResult,
            request: {
              operator: paymentGateways.AIRTEL,
              smartCardNo: airtelTransactionRequestObj?.Content?.RequestToken?.ReferenceField,
              SenderMsisdn: Utils.returnDisplayingMsisdn(airtelTransactionRequestObj.SenderMsisdn),
              amount: airtelTransactionRequestObj?.Content?.RequestToken?.Amount,
              reciptNo: airtelTransactionRequestObj.ReferenceID,
              referenceNo: airtelTransactionRequestObj.ReferenceID,
            },
          };
          await this.paymentVendorController
            .paymentMQServices(mqPaymentObject)
            .then((mqPayRes: any) => {
              log.info('---mqPayRes---');
              if (mqPayRes.success) {
                gatewayOptions.Status = STATUS.COMPLETED;
                gatewayOptions.Operations.push({
                  operation: ApiList['PAYMENT_BY_MQ_SERVICE'],
                  requestBody: mqPayRes.requestBody,
                  responseBody: mqPayRes.responseBody,
                  Status: gatewayOptions.Status,
                });
              } else {
                gatewayOptions.Status = STATUS.FAILURE;
                gatewayOptions.Operations.push({
                  operation: ApiList['PAYMENT_BY_MQ_SERVICE'],
                  requestBody: mqPayRes.requestBody,
                  responseBody: mqPayRes.responseBody,
                  Status: gatewayOptions.Status,
                });
              }
            })
            .catch((mqPayErr: any) => {
              log.info('---mqPayErr---', mqPayErr);
              gatewayOptions.Status = STATUS.FAILURE;
              gatewayOptions.Operations.push({
                operation: ApiList['PAYMENT_BY_MQ_SERVICE'],
                requestBody: mqPayErr.requestBody,
                responseBody: mqPayErr.responseBody,
                Status: gatewayOptions.Status,
              });
            });
        } else {
          const makePaymentObj = {
            routeDetails: paymentPartnerResult.payment_vendor,
            request: {
              TransactionStatus: 'success',
              Message: 'Payment successful',
              Operator: 'Airtel',
              ReferenceID: airtelTransactionRequestObj?.ReferenceID,
              ExternalReferenceID: airtelTransactionRequestObj?.ExternalReferenceID,
              UtilityReference: airtelTransactionRequestObj?.Content?.RequestToken.ReferenceField,
              Amount: airtelTransactionRequestObj?.Content?.RequestToken.Amount,
              TansactionID: airtelTransactionRequestObj?.Content?.RequestToken?.TransID,
              Msisdn: airtelTransactionRequestObj?.Content?.RequestToken?.Msisdn,
            },
          };
          await this.paymentVendorController
            .payUserForConnectedApp(makePaymentObj)
            .then((payRes: any) => {
              log.info('---payRes---');
              if (payRes.success) {
                gatewayOptions.Status = STATUS.COMPLETED;
                gatewayOptions.Operations.push({
                  operation: 'payUserForConnectedApp',
                  requestBody: payRes.requestBody,
                  responseBody: payRes.responseBody,
                  Status: gatewayOptions.Status,
                });
              } else {
                gatewayOptions.Status = STATUS.FAILURE;
                gatewayOptions.Operations.push({
                  operation: 'payUserForConnectedApp',
                  requestBody: payRes.requestBody,
                  responseBody: payRes.responseBody,
                  Status: gatewayOptions.Status,
                });
              }
            })
            .catch((payErr: any) => {
              log.error('---payErr---', payErr);
              gatewayOptions.Status = STATUS.FAILURE;
              gatewayOptions.Operations.push({
                operation: 'payUserForConnectedApp',
                requestBody: payErr.requestBody,
                responseBody: payErr.responseBody,
                Status: gatewayOptions.Status,
              });
            });
        }
        const callAirtelPushApiOptions: InterfaceList.GatewayFormats.updateTransaction = {
          apiName: 'updateTransaction',
          body: {
            UpdateFilter: {
              ReferenceID: gatewayOptions.ReferenceID,
            },
            UpdateAttributes: { ...gatewayOptions },
          },
        };
        const [callGatewayErr, callGatewayRes]: any[] = await Utils.executePromise(
          this.airtelGatewayParams.callGateway(callAirtelPushApiOptions),
        );
        if (callGatewayErr) {
          log.error('---callGatewayErr---', callGatewayErr);
          return {
            success: false,
            message: 'Internal server error',
            statusCode: 500,
            data: {},
          };
        }
        log.info('---callGatewayRes---');
        return {
          success: true,
          statusCode: 200,
          message: 'Transaction successfully executed',
          data: callGatewayRes,
        };
      }
    } catch (error) {
      log.error('---processAirtelTransactionForNormalApi_ERROR---', error);
      this.notificationTransactionsController.callNotificationTransactions({
        MobileNumber: airtelTransactionRequestObj?.Content?.RequestToken?.ReferenceField,
        Text: this.infoBipConstant.MESSAGES['TEST_OTP'],
      });
      return {
        apiPath: ApiList['AIRTEL_ERROR_RESPONSE'],
        body: {
          TYPE: 'failure',
          TXNSTATUS: 500,
          MESSAGE: 'Internal server error',
        },
      };
    }
  }

  async callAirtelNormalUssdApi(airtelTransactionNormalPushObj: any): Promise<any> {
    try {
      log.info('---airtelTransactionNormalPushObj--');
      airtelTransactionNormalPushObj.MSISDN2 =
        airtelTransactionNormalPushObj.RequestToken.utilitycode;

      const cmd: any = this.generateCommandObject(airtelTransactionNormalPushObj);
      const integrationPartner: any = this.generateIntegrationPartnerObject({
        ...airtelTransactionNormalPushObj,
        MSISDN2: airtelTransactionNormalPushObj.RequestToken.utilitycode,
      });
      const finalResponse: any = {
        Status: STATUS.PENDING,
        IncomingRequestType: SERVICE_TYPE.USSD_NORMAL,
        ReferenceID: cmd.REFERENCE_NO,
        ExternalReferenceID: cmd.EXT_TRID,
        SenderMsisdn: airtelTransactionNormalPushObj?.RequestToken?.Msisdn,
        ReferenceMsisdn: airtelTransactionNormalPushObj?.RequestToken?.ReferenceField,
        Amount: airtelTransactionNormalPushObj.RequestToken.Amount,
        Content: {
          RequestToken: {
            ...airtelTransactionNormalPushObj.RequestToken,
            MSISDN2: airtelTransactionNormalPushObj?.RequestToken?.ReferenceField,
            Msisdn: airtelTransactionNormalPushObj?.RequestToken?.Msisdn,
          },
          IntegrationPartner: integrationPartner,
        },
      };
      const callAirtelPushApiOptions: InterfaceList.GatewayFormats.addTransaction = {
        apiName: 'addTransaction',
        body: finalResponse,
      };
      log.info('---callAirtelPushApiOptions---');
      await this.airtelGatewayParams.callGateway(callAirtelPushApiOptions);
      return await this.processAirtelTransactionForNormalApi(finalResponse);
    } catch (error) {
      log.error('---callAirtelNormalUssdApi_CATCH_ERROR---', error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        data: error.data || {},
      };
    }
  }

  async airtelTransactionUssdPushFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    try {
      const { body } = request;
      const airtelTransactionData = body;
      return await this.callAirtelNormalUssdApi(airtelTransactionData)
        .then((callAirtelNormalUssdApiResult: any) => {
          log.info('---callAirtelNormalUssdApiResult---');
          return {
            responseType: RESPONSE_TYPE['SUCCESS'],
            TransID: airtelTransactionData.RequestToken.TransID,
            Amount: airtelTransactionData.RequestToken.Amount,
            ReferenceField: airtelTransactionData.RequestToken.ReferenceField,
            Msisdn: airtelTransactionData.RequestToken.Msisdn,
            Message: 'Payment Posted Successfully',
          };
        })
        .catch((callAirtelNormalUssdApiError: any) => {
          log.error('---callAirtelNormalUssdApiError---', callAirtelNormalUssdApiError);
          return {
            responseType: RESPONSE_TYPE['ERROR'],
            TransID: airtelTransactionData.RequestToken.TransID,
            Amount: airtelTransactionData.RequestToken.Amount,
            ReferenceField: airtelTransactionData.RequestToken.ReferenceField,
            Msisdn: airtelTransactionData.RequestToken.Msisdn,
            Message: 'Internal server error',
          };
        });
    } catch (error) {
      log.error('---airtelTransactionUssdPushFunction_CATCH_ERROR---', error);
      return {
        responseType: RESPONSE_TYPE['ERROR'],
        TransID: null,
        Amount: null,
        ReferenceField: null,
        Msisdn: null,
        Message: 'Internal server error',
      };
    }
  }

  async fetchMultipleTransactions(request: any): Promise<any> {
    const callGatewayOptions: InterfaceList.GatewayFormats.fetchMultipleTransactions = {
      apiName: 'fetchMultipleTransactions',
      body: { ...request },
    };
    const [transactionsError, transactionsResult]: any[] = await Utils.executePromise(
      this.airtelGatewayParams.callGateway(callGatewayOptions),
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
    const callGatewayOptions: InterfaceList.GatewayFormats.fetchTransactionsCount = {
      apiName: 'fetchTransactionsCount',
      body: { ...request },
    };
    const [countError, transactionsCount]: any[] = await Utils.executePromise(
      this.airtelGatewayParams.callGateway(callGatewayOptions),
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

  async fetchAirtelTransactionDetails(query: any): Promise<any> {
    let count: number = Utils.fetchSkipFilter({
      skip: parseInt(query.skip),
      limit: parseInt(query.limit),
    });
    const airtelResponse: InterfaceList.TransactionResponseInstance = {
      totalCount: 0,
      transactions: [],
    };
    let callRequestOptions: any = {
      apiPath: ApiList['FETCH_AIRTEL_TRANSACTIONS'],
      body: {
        where: {
          ...Utils.fetchTimestampFilter(query),
          PaymentVendorID: query.PaymentVendorID,
          Amount: query?.Amount ? query.Amount : undefined,
          Status: query?.Status ? query.Status : undefined,
          SenderMsisdn: query?.SenderMsisdn ? { like: `%${query.SenderMsisdn}%` } : undefined,
          ReferenceID: query?.ReferenceID ? { like: `%${query.ReferenceID}%` } : undefined,
          IncomingRequestType: query?.IncomingRequestType ? query.IncomingRequestType : undefined,
          CreatedAt: query?.Time ? { like: `%${query.Time}%` } : undefined,
          ReferenceMsisdn: query?.ReferenceMsisdn
            ? { like: `%${query.ReferenceMsisdn}%` }
            : undefined,
          ExternalReferenceID: query?.ExternalReferenceID
            ? { like: `%${query.ExternalReferenceID}%` }
            : undefined,
        },
        order: query?.order
          ? query?.order == 'Time'
            ? 'CreatedAt DESC'
            : `${query?.order} DESC`
          : 'CreatedAt DESC',
        fields: query.fields,
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
      apiPath: ApiList['FETCH_AIRTEL_TRANSACTIONS_COUNT'],
      body: {
        ...Utils.fetchTimestampFilter(query),
        PaymentVendorID: query.PaymentVendorID,
        Amount: query?.Amount ? query.Amount : undefined,
        Status: query?.Status ? query.Status : undefined,
        SenderMsisdn: query?.SenderMsisdn ? { like: `%${query.SenderMsisdn}%` } : undefined,
        ReferenceID: query?.ReferenceID ? { like: `%${query.ReferenceID}%` } : undefined,
        IncomingRequestType: query?.IncomingRequestType ? query.IncomingRequestType : undefined,
        CreatedAt: query?.Time ? { like: `%${query.Time}%` } : undefined,
        ReferenceMsisdn: query?.ReferenceMsisdn
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

    if (
      callRequestError ||
      totalCountError ||
      !(callRequestResult?.success || callRequestResult?.data?.data?.airtelTransactions?.length) ||
      !(totalCount?.success || totalCount?.data?.data?.airtelTransactions)
    ) {
      log.info('---callRequestError---', callRequestError);
      log.info('---totalCountError---', totalCountError);
      return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
    }
    log.info('---callRequestResult---');

    airtelResponse.totalCount = totalCount?.data?.data?.airtelTransactions?.count;
    if (callRequestResult?.data?.data?.airtelTransactions?.length) {
      callRequestResult.data.data.airtelTransactions.forEach((val: any) => {
        airtelResponse.transactions.push({
          SerialNo: ++count,
          ReferenceID: val.ReferenceID,
          ExternalReferenceID: val.ExternalReferenceID,
          IncomingRequestType: val.IncomingRequestType,
          Amount: val?.Amount,
          Status: val.Status,
          Operations: val.Operations,
          Date: Utils.fetchFormattedTimestamp({
            timestamp: val?.CreatedAt || val?.UpdatedAt,
            format: DateFormat,
          }),
          Time: Utils.fetchFormattedTimestamp({
            timestamp: val?.CreatedAt || val?.UpdatedAt,
            format: TimeFormat,
          }),

          SenderMsisdn:
            Utils.returnDisplayingMsisdn(val?.SenderMsisdn) ||
            Utils.returnDisplayingMsisdn(val?.Content?.Command?.MSISDN) ||
            Utils.returnDisplayingMsisdn(val?.Content?.RequestToken?.MSISDN) ||
            null,

          ReferenceMsisdn:
            Utils.returnDisplayingMsisdn(val?.ReferenceMsisdn) ||
            Utils.returnDisplayingMsisdn(val?.Content?.Command?.REFERENCEMSISDN) ||
            Utils.returnDisplayingMsisdn(val?.Content?.RequestToken?.MSISDN) ||
            null,
        });
      });
    }
    log.info('---fetchAirtelTransactionDetails.airtelResponse---');
    if (!airtelResponse.totalCount || !airtelResponse?.transactions?.length) return false;
    return airtelResponse;
  }

  async fetchAirtelTransactionsCount(query: any): Promise<any> {
    const filter: any = {
      apiPath: ApiList['FETCH_AIRTEL_TRANSACTIONS'],
      body: { ...query },
    };
    const [airtelError, airtelTransactions]: any[] = await Utils.executePromise(
      Utils.callRequest(filter),
    );
    if (airtelError) {
      log.error('---airtelError---', airtelError);
      return false;
    } else if (
      !(airtelTransactions?.success || airtelTransactions?.data?.data?.airtelTransactions?.length)
    ) {
      log.info(
        '---!(airtelTransactions?.success || airtelTransactions?.data?.data?.airtelTransactions)---',
      );
      return false;
    }
    log.info('---airtelTransactions---');
    return airtelTransactions.data.data.airtelTransactions;
  }
}
