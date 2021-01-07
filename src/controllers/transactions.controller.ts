import {
  AirtelTransactions,
  HalotelTransactions,
  TigoTransactions,
  VodacomTransactions,
  ZantelTransactions,
} from '.';
import { transactionsDef } from '../api-specs/transactions';
import { api, authenticate, Filter, inject, Request, RestBindings, Utils } from '../common';
import {
  ApiList,
  DateTimeFormats,
  DefaultTransactionReports,
  InterfaceList,
  JWT_STRATEGY_NAME,
  ResponseMappings,
  STATUS,
  TransactionReportTypes,
} from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';

const { DayFormat, DateFormat } = DateTimeFormats;
const { Label, Market } = TransactionReportTypes;
const log = new LoggingInterceptor('transactions.Controllers');

@api(transactionsDef)
export class TransactionsController {
  constructor(
    @inject(`controllers.AirtelTransactions`)
    private airtelController: AirtelTransactions,

    @inject(`controllers.HalotelTransactions`)
    private halotelController: HalotelTransactions,

    @inject(`controllers.TigoTransactions`)
    private tigoController: TigoTransactions,

    @inject(`controllers.VodacomTransactions`)
    private vodacomController: VodacomTransactions,

    @inject(`controllers.ZantelTransactions`)
    private zantelController: ZantelTransactions,
  ) {}

