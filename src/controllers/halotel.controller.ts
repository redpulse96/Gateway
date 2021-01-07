/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
import { PaymentVendorController } from '.';
import { halotelDef } from '../api-specs/halotel-transactions';
import {
  api,
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
  HalotelTransactionConstant,
  InterfaceList,
  paymentGateways,
  ResponseMappings,
  RESPONSE_TYPE,
  SERVICE_TYPE,
  STATUS,
} from '../constants/';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { RabbitMqProducer } from '../queue';
import { PaymentPartnerRepository, PaymentVendorRepository } from '../repositories';
export const halotelRabbitMq = new RabbitMqProducer('gateway');
const log = new LoggingInterceptor('halotel.Controller');
const { HalotelRequestTime, DateFormat, TimeFormat } = DateTimeFormats;

@api(halotelDef)
export class HalotelTransactions {
  constructor(
    @repository(PaymentVendorRepository)
    public paymentVendorRepository: PaymentVendorRepository,

    @repository(PaymentPartnerRepository)
    public paymentPartnerRepository: PaymentPartnerRepository,
  ) {}
  private halotelTransactionConstant: any = HalotelTransactionConstant;
  private halotelTransactionParameters: GatewayInterface = new GatewayInterface(
    paymentGateways['HALOTEL'],
  );
  private paymentVendorController: PaymentVendorController = new PaymentVendorController(
    this.paymentVendorRepository,
    this.paymentPartnerRepository,
  );

  async paymentInitiationFunction(halopesa: any) {
    try {
      const halopesaReq: any = { ...halopesa };
      log.info('---paymentInitiationFunction.halopesaReq---');
      const paymentPartnerFilter = {
        where: {
          PartnerCode: halopesaReq.PartnerCode,
          Status: STATUS.ACTIVE,
        },
        include: [
          {
            relation: 'payment_vendor',
          },
        ],
      };
      const paymentPartner: any = await this.paymentPartnerRepository.findOne(paymentPartnerFilter);
      log.info('---paymentInitiationFunction.paymentPartner---');
      const rpOptions: any = {
        apiPath: ApiList['HALOTEL_PAYMENT_INITIATION'],
        body: {
          username: paymentPartner.Username,
          password: paymentPartner.Password,
          amount: halopesaReq.Amount,
          senderMsisdn: halopesaReq?.SenderMsisdn,
          beneficiary_accountid: paymentPartner.CollectionAccountNumber,
          business_no: paymentPartner.CollectionAccountPassword,
          function_code: this.halotelTransactionConstant.functionCode,
          requestid: Utils.generateReferenceID(
            halopesaReq?.SenderMsisdn,
            halopesaReq?.ReferenceMsisdn,
          ),
          request_time: Utils.fetchFormattedTimestamp({
            timestamp: Utils.fetchCurrentTimestamp(),
            format: HalotelRequestTime,
          }),
          referenceid: Utils.generateReferenceID(
            halopesaReq?.SenderMsisdn,
            halopesaReq?.ReferenceMsisdn,
            paymentPartner.CollectionAccountNumber,
          ),
        },
      };
      rpOptions.body.check_sum = this.halotelTransactionConstant.generateChecksum(rpOptions.body);
      rpOptions.body.ReferenceID = Utils.generateReferenceID(rpOptions.body.check_sum);
      return await Utils.callRequest(rpOptions)
        .then((requestRes: any) => {
          log.info('---Utils.callRequest.requestRes---');
          let finalResponse: any;
          if (requestRes?.data) {
            requestRes.data = JSON.parse(xml2Json.toJson(requestRes.data.replace(/S:|ns2:|/g, '')));
            finalResponse = {
              messageCode: ResponseMappings['SUCCESS'],
              success: true,
              statusCode: 200,
              msg: 'Transaction successfully initiated',
              data: {
                ReferenceID: rpOptions.body.ReferenceID,
                ExternalReferenceID: rpOptions.body.referenceid,
              },
            };
          } else {
            finalResponse = {
              messageCode: ResponseMappings['HALOTEL_TRANSACTION_FAIL'],
              success: false,
              statusCode: 500,
              msg: 'Internal server error',
              data: {},
            };
          }
          const queueDetails: any = {
            paymentPartner,
            halopesaReq: {
              ...rpOptions.body,
              ReferenceMsisdn: halopesaReq?.ReferenceMsisdn,
              Status: STATUS.PENDING,
              Operations: [
                {
                  operation: ApiList['HALOTEL_PAYMENT_INITIATION'],
                  Status: STATUS.PENDING,
                  requestBody: requestRes.requestBody,
                  responseBody: requestRes.responseBody,
                },
              ],
            },
          };
          log.info('---paymentInitiationFunction.queueDetails---');
          halotelRabbitMq.sendToQueue(
            JSON.stringify(queueDetails),
            this.halotelTransactionConstant['queuePaymentInitiationRoutingKey'],
          );
          return finalResponse;
        })
        .catch((requestErr: any) => {
          log.error('---Utils.callRequest.requestErr---', requestErr);
          return {
            messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
            success: false,
            statusCode: 500,
            msg: 'Internal server error',
            data: {},
          };
        });
    } catch (error) {
      log.error('---paymentInitiationFunction_CATCH_ERROR---', error);
      return {
        messageCode: ResponseMappings['SERVICE_UNAVAILABLE'],
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        data: error.data || {},
      };
    }
  }

