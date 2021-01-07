/* eslint-disable no-invalid-this */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { vodacomDef } from '../api-specs/vodacom-transactions';
import { api, GatewayInterface, inject, repository, Request, RestBindings, Utils } from '../common';
import {
  ApiList,
  DateTimeFormats,
  InterfaceList,
  paymentGateways,
  ResponseMappings,
  RESPONSE_TYPE,
  SERVICE_TYPE,
  STATUS,
  VodacomTransactionsConstants,
} from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { RabbitMqProducer } from '../queue';
import { PaymentPartnerRepository, PaymentVendorRepository } from '../repositories';
export const vodacomRabbitMq = new RabbitMqProducer('gateway');
const log = new LoggingInterceptor('vodacom.Controller');
const { DateFormat, TimeFormat } = DateTimeFormats;

@api(vodacomDef)
export class VodacomTransactions {
  constructor(
    @repository(PaymentVendorRepository)
    private paymentVendorRepository: PaymentVendorRepository,

    @repository(PaymentPartnerRepository)
    private paymentPartnerRepository: PaymentPartnerRepository,
  ) {}
  private vodacomGatewayParams: GatewayInterface = new GatewayInterface(paymentGateways['VODACOM']);
  private vodacomTransactionsConstants: any = VodacomTransactionsConstants;

  public async initiateTransactionFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body } = request;
    if (!body?.mpesaBroker?.request?.transaction) {
      log.info('---INVALID REQUEST BODY---');
      log.info(body);
      return {
        responseType: RESPONSE_TYPE['ERROR'],
        ...body,
      };
    }
    try {
      log.info('---initiateTransactionFunction.body---');
      log.info(body);
      delete body.mpesaBroker['xmlns'];
      delete body.mpesaBroker['version'];
      const callGatewayOptions: any = {
        apiName: 'addTransaction',
        body: {
          Request: body.mpesaBroker.request,
          ReferenceID: Utils.generateReferenceID(
            body?.mpesaBroker?.request?.transaction?.mpesaReceipt,
          ),
          ExternalReferenceID: body?.mpesaBroker?.request?.transaction?.mpesaReceipt,
          Amount: body?.mpesaBroker?.request?.transaction?.amount,
          IncomingRequestType: SERVICE_TYPE.USSD_NORMAL,
          Status: STATUS.PENDING,
          Operations: [
            {
              operation: 'initiateTransaction',
              Status: STATUS.PENDING,
              requestBody: { ...body },
              responseBody: {},
            },
          ],
        },
      };
      log.info('---initiateTransactionFunction.callGatewayOptions---');
      log.info(callGatewayOptions);
      this.vodacomGatewayParams
        .callGateway(callGatewayOptions)
        .then((res: any) => {
          log.info('---vodacomGatewayParams.callGateway.res---');
          log.info(res);
          vodacomRabbitMq.sendToQueue(
            JSON.stringify(callGatewayOptions.body),
            this.vodacomTransactionsConstants['queueRoutingKey'],
          );
        })
        .catch((err: any) => {
          log.info('---vodacomGatewayParams.callGateway.err---');
          log.info(err);
        });
      return {
        responseType: RESPONSE_TYPE['SUCCESS'],
        ...body?.mpesaBroker,
      };
    } catch (error) {
      log.error('---validateTokenFunction.catch.err---');
      log.error(error);
      return {
        responseType: RESPONSE_TYPE['ERROR'],
        ...body?.mpesaBroker,
      };
    }
  }

  async fetchMultipleTransactions(request: any): Promise<any> {
    const callGatewayOptions: any = {
      apiName: 'fetchMultipleTransactions',
      body: { ...request },
    };
    const [transactionsError, transactionsResult]: any[] = await Utils.executePromise(
      this.vodacomGatewayParams.callGateway(callGatewayOptions),
    );
    if (transactionsError || !(transactionsResult?.success || transactionsResult?.data)) {
      log.info('---fetchMultipleTransactions.transactionsError---');
      log.info(transactionsError);
      return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
    }
    log.info('---fetchMultipleTransactions.transactionsResult---');
    log.info(transactionsResult);
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
      this.vodacomGatewayParams.callGateway(callGatewayOptions),
    );
    if (countError || !(transactionsCount?.success || transactionsCount?.data)) {
      log.info('---fetchTransactionsCount.countError---');
      log.info(countError);
      return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
    }
    log.info('---fetchTransactionsCount.transactionsCount---');
    log.info(transactionsCount);
    return {
      ...transactionsCount,
      messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
    };
  }

  async fetchVodacomTransactionDetails(query: any): Promise<any> {
    let count: number = Utils.fetchSkipFilter({
      skip: parseInt(query.skip),
      limit: parseInt(query.limit),
    });
    const vodacomResponse: InterfaceList.TransactionResponseInstance = {
      totalCount: 0,
      transactions: [],
    };
    let callRequestOptions: any = {
      apiPath: ApiList['FETCH_VODACOM_TRANSACTIONS'],
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
        fields: query.fields,
        order: query.order,
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
      apiPath: ApiList['FETCH_VODACOM_TRANSACTIONS_COUNT'],
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
      !(callRequestResult?.success || callRequestResult?.data?.data?.vodacomTransactions) ||
      !(totalCount?.success || totalCount?.data?.data?.vodacomTransactions)
    ) {
      log.info('---callRequestError---');
      log.info(callRequestError || callRequestResult);
      log.info('---totalCountError---');
      log.info(totalCountError || totalCount);
      return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
    }
    log.info('---callRequestResult---');
    log.info(callRequestResult);

    log.info('---totalCount---');
    log.info(totalCount);

    vodacomResponse.totalCount = totalCount?.data?.data?.vodacomTransactions?.count;
    if (callRequestResult?.data?.data?.vodacomTransactions?.length) {
      callRequestResult.data.data.vodacomTransactions.forEach((val: any) => {
        vodacomResponse.transactions.push({
          SerialNo: ++count,
          ReferenceID: val?.ReferenceID,
          ExternalReferenceID: val?.Request?.transaction?.originatorConversationID || null,
          SenderMsisdn: val?.Request?.transaction?.initiator || null,
          ReferenceMsisdn: val?.Request?.transaction?.accountReference || null,
          Amount: val?.Amount || null,
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
    log.info('---fetchVodacomTransactionDetails.vodacomResponse---');
    log.info(vodacomResponse);
    if (!Object.keys(vodacomResponse).length) return false;
    return vodacomResponse;
  }

  async fetchVodacomTransactionsCount(query: any): Promise<any> {
    const filter: any = {
      apiPath: ApiList['FETCH_VODACOM_TRANSACTIONS'],
      body: { ...query },
    };
    const [vodacomError, vodacomTransactions]: any[] = await Utils.executePromise(
      Utils.callRequest(filter),
    );
    if (vodacomError) {
      log.info('---vodacomError---');
      log.info(vodacomError);
      return false;
    } else if (
      !(
        vodacomTransactions?.success || vodacomTransactions?.data?.data?.vodacomTransactions?.length
      )
    ) {
      log.info(
        '---!(vodacomTransactions?.success || vodacomTransactions?.data?.data?.vodacomTransactions)---',
      );
      log.info(vodacomTransactions);
      return false;
    }
    log.info('---vodacomTransactions---');
    log.info(vodacomTransactions);
    return vodacomTransactions.data.data.vodacomTransactions;
  }
}