  @authenticate(JWT_STRATEGY_NAME)
  public async fetchTransactionsFilterForVendor(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    console.log('---request---');
    console.dir(request);
    const { user }: any = request;
    if (!Object.keys(user?.Roles).length)
      return { messageCode: ResponseMappings['UNAUTHORIZED_ACTION'] };
    try {
      // const userRoles: any = user.Roles;
      log.info('---fetchTransactionsForVendor.user---');

      if (
        user.payment_vendor?.vendor_type?.VendorTypeID &&
        user.payment_vendor?.payment_partner?.length
      ) {
        return {
          messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
          data: {
            IncomingRequestTypes: [user.payment_vendor.vendor_type.VendorTypeCode],
            PaymentPartner: user.payment_vendor.payment_partner || [
              'AirtelTransaction',
              'HalotelTransaction',
              'TigoTransaction',
              'VodacomTransaction',
              'ZantelTransaction',
            ],
          },
        };
      } else {
        return {
          messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
          data: {
            IncomingRequestTypes: [user.payment_vendor?.vendor_type?.VendorTypeCode || 'ussd-push'],
            PaymentPartner: [
              'AirtelTransaction',
              'HalotelTransaction',
              'TigoTransaction',
              'VodacomTransaction',
              'ZantelTransaction',
            ],
          },
        };
      }
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  @authenticate(JWT_STRATEGY_NAME)
  public async fetchTransactionsForVendor(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { query, user }: any = request;
    // if (!Object.keys(user?.Roles).length)
    //   return { messageCode: ResponseMappings['UNAUTHORIZED_ACTION'] };

    try {
      // const userRoles: any = user.Roles;
      const finalResponse: InterfaceList.TransactionResponse = {};
      log.info('---fetchTransactionsForVendor---');
      query.PaymentVendorID = user.PaymentVendorID;
      if (query?.SenderMsisdn) {
        query.skipPagination = true;
        query.SenderMsisdn = query.SenderMsisdn.replace(/^255/, '');
      }
      if (query?.ReferenceMsisdn) {
        query.skipPagination = true;
        query.ReferenceMsisdn = query.ReferenceMsisdn.replace(/^255/, '');
      }
      if (query?.ReferenceID) {
        query.skipPagination = true;
      }
      if (query?.ExternalReferenceID) {
        query.skipPagination = true;
      }
      if (query?.SenderMsisdn) {
        query.skipPagination = true;
      }
      if (query?.ReferenceMsisdn) {
        query.skipPagination = true;
      }
      if (query?.Amount) {
        query.skipPagination = true;
      }
      if (query?.IncomingRequestType) {
        query.skipPagination = true;
      }
      if (query?.Status) {
        query.skipPagination = true;
      }
      if (query?.Date) {
        query.skipPagination = true;
      }
      if (query?.Time) {
        query.skipPagination = true;
      }

      if (query.AirtelTransaction) {
        // && this.userController.checkAllowedAction(userRoles, RoleMappings['FETCH_AIRTEL_TRANSACTIONS'])) {
        finalResponse.AirtelTransaction = await this.airtelController.fetchAirtelTransactionDetails(
          query,
        );
        if (!finalResponse.AirtelTransaction) delete finalResponse['AirtelTransaction'];
      }

      if (query.HalotelTransaction) {
        // && this.userController.checkAllowedAction(userRoles, RoleMappings['FETCH_HALOTEL_TRANSACTIONS'])) {
        finalResponse.HalotelTransaction = await this.halotelController.fetchHalotelTransactionDetails(
          query,
        );
        if (!finalResponse.HalotelTransaction) delete finalResponse['HalotelTransaction'];
      }

      if (query.TigoTransaction) {
        // && this.userController.checkAllowedAction(userRoles, RoleMappings['FETCH_TIGO_TRANSACTIONS'])) {
        finalResponse.TigoTransaction = await this.tigoController.fetchTigoTransactionDetails(
          query,
        );
        if (!finalResponse.TigoTransaction) delete finalResponse['TigoTransaction'];
      }

      if (query.VodacomTransaction) {
        // && this.userController.checkAllowedAction(userRoles, RoleMappings['FETCH_VODACOM_TRANSACTIONS'])) {
        finalResponse.VodacomTransaction = await this.vodacomController.fetchVodacomTransactionDetails(
          query,
        );
        if (!finalResponse.VodacomTransaction) delete finalResponse['VodacomTransaction'];
      }

      if (query.ZantelTransaction) {
        // && this.userController.checkAllowedAction(userRoles, RoleMappings['FETCH_ZANTEL_TRANSACTIONS'])) {
        finalResponse.ZantelTransaction = await this.zantelController.fetchZantelTransactionDetails(
          query,
        );
        if (!finalResponse.ZantelTransaction) delete finalResponse['ZantelTransaction'];
      }

      if (!Object.keys(finalResponse).length)
        return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };

      return {
        messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
        data: { ...finalResponse },
      };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  @authenticate(JWT_STRATEGY_NAME)
  public async fetchTransactionReports(
    @inject(RestBindings.Http.REQUEST)
    request: any,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { user }: any = request;
    const finalResponse: InterfaceList.TransactionReportsResponse | any = {
      ...DefaultTransactionReports,
    };

    try {
      log.info('---fetchTransactionReports---');

      if (!(request?.query?.skip || request?.query?.limit)) {
        request.query.skip = null;
        request.query.limit = null;
      }
      request.query.fields = {
        Amount: true,
        Status: true,
      };
      request.query.PaymentVendorID = user.PaymentVendorID;
      const [transactionError, transactionDetails]: any[] = await Utils.executePromise(
        this.fetchTransactionsForVendor(request),
      );
      if (transactionError || !(transactionDetails.success || transactionDetails.data)) {
        log.error('---transactionError---', transactionError);
        return (
          transactionError ||
          transactionDetails || { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] }
        );
      }
      log.info('---transactionDetails---');
      for (const transactionTypeKey in transactionDetails.data) {
        const transactionArray: any[] = transactionDetails.data[transactionTypeKey].transactions;

        transactionArray.forEach((val: InterfaceList.TransactionInstance) => {
          finalResponse['TotalTransactions'] = {
            Amount: finalResponse['TotalTransactions'].Amount += parseFloat(val.Amount),

            TransactionCount:
              eval(request.query.Amount) && parseFloat(val.Amount)
                ? (finalResponse['TotalTransactions'].TransactionCount += parseFloat(val.Amount))
                : (finalResponse['TotalTransactions'].TransactionCount += 1),

            CompletedCount:
              [STATUS.ACTIVE, STATUS.COMPLETED, STATUS.SUCCESS].indexOf(val.Status) > -1
                ? eval(request?.query?.Amount) && parseFloat(val.Amount)
                  ? (finalResponse['TotalTransactions'].CompletedCount += parseFloat(val.Amount))
                  : (finalResponse['TotalTransactions'].CompletedCount += 1)
                : finalResponse['TotalTransactions'].CompletedCount,

            PendingCount:
              [STATUS.PENDING].indexOf(val.Status) > -1
                ? eval(request?.query?.Amount) && parseFloat(val.Amount)
                  ? (finalResponse['TotalTransactions'].PendingCount += parseFloat(val.Amount))
                  : (finalResponse['TotalTransactions'].PendingCount += 1)
                : finalResponse['TotalTransactions'].PendingCount,

            FailedCount:
              [STATUS.FAILED, STATUS.INACTIVE].indexOf(val.Status) > -1
                ? eval(request?.query?.Amount) && parseFloat(val.Amount)
                  ? (finalResponse['TotalTransactions'].FailedCount += parseFloat(val.Amount))
                  : (finalResponse['TotalTransactions'].FailedCount += 1)
                : finalResponse['TotalTransactions'].FailedCount,
          };

          finalResponse[transactionTypeKey] = {
            Amount: finalResponse[transactionTypeKey].Amount += parseFloat(val.Amount),

            TransactionCount:
              eval(request?.query?.Amount) && parseFloat(val.Amount)
                ? (finalResponse[transactionTypeKey].TransactionCount += parseFloat(val.Amount))
                : (finalResponse[transactionTypeKey].TransactionCount += 1),

            CompletedCount:
              [STATUS.ACTIVE, STATUS.COMPLETED, STATUS.SUCCESS].indexOf(val.Status) > -1
                ? eval(request?.query?.Amount) && parseFloat(val.Amount)
                  ? (finalResponse[transactionTypeKey].CompletedCount += parseFloat(val.Amount))
                  : (finalResponse[transactionTypeKey].CompletedCount += 1)
                : finalResponse[transactionTypeKey].CompletedCount,

            PendingCount:
              [STATUS.FAILED, STATUS.INACTIVE].indexOf(val.Status) > -1
                ? eval(request?.query?.Amount) && parseFloat(val.Amount)
                  ? (finalResponse[transactionTypeKey].PendingCount += parseFloat(val.Amount))
                  : (finalResponse[transactionTypeKey].PendingCount += 1)
                : finalResponse[transactionTypeKey].PendingCount,

            FailedCount:
              [STATUS.PENDING].indexOf(val.Status) > -1
                ? eval(request?.query?.Amount) && parseFloat(val.Amount)
                  ? (finalResponse[transactionTypeKey].FailedCount += parseFloat(val.Amount))
                  : (finalResponse[transactionTypeKey].FailedCount += 1)
                : finalResponse[transactionTypeKey].FailedCount,
          };
        });
      }

      log.info('---fetchTransactionReports.finalResponse---');
      return {
        messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
        data: { ...finalResponse },
      };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  @authenticate(JWT_STRATEGY_NAME)
  public async fetchFilterBasedReport(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { query, user }: any = request;
    const defaultTransactionsCount: number[] = [];
    // const userRoles: any = user.Roles;
    const finalResponse: InterfaceList.GraphReportResponse = {
      headers: [],
      dates: [],
      transactions: [],
    };

    try {
      log.info('---fetchFilterBasedReport.user---');

      if (query.StartDate && query.EndDate) {
        for (let x = 0; x < 1000; x++) {
          const pushedDate: string = Utils.addCalculatedTimestamp({
            timestamp: Utils.fetchFormattedTimestamp({
              timestamp: query.StartDate,
              format: DateFormat,
            }),
            offset: x,
            unit: DayFormat,
          });
          finalResponse.dates.push(
            Utils.fetchFormattedTimestamp({ timestamp: pushedDate, format: DateFormat }),
          );
          defaultTransactionsCount.push(0);
          if (
            Utils.fetchFormattedTimestamp({ timestamp: pushedDate, format: DateFormat }) ==
            Utils.fetchFormattedTimestamp({ timestamp: query.EndDate, format: DateFormat })
          ) {
            break;
          }
        }
      } else {
        /* HERE: the indices are in the descending order as the dates
        are to be saves in the ascending order */
        for (let x = 2; x > 0; x--) {
          finalResponse.dates.push(
            Utils.subtractCalculatedTimestamp({
              timestamp: Utils.fetchCurrentTimestamp(),
              offset: x,
              unit: DayFormat,
            }),
          );
          defaultTransactionsCount.push(0);
        }
      }

      if (query.AirtelTransaction) {
        // && this.userController.checkAllowedAction(userRoles, RoleMappings['FETCH_AIRTEL_TRANSACTIONS'])) {
        finalResponse.headers.push('AirtelTransaction');
        const callOptions: any = {
          apiPath: ApiList['FETCH_AIRTEL_TRANSACTIONS'],
          body: {
            where: {
              ...Utils.fetchTimestampFilter(query),
              PaymentVendorID: query.PaymentVendorID,
            },
          },
        };
        const [airtelTransactionsError, airtelTransactions]: any[] = await Utils.executePromise(
          Utils.callRequest(callOptions),
        );
        if (airtelTransactionsError) {
          log.error('---airtelTransactionsError---', airtelTransactionsError);
          return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
        } else if (
          !(
            airtelTransactions?.success ||
            airtelTransactions?.data?.data?.airtelTransactions?.length
          )
        ) {
          log.info(
            '---!(airtelTransactions?.success || airtelTransactions?.data?.data?.airtelTransactions)---',
          );
          return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
        }
        log.info('---airtelTransactions---');
        const transactionObj: InterfaceList.GraphResopnseInstance = {
          name: 'AirtelTransaction',
          data: [...defaultTransactionsCount],
        };
        if (airtelTransactions?.data?.data?.airtelTransactions?.length) {
          airtelTransactions.data.data.airtelTransactions.forEach((val: any) => {
            const dateIndex: number = finalResponse.dates.indexOf(
              Utils.fetchFormattedTimestamp({ timestamp: val.CreatedAt, format: DateFormat }),
            );
            if (dateIndex > -1) {
              if (eval(query?.Amount) && parseFloat(val.Amount)) {
                transactionObj.data[dateIndex] += parseFloat(val.Amount);
              } else {
                transactionObj.data[dateIndex]++;
              }
            }
          });
          finalResponse.transactions.push(transactionObj);
        }
      }

      if (query.HalotelTransaction) {
        // && this.userController.checkAllowedAction(userRoles, RoleMappings['FETCH_HALOTEL_TRANSACTIONS'])) {
        finalResponse.headers.push('HalotelTransaction');
        const callOptions: any = {
          apiPath: ApiList['FETCH_HALOTEL_TRANSACTIONS'],
          body: {
            where: {
              ...Utils.fetchTimestampFilter(query),
              PaymentVendorID: query.PaymentVendorID,
            },
          },
        };
        const [halotelTransactionsError, halotelTransactions]: any[] = await Utils.executePromise(
          Utils.callRequest(callOptions),
        );
        if (halotelTransactionsError) {
          log.error('---halotelTransactionsError---', halotelTransactionsError);
          return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
        } else if (
          !(
            halotelTransactions?.success ||
            halotelTransactions?.data?.data?.halotelTransactions?.length
          )
        ) {
          log.info(
            '---!(halotelTransactions?.success || halotelTransactions?.data?.data?.halotelTransactions)---',
          );
          return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
        }
        log.info('---halotelTransactions---');
        const transactionObj: InterfaceList.GraphResopnseInstance = {
          name: 'HalotelTransaction',
          data: [...defaultTransactionsCount],
        };
        if (halotelTransactions?.data?.data?.halotelTransactions?.length) {
          halotelTransactions.data.data.halotelTransactions.forEach((val: any) => {
            const dateIndex: number = finalResponse.dates.indexOf(
              Utils.fetchFormattedTimestamp({ timestamp: val.CreatedAt, format: DateFormat }),
            );
            if (dateIndex > -1) {
              if (eval(query?.Amount) && parseFloat(val.Amount)) {
                transactionObj.data[dateIndex] += parseFloat(val.Amount);
              } else {
                transactionObj.data[dateIndex]++;
              }
            }
          });
          finalResponse.transactions.push(transactionObj);
        }
      }

      if (query.TigoTransaction) {
        // && this.userController.checkAllowedAction(userRoles, RoleMappings['FETCH_TIGO_TRANSACTIONS'])) {
        finalResponse.headers.push('TigoTransaction');
        const callOptions: any = {
          apiPath: ApiList['FETCH_TIGO_TRANSACTIONS'],
          body: {
            where: {
              ...Utils.fetchTimestampFilter(query),
              PaymentVendorID: query.PaymentVendorID,
            },
          },
        };
        const [tigoTransactionsError, tigoTransactions]: any[] = await Utils.executePromise(
          Utils.callRequest(callOptions),
        );
        if (tigoTransactionsError) {
          log.error('---tigoTransactionsError---', tigoTransactionsError);
          return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
        } else if (
          !(tigoTransactions?.success || tigoTransactions?.data?.data?.tigoTransactions?.length)
        ) {
          log.info(
            '---!(tigoTransactions?.success || tigoTransactions?.data?.data?.tigoTransactions)---',
          );
          return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
        }
        log.info('---tigoTransactions---');
        const transactionObj: InterfaceList.GraphResopnseInstance = {
          name: 'TigoTransaction',
          data: [...defaultTransactionsCount],
        };
        if (tigoTransactions?.data?.data?.tigoTransactions?.length) {
          tigoTransactions.data.data.tigoTransactions.forEach((val: any) => {
            const dateIndex: number = finalResponse.dates.indexOf(
              Utils.fetchFormattedTimestamp({ timestamp: val.CreatedAt, format: DateFormat }),
            );
            if (dateIndex > -1) {
              if (eval(query?.Amount) && parseFloat(val.Amount)) {
                transactionObj.data[dateIndex] += parseFloat(val.Amount);
              } else {
                transactionObj.data[dateIndex]++;
              }
            }
          });
          finalResponse.transactions.push(transactionObj);
        }
      }

      if (query.VodacomTransaction) {
        // && this.userController.checkAllowedAction(userRoles, RoleMappings['FETCH_VODACOM_TRANSACTIONS'])) {
        finalResponse.headers.push('VodacomTransaction');
        const callOptions: any = {
          apiPath: ApiList['FETCH_VODACOM_TRANSACTIONS'],
          body: {
            where: {
              ...Utils.fetchTimestampFilter(query),
              PaymentVendorID: query.PaymentVendorID,
            },
          },
        };
        const [vodacomTransactionsError, vodacomTransactions]: any[] = await Utils.executePromise(
          Utils.callRequest(callOptions),
        );
        if (vodacomTransactionsError) {
          log.error('---vodacomTransactionsError---', vodacomTransactionsError);
          return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
        } else if (
          !(
            vodacomTransactions?.success ||
            vodacomTransactions?.data?.data?.vodacomTransactions?.length
          )
        ) {
          log.info(
            '---!(vodacomTransactions?.success || vodacomTransactions?.data?.data?.vodacomTransactions)---',
          );
          return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
        }
        log.info('---vodacomTransactions---');
        const transactionObj: InterfaceList.GraphResopnseInstance = {
          name: 'VodacomTransaction',
          data: [...defaultTransactionsCount],
        };
        if (vodacomTransactions?.data?.data?.vodacomTransactions?.length) {
          vodacomTransactions.data.data.vodacomTransactions.forEach((val: any) => {
            const dateIndex: number = finalResponse.dates.indexOf(
              Utils.fetchFormattedTimestamp({ timestamp: val.CreatedAt, format: DateFormat }),
            );
            if (dateIndex > -1) {
              if (eval(query?.Amount) && parseFloat(val.Amount)) {
                transactionObj.data[dateIndex] += parseFloat(val.Amount);
              } else {
                transactionObj.data[dateIndex]++;
              }
            }
          });
          finalResponse.transactions.push(transactionObj);
        }
      }

      if (query.ZantelTransaction) {
        // && this.userController.checkAllowedAction(userRoles, RoleMappings['FETCH_ZANTEL_TRANSACTIONS'])) {
        finalResponse.headers.push('ZantelTransaction');
        const callOptions: any = {
          apiPath: ApiList['FETCH_ZANTEL_TRANSACTIONS'],
          body: {
            where: {
              ...Utils.fetchTimestampFilter(query),
              PaymentVendorID: query.PaymentVendorID,
            },
          },
        };
        const [zantelTransactionsError, zantelTransactions]: any[] = await Utils.executePromise(
          Utils.callRequest(callOptions),
        );
        if (zantelTransactionsError) {
          log.error('---zantelTransactionsError---', zantelTransactionsError);
          return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
        } else if (
          !(
            zantelTransactions?.success ||
            zantelTransactions?.data?.data?.zantelTransactions?.length
          )
        ) {
          log.info(
            '---!(zantelTransactions?.success || zantelTransactions?.data?.data?.zantelTransactions)---',
          );
          return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
        }
        log.info('---zantelTransactions---');
        const transactionObj: InterfaceList.GraphResopnseInstance = {
          name: 'ZantelTransaction',
          data: [...defaultTransactionsCount],
        };
        if (zantelTransactions?.data?.data?.zantelTransactions?.length) {
          zantelTransactions.data.data.zantelTransactions.forEach((val: any) => {
            const dateIndex: number = finalResponse.dates.indexOf(
              Utils.fetchFormattedTimestamp({ timestamp: val.CreatedAt, format: DateFormat }),
            );
            if (dateIndex > -1) {
              if (eval(query?.Amount) && parseFloat(val.Amount)) {
                transactionObj.data[dateIndex] += parseFloat(val.Amount);
              } else {
                transactionObj.data[dateIndex]++;
              }
            }
          });
          finalResponse.transactions.push(transactionObj);
        }
      }

      log.info('---fetchFilterBasedReport.finalResponse---');
      return {
        messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
        data: { ...finalResponse },
      };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  @authenticate(JWT_STRATEGY_NAME)
  public async fetchReportsForLabel(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { query, user }: any = request;
    try {
      log.info('---fetchReportsForLabel---');

      if (!query.ReportType) {
        log.info('---messageCode: ResponseMappings[BAD_REQUEST]---');
        return { messageCode: ResponseMappings['BAD_REQUEST'] };
      }

      const isMarket: boolean = !!(query.ReportType == Market);
      const isLabel: boolean = !!(query.ReportType == Label);
      const finalResponse: InterfaceList.TransactionResponse = {
        AirtelTransaction: [],
        HalotelTransaction: [],
        TigoTransaction: [],
        VodacomTransaction: [],
        ZantelTransaction: [],
      };
      const filter: Filter = {
        fields: {
          Status: true,
          Amount: true,
          CreatedAt: true,
        },
      };
      if (isMarket) {
        filter.where = {};
      } else {
        filter.where = {
          ...Utils.fetchTimestampFilter(query),
          PaymentVendorID: user.PaymentVendorID,
        };
      }

      if ((isLabel && query.AirtelTransaction) || isMarket)
        finalResponse.AirtelTransaction = await this.airtelController.fetchAirtelTransactionsCount(
          filter,
        );

      if ((isLabel && query.HalotelTransaction) || isMarket)
        finalResponse.HalotelTransaction = await this.halotelController.fetchHalotelTransactionsCount(
          filter,
        );

      if ((isLabel && query.TigoTransaction) || isMarket)
        finalResponse.TigoTransaction = await this.tigoController.fetchTigoTransactionsCount(
          filter,
        );

      if ((isLabel && query.VodacomTransaction) || isMarket)
        finalResponse.VodacomTransaction = await this.vodacomController.fetchVodacomTransactionsCount(
          filter,
        );

      if ((isLabel && query.ZantelTransaction) || isMarket)
        finalResponse.ZantelTransaction = await this.zantelController.fetchZantelTransactionsCount(
          filter,
        );

      log.info('---fetchReportsForLabel---');

      if (
        (isLabel && query.AirtelTransaction && !finalResponse.AirtelTransaction?.length) ||
        (query.HalotelTransaction && !finalResponse.HalotelTransaction?.length) ||
        (query.TigoTransaction && !finalResponse.TigoTransaction?.length) ||
        (query.VodacomTransaction && !finalResponse.VodacomTransaction?.length) ||
        (query.ZantelTransaction && !finalResponse.ZantelTransaction?.length)
      ) {
        log.info('---not.found---');
        return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
      }
      const combinedTransactions: any[] = [].concat(
        finalResponse.AirtelTransaction,
        finalResponse.HalotelTransaction,
        finalResponse.TigoTransaction,
        finalResponse.VodacomTransaction,
        finalResponse.ZantelTransaction,
      );
      log.info('---combinedTransactions---');

      switch (query.ReportType) {
        case Label:
          const labelResp: InterfaceList.FilterBasedLabelReport = this.formatResponseForLabelFunction(
            query,
            combinedTransactions,
          );
          log.info('---formatResponseForLabelFunction.labelResp---');
          return {
            messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
            data: { ...labelResp },
          };

        case Market:
          const marketResp: InterfaceList.FilterBasedMarketReport = this.formatResponseForMarketFunction(
            query,
            combinedTransactions,
          );
          log.info('---formatResponseForMarketFunction.marketResp---');
          return {
            messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
            data: { ...marketResp },
          };

        default:
          log.info('---messageCode: ResponseMappings[BAD_REQUEST]---');
          return { messageCode: ResponseMappings['BAD_REQUEST'] };
      }
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  public formatResponseForLabelFunction(query: any, transactions: any): any {
    const finalResponse: InterfaceList.FilterBasedLabelReport = {
      DateRange: [],
      CancelledCount: [],
      PendingCount: [],
      SuccessCount: [],
    };
    if (query.StartDate && query.EndDate) {
      for (let x: number = 0; x < 366; x++) {
        const pushedDate: string = Utils.addCalculatedTimestamp({
          timestamp: Utils.fetchFormattedTimestamp({
            timestamp: query.StartDate,
            format: DateFormat,
          }),
          offset: x,
          unit: DayFormat,
        });
        finalResponse.DateRange.push(
          Utils.fetchFormattedTimestamp({ timestamp: pushedDate, format: DateFormat }),
        );
        finalResponse.SuccessCount.push(0);
        finalResponse.PendingCount.push(0);
        finalResponse.CancelledCount.push(0);
        if (
          Utils.fetchFormattedTimestamp({ timestamp: pushedDate, format: DateFormat }) ==
          Utils.fetchFormattedTimestamp({ timestamp: query.EndDate, format: DateFormat })
        ) {
          break;
        }
      }
    } else {
      /* HERE: the indices are in the descending order as the dates
      are to be saves in the ascending order */
      for (let x: number = 2; x > 0; x--) {
        finalResponse.DateRange.push(
          Utils.subtractCalculatedTimestamp({
            timestamp: Utils.fetchCurrentTimestamp(),
            offset: x,
            unit: DayFormat,
          }),
        );
        finalResponse.SuccessCount.push(0);
        finalResponse.PendingCount.push(0);
        finalResponse.CancelledCount.push(0);
      }
    }

    transactions.forEach((val: any) => {
      const valDate: string = Utils.fetchFormattedTimestamp({
        timestamp: val.CreatedAt,
        format: DateFormat,
      });
      const dateIndex: number = finalResponse.DateRange.indexOf(valDate);
      if (dateIndex > -1) {
        switch (true) {
          case !!([STATUS.ACTIVE, STATUS.COMPLETED, STATUS.SUCCESS].indexOf(val.Status) > -1):
            if (eval(query?.Amount))
              // To fetch the total amount
              finalResponse.SuccessCount[dateIndex] += val.Amount ? parseFloat(val.Amount) : 0;
            // To fetch the transaction count
            else finalResponse.SuccessCount[dateIndex] += 1;
            break;

          case !!([STATUS.PENDING].indexOf(val.Status) > -1):
            if (eval(query?.Amount))
              finalResponse.PendingCount[dateIndex] += val.Amount ? parseFloat(val.Amount) : 0;
            else finalResponse.PendingCount[dateIndex] += 1;
            break;

          default:
            if (eval(query?.Amount))
              finalResponse.CancelledCount[dateIndex] += val.Amount ? parseFloat(val.Amount) : 0;
            else finalResponse.CancelledCount[dateIndex] += 1;
            break;
        }
      }
    });
    return finalResponse;
  }

  public formatResponseForMarketFunction(query: any, transactions: any): any {
    const finalResponse: InterfaceList.FilterBasedMarketReport = {
      Marketplace: 0,
      LastMonth: 0,
      LastWeek: 0,
      Today: 0,
    };
    const lastWeekRange: [string, string] = Utils.fetchPreviousWeekRange();
    log.info('---lastWeekRange---');
    log.info(lastWeekRange);

    const lastMonthRange: [string, string] = Utils.fetchPreviousMonthRange();
    log.info('---lastMonthRange---');
    log.info(lastMonthRange);

    transactions.forEach((val: any) => {
      if (val && Object.keys(val).length) {
        if (eval(query?.Amount))
          finalResponse.Marketplace += val.Amount ? parseFloat(val.Amount) : 0;
        else finalResponse.Marketplace += 1;

        // To check in the previous month range
        if (
          Utils.fetchFormattedTimestamp({ timestamp: val.CreatedAt }) > lastMonthRange[0] &&
          Utils.fetchFormattedTimestamp({ timestamp: val.CreatedAt }) < lastMonthRange[1]
        ) {
          if (eval(query?.Amount))
            finalResponse.LastMonth += val.Amount ? parseFloat(val.Amount) : 0;
          else finalResponse.LastMonth += 1;
        }

        // To check in the previous week range
        if (
          Utils.fetchFormattedTimestamp({ timestamp: val.CreatedAt }) > lastWeekRange[0] &&
          Utils.fetchFormattedTimestamp({ timestamp: val.CreatedAt }) < lastWeekRange[1]
        ) {
          if (eval(query?.Amount))
            finalResponse.LastWeek += val.Amount ? parseFloat(val.Amount) : 0;
          else finalResponse.LastWeek += 1;
        }

        // To check in the current day
        if (
          val.CreatedAt ==
          Utils.fetchFormattedTimestamp({
            timestamp: Utils.fetchCurrentTimestamp(),
            format: DateFormat,
          })
        ) {
          if (eval(query?.Amount)) finalResponse.Today += val.Amount ? parseFloat(val.Amount) : 0;
          else finalResponse.Today += 1;
        }
      }
    });
    return finalResponse;
  }
}