  async updatePaymentRequestFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body } = request;
    if (!body?.Envelope?.Body?.HaloPesaServiceAPIResponse?.return?.ReferenceID) {
      return {
        responseType: RESPONSE_TYPE['ERROR'],
        response_code: 9012,
        msg: 'Internal server error',
        ReferenceID: 'INVLD',
        ResponseTime: moment().format('YYYYMMDDHHmmss'),
      };
    }
    try {
      const halotelReq: any = body?.Envelope?.Body?.HaloPesaServiceAPIResponse?.return;
      log.info('---updatePaymentRequestFunction.body---');
      const callGatewayOptions: any = {
        apiName: 'fetchTransaction',
        body: {
          where: {
            ExternalReferenceID: halotelReq.ReferenceID,
            Status: STATUS.PENDING,
          },
        },
      };
      const halotelTransactionInstance = await this.halotelTransactionParameters.callGateway(
        callGatewayOptions,
      );
      log.info('---halotelTransactionInstance---');
      if (
        !halotelTransactionInstance ||
        (halotelTransactionInstance &&
          (!halotelTransactionInstance.success ||
            !halotelTransactionInstance?.data?.halotelTransaction))
      ) {
        log.info('---Halotel.transaction.not.found---');
        return {
          responseType: RESPONSE_TYPE['ERROR'],
          response_code: 9012,
          msg: 'Internal server error',
          ReferenceID: 'INVLD',
          ResponseTime: moment().format('YYYYMMDDHHmmss'),
        };
      }
      const paymentPartnerFilter: any = {
        where: {
          CollectionAccountNumber:
            halotelTransactionInstance.data.halotelTransaction.CollectionAccountNumber,
          Status: STATUS.ACTIVE,
        },
        include: [
          {
            relation: 'payment_vendor',
          },
        ],
      };
      const paymentPartner = await this.paymentPartnerRepository.findOne(paymentPartnerFilter);
      log.info('---paymentPartner---');
      if (paymentPartner?.PaymentPartnerID) {
        const queueDetails: any = {
          paymentPartner,
          halotelReq: {
            ...halotelReq,
            ...halotelTransactionInstance.data.halotelTransaction,
          },
        };
        log.info('---updatePaymentRequestFunction.queueDetails---');
        halotelRabbitMq.sendToQueue(
          JSON.stringify(queueDetails),
          this.halotelTransactionConstant['queuePaymentUpdationRoutingKey'],
        );
        return {
          responseType: RESPONSE_TYPE['SUCCESS'],
          response_code: 0,
          msg: 'Transaction successfully completed',
          ReferenceID: halotelReq.ReferenceID,
          ResponseTime: moment().format('YYYYMMDDHHmmss'),
        };
      } else {
        log.info('---SERVICE UNAVAILABLE---');
        return {
          responseType: RESPONSE_TYPE['ERROR'],
          response_code: 9012,
          msg: 'Internal server error',
          ReferenceID: 'INVLD',
          ResponseTime: moment().format('YYYYMMDDHHmmss'),
        };
      }
    } catch (error) {
      log.error('---updatePaymentRequestFunction_CATCH_ERROR---', error);
      return {
        responseType: RESPONSE_TYPE['ERROR'],
        response_code: 9012,
        msg: 'Internal server error',
        ReferenceID: 'INVLD',
        ResponseTime: moment().format('YYYYMMDDHHmmss'),
      };
    }
  }

  async validatePaymentRequestSyncFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body } = request;
    if (!body?.Envelope?.Body?.HaloPesaServiceAPI) {
      return {
        responseType: RESPONSE_TYPE.ERROR,
        msg: 'Internal server error',
        reference_id: null,
        response_time: moment().format('YYYYMMDDHHmmss'),
      };
    }
    const halopesaReq = { ...body.Envelope.Body.HaloPesaServiceAPI };
    const createTransactionObj: any = {
      SenderMsisdn: halopesaReq.sender_msisdn,
      ReferenceMsisdn: halopesaReq.referenceid,
      RequestID: halopesaReq?.requestid,
      Amount: halopesaReq?.amount,
      IncomingRequestType: SERVICE_TYPE.USSD_NORMAL,
      Status: STATUS.PENDING,
      Operations: [
        {
          operation: 'validatePaymentRequest',
          Status: STATUS.PENDING,
          requestBody: body,
          responseBody: {},
        },
      ],
    };
    const callGatewayOptions: InterfaceList.GatewayFormats.addTransaction = {
      apiName: 'addTransaction',
      body: createTransactionObj,
    };
    try {
      log.info('---validatePaymentRequestSyncFunction.reuqest---');
      const paymentPartnerFilter = {
        where: {
          CollectionAccountPassword: halopesaReq.business_no,
          Status: STATUS.ACTIVE,
        },
        include: [
          {
            relation: 'payment_vendor',
          },
        ],
      };
      const paymentPartner: any = await this.paymentPartnerRepository.findOne(paymentPartnerFilter);
      if (paymentPartner?.PaymentPartnerID && paymentPartner?.payment_vendor) {
        log.info('---paymentPartner---');
        createTransactionObj.CollectionAccountNumber = paymentPartner.CollectionAccountNumber;
        createTransactionObj.PaymentVendorID = paymentPartner.PaymentVendorID;
        createTransactionObj.ReferenceID = halopesaReq.ReferenceID;
        createTransactionObj.ExternalReferenceID = halopesaReq.ExternalReferenceID;

        halopesaReq.ReferenceID = Utils.generateReferenceID(halopesaReq.sender_msisdn);
        halopesaReq.ExternalReferenceID = Utils.generateReferenceID(
          halopesaReq?.senderMsisdn,
          halopesaReq?.amount,
          halopesaReq?.requestid,
        );
        let userFound = null;
        if (
          paymentPartner &&
          this.halotelTransactionConstant.HALOPESA_AZAMTV_CONSTANT_SPID.indexOf(
            paymentPartner.CollectionAccountNumber,
          ) > -1
        ) {
          halopesaReq.senderMsisdn = halopesaReq.referenceid;
          userFound = await this.paymentVendorController.checkUserForAzamTV(halopesaReq);
          createTransactionObj.Operations.push({
            operation: 'checkUserForAzamTV',
            requestBody: userFound.requestBody,
            responseBody: userFound.responseBody,
            Status: createTransactionObj.Status,
          });
          log.info('---userFound---');
        } else if (paymentPartner?.payment_vendor) {
          const connectedAppsObj: any = {
            routeInfo: paymentPartner.payment_vendor,
            request: {
              operator: 'Halotel',
              ReferenceID: createTransactionObj.ReferenceID,
              utilityref: createTransactionObj.ReferenceMsisdn,
              Amount: createTransactionObj.Amount,
              TXNID: createTransactionObj.ExternalReferenceID,
              MSISDN: createTransactionObj.SenderMsisdn,
            },
          };
          log.info('---connectedAppsObj---');
          userFound = await this.paymentVendorController.checkUserForConnectedApp(connectedAppsObj);
          createTransactionObj.Operations.push({
            operation: 'checkUserForConnectedApp',
            requestBody: userFound.requestBody,
            responseBody: userFound.responseBody,
            Status: createTransactionObj.Status,
          });
        } else {
          log.info('---NEITHER.FROM.MQ.NOT.FROM.CONNECTED.APPS---');
          createTransactionObj.Status = STATUS.FAILURE;
          await this.halotelTransactionParameters.callGateway(callGatewayOptions);
          return {
            responseType: RESPONSE_TYPE.ERROR,
            msg: 'Internal server error',
            reference_id: halopesaReq.ReferenceID,
            response_time: moment().format('YYYYMMDDHHmmss'),
          };
        }
        if (!userFound || (userFound && !userFound.success)) {
          log.info('Not Duplicate');
          createTransactionObj.Status = STATUS.FAILURE;
          await this.halotelTransactionParameters.callGateway(callGatewayOptions);
          return {
            responseType: RESPONSE_TYPE.ERROR,
            msg: 'Internal server error',
            reference_id: halopesaReq.ReferenceID,
            response_time: moment().format('YYYYMMDDHHmmss'),
          };
        } else if (userFound?.isFromMQ) {
          const mqPaymentObject = {
            routeInfo: paymentPartner,
            request: {
              operator: paymentGateways.HALOTEL,
              smartCardNo: createTransactionObj.ReferenceMsisdn,
              SenderMsisdn: createTransactionObj.SenderMsisdn,
              amount: createTransactionObj.Amount,
              reciptNo: createTransactionObj.ReferenceID,
              referenceNo: createTransactionObj.ExternalReferenceID,
            },
          };
          log.info('---mqPaymentObject---');
          return await this.paymentVendorController
            .paymentMQServices(mqPaymentObject)
            .then(async (res: any) => {
              log.info('---paymentVendorController.paymentMQServices.res---');
              if (res?.success) {
                createTransactionObj.Status = STATUS.COMPLETED;
                createTransactionObj.Operations.push({
                  operation: 'paymentMQServices',
                  requestBody: res.requestBody,
                  responseBody: res.responseBody,
                  Status: createTransactionObj.Status,
                });
                await this.halotelTransactionParameters.callGateway(callGatewayOptions);
                return {
                  responseType: RESPONSE_TYPE.SUCCESS,
                  msg: 'Transaction successfully executed',
                  reference_id: halopesaReq?.ReferenceID,
                  response_time: moment().format('YYYYMMDDHHmmss'),
                };
              } else {
                createTransactionObj.Status = STATUS.FAILURE;
                createTransactionObj.Operations.push({
                  operation: 'paymentMQServices',
                  requestBody: res.requestBody,
                  responseBody: res.responseBody,
                  Status: createTransactionObj.Status,
                });
                await this.halotelTransactionParameters.callGateway(callGatewayOptions);
                return {
                  responseType: RESPONSE_TYPE.ERROR,
                  msg: 'Internal server error',
                  reference_id: halopesaReq?.ReferenceID,
                  response_time: moment().format('YYYYMMDDHHmmss'),
                };
              }
            })
            .catch(async (err: any) => {
              log.error('---paymentVendorController.paymentMQServices.err---', err);
              createTransactionObj.Status = STATUS.FAILURE;
              createTransactionObj.Operations.push({
                operation: 'paymentMQServices',
                requestBody: err.requestBody,
                responseBody: err.responseBody,
                Status: createTransactionObj.Status,
              });
              await this.halotelTransactionParameters.callGateway(callGatewayOptions);
              return {
                responseType: RESPONSE_TYPE.ERROR,
                msg: 'Internal server error',
                reference_id: halopesaReq?.ReferenceID,
                response_time: moment().format('YYYYMMDDHHmmss'),
              };
            });
        } else {
          const makePaymentObj = {
            routeDetails: paymentPartner.payment_vendor,
            request: {
              TransactionStatus: 'success',
              Message: 'Payment successful',
              Operator: 'Halotel',
              ReferenceID: createTransactionObj.ReferenceID,
              ExternalReferenceID: createTransactionObj.ExternalReferenceID,
              UtilityReference: createTransactionObj.ReferenceMsisdn,
              Amount: createTransactionObj.Amount,
              TansactionID: createTransactionObj?.requestid,
              Msisdn: createTransactionObj.SenderMsisdn,
            },
          };
          log.info('---makePaymentObj---');
          return await this.paymentVendorController
            .payUserForConnectedApp(makePaymentObj)
            .then(async (res: any) => {
              log.info('---paymentVendorController.payUserForConnectedApp.res---');
              createTransactionObj.Status = STATUS.COMPLETED;
              createTransactionObj.Operations.push({
                operation: 'payUserForConnectedApp',
                requestBody: res.requestBody,
                responseBody: res.responseBody,
                Status: createTransactionObj.Status,
              });
              await this.halotelTransactionParameters.callGateway(callGatewayOptions);
              return {
                responseType: RESPONSE_TYPE.SUCCESS,
                msg: 'Transaction successfully executed',
                reference_id: halopesaReq?.ReferenceID,
                response_time: moment().format('YYYYMMDDHHmmss'),
              };
            })
            .catch(async (err: any) => {
              log.error('---paymentVendorController.payUserForConnectedApp.err---', err);
              createTransactionObj.Status = STATUS.FAILURE;
              createTransactionObj.Operations.push({
                operation: 'payUserForConnectedApp',
                requestBody: err.requestBody,
                responseBody: err.responseBody,
                Status: createTransactionObj.Status,
              });
              await this.halotelTransactionParameters.callGateway(callGatewayOptions);
              return {
                responseType: RESPONSE_TYPE.ERROR,
                msg: 'Internal server error',
                reference_id: halopesaReq?.ReferenceID,
                response_time: moment().format('YYYYMMDDHHmmss'),
              };
            });
        }
      } else {
        log.info('---NO_INTEGRATION_PARTNER_FOUND---');
        createTransactionObj.Status = STATUS.FAILURE;
        await this.halotelTransactionParameters.callGateway(callGatewayOptions);
        return {
          responseType: RESPONSE_TYPE.ERROR,
          msg: 'Internal server error',
          reference_id: halopesaReq?.referenceid,
          response_time: moment().format('YYYYMMDDHHmmss'),
        };
      }
    } catch (error) {
      log.error('---validatePaymentRequestSyncFunction_CATCH_ERROR---', error);
      return {
        responseType: RESPONSE_TYPE.ERROR,
        msg: 'Internal server error',
        reference_id: halopesaReq?.referenceid,
        response_time: moment().format('YYYYMMDDHHmmss'),
      };
    }
  }

  async fetchMultipleTransactions(request: any): Promise<any> {
    const callGatewayOptions: any = {
      apiName: 'fetchMultipleTransactions',
      body: { ...request },
    };
    const [transactionsError, transactionsResult]: any[] = await Utils.executePromise(
      this.halotelTransactionParameters.callGateway(callGatewayOptions),
    );
    if (transactionsError || !(transactionsResult?.success || transactionsResult?.data)) {
      log.error('---fetchMultipleTransactions.transactionsError---', transactionsError);
      return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
    }
  }

  async fetchTransactionsCount(request: any): Promise<any> {
    const callGatewayOptions: any = {
      apiName: 'fetchTransactionsCount',
      body: { ...request },
    };
    const [countError, transactionsCount]: any[] = await Utils.executePromise(
      this.halotelTransactionParameters.callGateway(callGatewayOptions),
    );
    if (countError || !(transactionsCount?.success || transactionsCount?.data)) {
      log.error('---fetchTransactionsCount.countError---', countError);
      return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
    }
    log.info('---fetchTransactionsCount.transactionsCount---');
    log.info(transactionsCount);
    return {
      ...transactionsCount,
      messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
    };
  }

  async fetchHalotelTransactionDetails(query: any): Promise<any> {
    let count: number = Utils.fetchSkipFilter({
      skip: parseInt(query.skip),
      limit: parseInt(query.limit),
    });
    const halotelResponse: InterfaceList.TransactionResponseInstance = {
      totalCount: 0,
      transactions: [],
    };
    let callRequestOptions: any = {
      apiPath: ApiList['FETCH_HALOTEL_TRANSACTIONS'],
      body: {
        where: {
          ...Utils.fetchTimestampFilter(query),
          PaymentVendorID: query.PaymentVendorID,
          Amount: query?.Amount ? query.Amount : undefined,
          Status: query?.Status ? query.Status : undefined,
          SenderMsisdn: query?.SenderMsisdn ? { like: `%${query.SenderMsisdn}%` } : undefined,
          ReferenceMsisdn: query?.ReferenceMsisdn
            ? { like: `%${query.ReferenceMsisdn}%` }
            : undefined,
          ReferenceID: query?.ReferenceID ? { like: `%${query.ReferenceID}%` } : undefined,
          ExternalReferenceID: query?.ExternalReferenceID
            ? { like: `%${query.ExternalReferenceID}%` }
            : undefined,
          IncomingRequestType: query?.IncomingRequestType ? query.IncomingRequestType : undefined,
          CreatedAt: query?.Time ? { like: `%${query.Time}%` } : undefined,
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
      apiPath: ApiList['FETCH_HALOTEL_TRANSACTIONS_COUNT'],
      body: {
        ...Utils.fetchTimestampFilter(query),
        PaymentVendorID: query.PaymentVendorID,
        Amount: query?.Amount ? query.Amount : undefined,
        Status: query?.Status ? query.Status : undefined,
        SenderMsisdn: query?.SenderMsisdn ? { like: `%${query.SenderMsisdn}%` } : undefined,
        ReferenceMsisdn: query?.ReferenceMsisdn
          ? { like: `%${query.ReferenceMsisdn}%` }
          : undefined,
        ReferenceID: query?.ReferenceID ? { like: `%${query.ReferenceID}%` } : undefined,
        ExternalReferenceID: query?.ExternalReferenceID
          ? { like: `%${query.ExternalReferenceID}%` }
          : undefined,
        IncomingRequestType: query?.IncomingRequestType ? query.IncomingRequestType : undefined,
        CreatedAt: query?.Time ? { like: `%${query.Time}%` } : undefined,
      },
    };
    const [totalCountError, totalCount]: any[] = await Utils.executePromise(
      Utils.callRequest(callRequestOptions),
    );

    if (
      callRequestError ||
      totalCountError ||
      !(callRequestResult?.success || callRequestResult?.data?.data?.halotelTransactions) ||
      !(totalCount?.success || totalCount?.data?.data?.halotelTransactions)
    ) {
      log.error('---callRequestError---', callRequestError);
      log.error('---totalCountError---', totalCountError);
      return false;
    }
    log.info('---callRequestResult---');

    log.info('---totalCount---');

    halotelResponse.totalCount = totalCount?.data?.data?.halotelTransactions?.count;
    if (callRequestResult?.data?.data?.halotelTransactions?.length) {
      callRequestResult.data.data.halotelTransactions.forEach((val: any) => {
        halotelResponse.transactions.push({
          SerialNo: ++count,
          ReferenceID: val.ReferenceID,
          ExternalReferenceID: val.ExternalReferenceID,
          SenderMsisdn: val.SenderMsisdn,
          ReferenceMsisdn: val.ReferenceMsisdn,
          Amount: val.Amount,
          IncomingRequestType: val?.IncomingRequestType,
          Status: val.Status,
          Date: Utils.fetchFormattedTimestamp({
            timestamp: val?.CreatedAt || val?.UpdatedAt,
            format: DateFormat,
          }),
          Time: Utils.fetchFormattedTimestamp({
            timestamp: val?.CreatedAt || val?.UpdatedAt,
            format: TimeFormat,
          }),
          Operations: val.Operations,
        });
      });
    }
    log.info('---fetchHalotelTransactionDetails.halotelResponse---');
    if (!halotelResponse.totalCount || !halotelResponse?.transactions?.length) return false;
    return halotelResponse;
  }

  async fetchHalotelTransactionsCount(query: any): Promise<any> {
    const filter: any = {
      apiPath: ApiList['FETCH_HALOTEL_TRANSACTIONS'],
      body: { ...query },
    };
    const [halotelError, halotelTransactions]: any[] = await Utils.executePromise(
      Utils.callRequest(filter),
    );
    if (halotelError) {
      log.error('---halotelError---', halotelError);
      return false;
    } else if (
      !(
        halotelTransactions?.success || halotelTransactions?.data?.data?.halotelTransactions?.length
      )
    ) {
      log.info(
        '---!(halotelTransactions?.success || halotelTransactions?.data?.data?.halotelTransactions)---',
      );
      return false;
    }
    log.info('---halotelTransactions---');
    return halotelTransactions.data.data.halotelTransactions;
  }
}
