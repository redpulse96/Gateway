import {
  AirtelTransactions,
  HalotelTransactions,
  TigoTransactions,
  VodacomTransactions,
  ZantelTransactions,
} from '.';
import { mismatchReportingDef } from '../api-specs/mismatch-reporting';
import { api, authenticate, inject, repository, Request, RestBindings, Utils } from '../common';
import {
  InterfaceList,
  JWT_STRATEGY_NAME,
  paymentGateways,
  ResponseMappings,
  STATUS,
} from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { OriginatorFormatMapping } from '../models';
import { MismatchReportingRepository, OriginatorFormatMappingRepository } from '../repositories';
const log = new LoggingInterceptor('mismatch-reporting.Controller');

@api(mismatchReportingDef)
export class MismatchReportingController {
  constructor(
    @repository(MismatchReportingRepository)
    public mismatchReportingRepository: MismatchReportingRepository,

    @repository(OriginatorFormatMappingRepository)
    public originatorFormatMappingRepository: OriginatorFormatMappingRepository,

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
  async reportMismatch(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    try {
      const { body }: any = request;
      const inputRequests: any = body.JsonData;

      const airtelTransactionsFilter: any = {};
      const airtelTransactionRequests: any = [];
      let isAirtelRequest: boolean = false;

      const halotelTransactionsFilter: any = {};
      const halotelTransactionRequests: any = [];
      let isHalotelRequest: boolean = false;

      const tigoTransactionsFilter: any = {};
      const tigoTransactionRequests: any = [];
      let isTigoRequest: boolean = false;

      const zantelTransactionsFilter: any = {};
      const zantelTransactionRequests: any = [];
      let isZantelRequest: boolean = false;

      const vodacomTransactionsFilter: any = {};
      const vodacomTransactionRequests: any = [];
      let isVodacomRequest: boolean = false;

      let finalResponse: any[] = [];
      let createMisMatchArr: any = [];

      const originatorFormattingFilter: any = {
        where: {
          or: [
            {
              CompanyCode: { inq: [].concat(body.CompanyCodes) },
              Status: STATUS.ACTIVE,
            },
            {
              PartnerCode: { inq: [].concat(body.PartnerCodes) },
              Status: STATUS.ACTIVE,
            },
          ],
        },
      };
      log.info('---inputRequests---');
      log.info(inputRequests);

      if (inputRequests.length) {
        const [originatorFormatError, originatorFormats]: any[] = await Utils.executePromise(
          this.originatorFormatMappingRepository.find(originatorFormattingFilter),
        );
        if (originatorFormatError) {
          log.error('---originatorFormatError---');
          log.error(originatorFormatError);
          return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
        } else if (!originatorFormats?.length) {
          log.error('---!originatorFormats?.length---');
          return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
        }
        log.info('---originatorFormats---');
        log.info(originatorFormats);

        originatorFormats.forEach((val: OriginatorFormatMapping) => {
          inputRequests.forEach((elem: any) => {
            switch (val.PartnerCode) {
              case paymentGateways['AIRTEL']:
                isAirtelRequest = true;

                airtelTransactionRequests.push({ from: { ...elem }, inHouse: { ...val } });
                airtelTransactionsFilter.where = {
                  ...Utils.fetchTimestampFilter({}),
                  ReferenceID: airtelTransactionsFilter?.where?.ReferenceID?.inq.push(
                    elem[val.RefernceID],
                  ),
                };
                break;

              case paymentGateways['HALOTEL']:
                isHalotelRequest = true;
                halotelTransactionRequests.push({ from: { ...elem }, inHouse: { ...val } });
                halotelTransactionsFilter.where = {
                  ...Utils.fetchTimestampFilter({}),
                  ReferenceID: halotelTransactionsFilter?.where?.ReferenceID?.inq.push(
                    elem[val.RefernceID],
                  ),
                };
                break;

              case paymentGateways['TIGO']:
                isTigoRequest = true;
                tigoTransactionRequests.push({ from: { ...elem }, inHouse: { ...val } });
                tigoTransactionsFilter.where = {
                  ...Utils.fetchTimestampFilter({}),
                  ReferenceID: tigoTransactionsFilter?.where?.ReferenceID?.inq.push(
                    elem[val.RefernceID],
                  ),
                };
                break;

              case paymentGateways['VODACOM']:
                isVodacomRequest = true;
                zantelTransactionRequests.push({ from: { ...elem }, inHouse: { ...val } });
                vodacomTransactionsFilter.where = {
                  ...Utils.fetchTimestampFilter({}),
                  ReferenceID: vodacomTransactionsFilter?.where?.ReferenceID?.inq.push(
                    elem[val.RefernceID],
                  ),
                };
                break;

              case paymentGateways['ZANTEL']:
                isZantelRequest = true;
                vodacomTransactionRequests.push({ from: { ...elem }, inHouse: { ...val } });
                zantelTransactionsFilter.where = {
                  ...Utils.fetchTimestampFilter({}),
                  ReferenceID: zantelTransactionsFilter?.where?.ReferenceID?.inq.push(
                    elem[val.RefernceID],
                  ),
                };
                break;

              default:
                break;
            }
          });
        });

        if (isAirtelRequest) {
          const [airtelTransactionsError, airtelTransactions]: any[] = await Utils.executePromise(
            this.airtelController.fetchMultipleTransactions(airtelTransactionsFilter),
          );
          if (airtelTransactionsError) {
            log.error('---airtelTransactionsError---');
            log.error(airtelTransactionsError);
            return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
          } else if (
            !airtelTransactions?.success ||
            !airtelTransactions?.data?.airtelTransactions?.length
          ) {
            log.info(
              '---!airtelTransactions?.success || !airtelTransactions?.data?.airtelTransactions?.length---',
            );
          } else {
            log.info('---airtelTransactions?.data?.airtelTransactions---');
            log.info(airtelTransactions.data.airtelTransactions);
            log.info('------airtelTransactionRequests--------');
            log.info(airtelTransactionRequests);
            const formattedResponse: any = this.transactionFormatterFunction(
              paymentGateways['AIRTEL'],
              body.CompanyCodes[0],
              airtelTransactionRequests,
              airtelTransactions.data.airtelTransactions,
            );
            finalResponse = finalResponse.concat(
              finalResponse,
              formattedResponse.transactionsResponse,
            );
            createMisMatchArr = [].concat(createMisMatchArr, formattedResponse.createMismatchArr);
          }
        }

        if (isHalotelRequest) {
          const [halotelTransactionsError, halotelTransactions]: any[] = await Utils.executePromise(
            this.halotelController.fetchMultipleTransactions(halotelTransactionsFilter),
          );
          if (halotelTransactionsError) {
            log.error('---halotelTransactionsError---');
            log.error(halotelTransactionsError);
            return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
          } else if (
            !halotelTransactions?.success ||
            !halotelTransactions?.data?.halotelTransactions?.length
          ) {
            log.info(
              '---!halotelTransactions?.success || !halotelTransactions?.data?.halotelTransactions?.length---',
            );
          } else {
            log.info('---halotelTransactions?.data?.halotelTransactions---');
            log.info(halotelTransactions.data.halotelTransactions);
            log.info('------halotelTransactionRequests--------');
            log.info(halotelTransactionRequests);
            const formattedResponse = this.transactionFormatterFunction(
              paymentGateways['HALOTEL'],
              body.CompanyCodes[0],
              halotelTransactionRequests,
              halotelTransactions.data.halotelTransactions,
            );
            finalResponse = finalResponse.concat(
              finalResponse,
              formattedResponse.transactionsResponse,
            );
            createMisMatchArr = [].concat(createMisMatchArr, formattedResponse.createMismatchArr);
          }
        }

        if (isTigoRequest) {
          const [tigoTransactionsError, tigoTransactions]: any[] = await Utils.executePromise(
            this.tigoController.fetchMultipleTransactions(tigoTransactionsFilter),
          );
          if (tigoTransactionsError) {
            log.error('---tigoTransactionsError---');
            log.error(tigoTransactionsError);
            return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
          } else if (
            !tigoTransactions?.success ||
            !tigoTransactions?.data?.tigoTransactions?.length
          ) {
            log.info(
              '---!tigoTransactions?.success || !tigoTransactions?.data?.tigoTransactions?.length---',
            );
          } else {
            log.info('---tigoTransactions?.data?.tigoTransactions---');
            log.info(tigoTransactions.data.tigoTransactions);
            log.info('------tigoTransactionRequests--------');
            log.info(tigoTransactionRequests);
            const formattedResponse = this.transactionFormatterFunction(
              paymentGateways['TIGO'],
              body.CompanyCodes[0],
              tigoTransactionRequests,
              tigoTransactions.data.tigoTransactions,
            );
            finalResponse = finalResponse.concat(
              finalResponse,
              formattedResponse.transactionsResponse,
            );
            createMisMatchArr = [].concat(createMisMatchArr, formattedResponse.createMismatchArr);
          }
        }

        if (isVodacomRequest) {
          const [vodacomTransactionsError, vodacomTransactions]: any[] = await Utils.executePromise(
            this.vodacomController.fetchMultipleTransactions(vodacomTransactionsFilter),
          );
          if (vodacomTransactionsError) {
            log.error('---vodacomTransactionsError---');
            log.error(vodacomTransactionsError);
            return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
          } else if (
            !vodacomTransactions?.success ||
            !vodacomTransactions?.data?.vodacomTransactions?.length
          ) {
            log.info(
              '---!vodacomTransactions?.success || !vodacomTransactions?.data?.vodacomTransactions?.length---',
            );
          } else {
            log.info('---vodacomTransactions?.data?.vodacomTransactions---');
            log.info(vodacomTransactions.data.vodacomTransactions);
            log.info('------vodacomTransactionRequests--------');
            log.info(vodacomTransactionRequests);
            const formattedResponse = this.transactionFormatterFunction(
              paymentGateways['VODACOM'],
              body.CompanyCodes[0],
              vodacomTransactionRequests,
              vodacomTransactions.data.vodacomTransactions,
            );
            finalResponse = finalResponse.concat(
              finalResponse,
              formattedResponse.transactionsResponse,
            );
            createMisMatchArr = [].concat(createMisMatchArr, formattedResponse.createMismatchArr);
          }
        }

        if (isZantelRequest) {
          const [zantelTransactionsError, zantelTransactions]: any[] = await Utils.executePromise(
            this.zantelController.fetchMultipleTransactions(zantelTransactionsFilter),
          );
          if (zantelTransactionsError) {
            log.error('---zantelTransactionsError---');
            log.error(zantelTransactionsError);
            return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
          } else if (
            !zantelTransactions?.success ||
            !zantelTransactions?.data?.zantelTransactions?.length
          ) {
            log.info(
              '---!zantelTransactions?.success || !zantelTransactions?.data?.zantelTransactions?.length---',
            );
          } else {
            log.info('---zantelTransactions?.data?.zantelTransactions---');
            log.info(zantelTransactions.data.zantelTransactions);
            log.info('------zantelTransactionRequests--------');
            log.info(zantelTransactionRequests);
            const formattedResponse = this.transactionFormatterFunction(
              paymentGateways['ZANTEL'],
              body.CompanyCodes[0],
              zantelTransactionRequests,
              zantelTransactions.data.zantelTransactions,
            );
            finalResponse = finalResponse.concat(
              finalResponse,
              formattedResponse.transactionsResponse,
            );
            createMisMatchArr = [].concat(createMisMatchArr, formattedResponse.createMismatchArr);
          }
        }

        log.info('---createMisMatchArr---');
        log.info(createMisMatchArr);
        if (!createMisMatchArr?.length) {
          return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
        }

        const [mismatchReportError, mismatchReports]: any[] = await Utils.executePromise(
          this.mismatchReportingRepository.createAll(createMisMatchArr),
        );
        if (mismatchReportError) {
          log.error('---mismatchReportError---');
          log.error(mismatchReportError);
          return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
        } else if (!mismatchReports?.length) {
          log.error('---!mismatchReports?.length---');
          return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
        }
        log.info('---mismatchReports---');
        log.info(mismatchReports);
        return {
          messageCode: ResponseMappings['SUCCESS'],
          data: { mismatchReports: finalResponse },
        };
      } else {
        return { messageCode: ResponseMappings['BAD_REQUEST'] };
      }
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  @authenticate(JWT_STRATEGY_NAME)
  async fetchMismatchReports(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { query, user }: any = request;
    try {
      log.info('---fetchMismatchReports.query---');
      log.info(query);

      const filter: any = {
        where: {
          ...query,
          Status: STATUS.ACTIVE,
        },
        order: query.order,
        skip: Utils.fetchSkipFilter({ skip: parseInt(query.skip), limit: parseInt(query.limit) }),
        limit: parseInt(query.limit) || undefined,
      };
      user?.PaymentVendorID && (filter.where.PaymentVendorID = user.PaymentVendorID);
      const [mismatchReportError, mismatchReports]: any[] = await Utils.executePromise(
        this.mismatchReportingRepository.find(filter),
      );
      if (mismatchReportError) {
        log.error('---mismatchReportError---');
        log.error(mismatchReportError);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      } else if (!mismatchReports?.length) {
        log.info('---!mismatchReports?.length---');
        return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
      }
      log.info('---mismatchReports---');
      log.info(mismatchReports);
      return {
        messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
        data: { mismatchReports },
      };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  @authenticate(JWT_STRATEGY_NAME)
  async fetchOriginatorMapping(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { query, user }: any = request;
    try {
      log.info('---fetchOriginatorMapping.query---');
      log.info(query);

      const filter: any = {
        where: { Status: STATUS.ACTIVE },
        order: query.order,
        skip: Utils.fetchSkipFilter({ skip: parseInt(query.skip), limit: parseInt(query.limit) }),
        limit: parseInt(query.limit) || undefined,
      };
      user?.PaymentVendorID && (filter.where.PaymentVendorID = user.PaymentVendorID);
      const [originatorFormatError, originatorFormats]: any[] = await Utils.executePromise(
        this.originatorFormatMappingRepository.find(filter),
      );
      if (originatorFormatError) {
        log.error('---originatorFormatError---');
        log.error(originatorFormatError);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      } else if (!originatorFormats?.length) {
        log.info('---!originatorFormats?.length---');
        return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
      }
      const resp: any = {
        CompanyCodes: [],
        PartnerCodes: [],
      };
      originatorFormats.forEach((elem: any) => {
        resp.CompanyCodes.indexOf(elem.CompanyCode) == -1 &&
          resp.CompanyCodes.push(elem.CompanyCode);

        resp.PartnerCodes.indexOf(elem.PartnerCode) == -1 &&
          resp.PartnerCodes.push(elem.PartnerCode);
      });
      log.info('---originatorFormats---');
      log.info(originatorFormats);
      return {
        messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
        data: { ...resp },
      };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  private transactionFormatterFunction(
    type: any,
    companyCode: any,
    externalTransactions: any,
    internalTransactions: any,
  ): any {
    const createMismatchArr: any = [];
    const transactionsResponse: any = [];
    const mappedObjects: any = {};
    internalTransactions.forEach((elem: any) => {
      mappedObjects[elem.ExternalReferenceID] = { ...elem };
    });
    console.log('---------mappedObjects-----------');
    console.dir(mappedObjects);
    externalTransactions.forEach((elem: any) => {
      const internalInstance: any = mappedObjects[elem.from[elem.inHouse['ExternalReferenceID']]];
      const referenceId: string = elem.from[elem.inHouse['ExternalReferenceID']];
      const senderMsisdn: string = elem.from[elem.inHouse['FromMsisdn']];
      const referenceMsisdn: string = elem.from[elem.inHouse['ReferenceMsisdn']];
      const amount: string = elem.from[elem.inHouse['Amount']];
      console.log('--------internalInstance-------------');
      console.dir(internalInstance);
      console.log("--------elem.from[elem.inHouse['ExternalReferenceID']]-------------");
      console.dir(elem.from[elem.inHouse['ExternalReferenceID']]);
      console.dir(elem.from[elem.inHouse['FromMsisdn']]);
      console.dir(elem.from[elem.inHouse['ReferenceMsisdn']]);
      if (internalInstance?.ExternalReferenceID) {
        const misMatchReason: string[] = [];

        if ([internalInstance.SenderMsisdn, internalInstance.MSISDN].indexOf(senderMsisdn) < 0) {
          misMatchReason.push(
            `external_senderMsisdn: ${senderMsisdn || null}, internal_senderMsisdn: ${
              internalInstance.SenderMsisdn || null
            }`,
          );
        }
        if (
          [internalInstance.ReferenceMsisdn, internalInstance.BillerMSISDN].indexOf(
            referenceMsisdn,
          ) < 0
        ) {
          misMatchReason.push(
            `external_referenceMsisdn: ${referenceMsisdn || null}, internal_referenceMsisdn: ${
              internalInstance.ReferenceMsisdn || null
            }`,
          );
        }
        if ([internalInstance.Amount].indexOf(amount) < 0) {
          misMatchReason.push(
            `external_amount: ${amount || null}, internal_amount: ${
              internalInstance.Amount || null
            }`,
          );
        }
        const obj: any = {
          isMatched: misMatchReason.length == 0,
          value: {
            Type: type,
            CompanyCode: companyCode,
            ExternalReferenceID: {
              from: referenceId || null,
              inHouse: internalInstance.ExternalReferenceID,
            },
            SenderMsisdn: { from: senderMsisdn || null, inHouse: internalInstance.SenderMsisdn },
            ReferenceMsisdn: {
              from: referenceMsisdn || null,
              inHouse: internalInstance.ReferenceMsisdn,
            },
            Amount: { from: amount || null, inHouse: internalInstance.Amount },
            IsMatched: misMatchReason.length == 0,
            PaymentStatus: elem.from[elem.inHouse['PaymentStatus']],
            Status: STATUS.ACTIVE,
            Reason: misMatchReason.length != 0 ? misMatchReason.join(', ') : null,
          },
        };
        transactionsResponse.push(obj);
        createMismatchArr.push(obj.value);
      } else {
        const obj: any = {
          isMatched: false,
          value: {
            Type: type,
            CompanyCode: companyCode,
            ExternalReferenceID: { from: referenceId || null, inHouse: null },
            SenderMsisdn: { from: senderMsisdn || null, inHouse: null },
            ReferenceMsisdn: { from: referenceMsisdn || null, inHouse: null },
            Amount: { from: amount || null, inHouse: null },
            IsMatched: false,
            Status: STATUS.ACTIVE,
            PaymentStatus: elem.from[elem.inHouse['PaymentStatus']],
            Reason: `external_ReferenceID: ${referenceId || null}, internal_ReferenceID: null,
            external_senderMsisdn: ${senderMsisdn || null}, internal_senderMsisdn: null,
            external_ReferenceMsisdn: ${referenceMsisdn || null}, internal_ReferenceMsisdn: null,
            external_Amount: ${amount || null}, internal_Amount: null`,
          },
        };
        transactionsResponse.push(obj);
        createMismatchArr.push(obj.value);
      }
    });
    return {
      createMismatchArr,
      transactionsResponse,
    };
  }
}
