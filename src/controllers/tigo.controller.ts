/* eslint-disable no-invalid-this */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MnoMerchantsController, PaymentVendorController } from '.';
import { tigoDef } from '../api-specs/tigo-transactions';
import {
  api,
  Filter,
  GatewayInterface,
  HttpErrors,
  inject,
  repository,
  Request,
  RestBindings,
  Utils,
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
  TigoTransactionsConstants,
} from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { RabbitMqProducer } from '../queue';
import {
  MnoMerchantsRepository,
  PaymentPartnerRepository,
  PaymentVendorRepository,
} from '../repositories';
export const tigoRabbitMq = new RabbitMqProducer('gateway');
const log = new LoggingInterceptor('tigo.Controller');
const { DateFormat, TimeFormat } = DateTimeFormats;

@api(tigoDef)
export class TigoTransactions {
  constructor(
    @repository(PaymentVendorRepository)
    private paymentVendorRepository: PaymentVendorRepository,

    @repository(PaymentPartnerRepository)
    private paymentPartnerRepository: PaymentPartnerRepository,

    @repository(MnoMerchantsRepository)
    private mnoMerchantsRepository: MnoMerchantsRepository,
  ) {}
  private tigoGatewayParams: GatewayInterface = new GatewayInterface(paymentGateways['TIGO']);
  private tigoTransactionsConstants: any = TigoTransactionsConstants;
  private mnoMerchantsController: MnoMerchantsController = new MnoMerchantsController(
    this.mnoMerchantsRepository,
  );
  private paymentVendorController: PaymentVendorController = new PaymentVendorController(
    this.paymentVendorRepository,
    this.paymentPartnerRepository,
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

  async querysubscriberFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body }: any = request;
    try {
      return await this.paymentPartnerRepository
        .findOne({
          where: {
            CollectionAccountNumber: body.COMMAND.COMPANYNAME,
            Status: STATUS.ACTIVE,
          },
          include: [
            {
              relation: 'payment_vendor',
            },
          ],
        })
        .then(async (partner: any) => {
          if (partner && partner?.payment_vendor) {
            let userFound = null;
            const addTigoTransactionObj: any = {
              IncomingRequestType: SERVICE_TYPE.USSD_NORMAL,
              PartnerCode: partner.PartnerCode,
              PaymentVendorID: partner.PaymentVendorID,
              MSISDN: body.COMMAND.MSISDN,
              BillerMSISDN: body.COMMAND.CUSTOMERREFERENCEID,
              CUSTOMERREFERENCEID: body.COMMAND.CUSTOMERREFERENCEID,
              Amount: body.COMMAND.AMOUNT,
              COMPANYNAME: body.COMMAND.COMPANYNAME,
              TYPE: body.COMMAND.TYPE,
              Status: STATUS.PENDING,
              TXNID: body.COMMAND.TXNID,
              ExternalReferenceID: body.COMMAND.TXNID,
              ReferenceID: Utils.generateReferenceID(
                body.COMMAND.MSISDN,
                body.COMMAND.CUSTOMERREFERENCEID,
              ),
              Operations: [
                {
                  operation: 'querysubscriber',
                  requestBody: body.COMMAND,
                  Status: STATUS.PENDING,
                },
              ],
            };
            const checkForUserObj: any = {
              ...body.COMMAND,
              senderMsisdn: body.COMMAND.CUSTOMERREFERENCEID,
            };
            userFound = await this.paymentVendorController.checkUserForAzamTV(checkForUserObj);
            if (!userFound || (userFound && !userFound.success)) {
              addTigoTransactionObj.Status = STATUS.FAILURE;
            } else if (userFound?.isFromMQ) {
              addTigoTransactionObj.Status = STATUS.COMPLETED;
              addTigoTransactionObj.Operations.push({
                operation: 'checkUserForAzamTV',
                requestBody: userFound.requestBody,
                responseBody: userFound.responseBody,
                Status: addTigoTransactionObj.Status,
              });
            } else {
              addTigoTransactionObj.Status = STATUS.COMPLETED;
              const connectedAppsObj: InterfaceList.CheckUserForConnectedAppInterface = {
                routeInfo: partner.payment_vendor,
                request: {
                  operator: 'Tigo',
                  ReferenceID: addTigoTransactionObj.ReferenceID,
                  utilityref: body.COMMAND.CUSTOMERREFERENCEID,
                  Amount: body.COMMAND.AMOUNT,
                  TXNID: body.COMMAND.TXNID,
                  MSISDN: body.COMMAND.MSISDN,
                },
              };
              addTigoTransactionObj.ReferenceID = connectedAppsObj.request.ReferenceID;
              addTigoTransactionObj.ExternalReferenceID = connectedAppsObj.request.TXNID;
              userFound = await this.paymentVendorController.checkUserForConnectedApp(
                connectedAppsObj,
              );
              addTigoTransactionObj.Status = STATUS.COMPLETED;
              addTigoTransactionObj.Operations.push({
                operation: 'checkUserForConnectedApp',
                requestBody: userFound.requestBody,
                responseBody: userFound.responseBody,
                Status: addTigoTransactionObj.Status,
              });
            }
            const callGatewayOptions: any = {
              apiName: 'addTransaction',
              body: { ...addTigoTransactionObj },
            };
            await this.tigoGatewayParams.callGateway(callGatewayOptions);
            log.info('---addTigoTransactions---');

            if (userFound.success && addTigoTransactionObj.Status == STATUS.COMPLETED) {
              return {
                responseType: RESPONSE_TYPE['SUCCESS'],
                txnID: body.COMMAND.TXNID,
                refID: body.COMMAND.CUSTOMERREFERENCEID,
                result: 'TS',
                errorCode: 'error000',
                msisdn: body.COMMAND.MSISDN,
                flag: 'Y',
                content: userFound.data['RESPONSEINFO']['CUSTOMERINFO']['FIRSTNAME'],
              };
            } else {
              return {
                responseType: RESPONSE_TYPE['ERROR'],
                txnID: body.COMMAND.TXNID,
                refID: body.COMMAND.CUSTOMERREFERENCEID,
                result: 'TF',
                errorCode: 'error010',
                msisdn: body.COMMAND.MSISDN,
                flag: 'N',
                content: 'Not registered',
              };
            }
          }
        })
        .catch((error: any) => {
          log.info('in catch block you see', error);
          return {
            responseType: RESPONSE_TYPE['ERROR'],
            txnID: body.COMMAND.TXNID,
            refID: body.COMMAND.CUSTOMERREFERENCEID,
            result: 'TF',
            errorCode: 'error010',
            msisdn: body.COMMAND.MSISDN,
            flag: 'N',
            content: 'Not registered',
          };
        });
    } catch (error) {
      log.error('---processTigoSyncApiFunction.catch.err---', error);
      return {
        responseType: RESPONSE_TYPE['ERROR'],
        txnID: body.COMMAND.TXNID,
        refID: body.COMMAND.CUSTOMERREFERENCEID,
        result: 'TF',
        errorCode: 'error010',
        msisdn: body.COMMAND.MSISDN,
        flag: 'N',
        content: 'Not registered',
      };
    }
  }

  async processTigoSyncApiFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body }: any = request;
    try {
      let creationFlag: boolean = true;
      let failedFlag: boolean = false;
      const callGatewayOptions: any = {
        apiName: 'fetchTransaction',
        body: {
          where: {
            ExternalReferenceID: body.ReferenceID,
          },
        },
      };
      const [gatewayRequestErr, gatewayRequestRes]: any = await Utils.executePromise(
        this.tigoGatewayParams.callGateway(callGatewayOptions),
      );
      if (gatewayRequestErr) {
        log.error('---processTigoSyncApiFunction.gatewayRequestErr---', gatewayRequestErr);
        return {
          responseType: RESPONSE_TYPE['ERROR'],
          txnID: body.COMMAND.TXNID,
          refID: body.COMMAND.CUSTOMERREFERENCEID,
          result: 'TF',
          errorCode: 'error010',
          msisdn: body.COMMAND.MSISDN,
          flag: 'N',
          content: 'Payment Failed',
        };
      } else if (gatewayRequestRes?.success && gatewayRequestRes?.data?.tigoTransactions) {
        creationFlag = false;
      }
      return await this.paymentPartnerRepository
        .findOne({
          where: {
            CollectionAccountNumber: body.COMMAND.COMPANYNAME,
            Status: STATUS.ACTIVE,
          },
          include: [
            {
              relation: 'payment_vendor',
            },
          ],
        })
        .then(async (partner: any) => {
          if (partner && partner?.payment_vendor) {
            log.info('partner came is =====>');
            let userFound = null;
            const operationsList: any = [];
            if (!creationFlag) {
              [].concat(operationsList, gatewayRequestRes.data.tigoTransactions.Operations);
            }
            operationsList.push({
              operation: 'processTigoSyncApi',
              requestBody: body,
              Status: STATUS.PENDING,
            });
            const addTigoTransactionObj: any = {
              IncomingRequestType: SERVICE_TYPE.USSD_NORMAL,
              PartnerCode: partner.PartnerCode,
              PaymentVendorID: partner.PaymentVendorID,
              COMPANYNAME: body.COMMAND.COMPANYNAME,
              Amount: body.COMMAND.AMOUNT,
              TYPE: body.COMMAND.TYPE,
              MSISDN: body.COMMAND.MSISDN,
              BillerMSISDN: body.COMMAND.CUSTOMERREFERENCEID,
              CUSTOMERREFERENCEID: body.COMMAND.CUSTOMERREFERENCEID,
              Status: STATUS.PENDING,
              ExternalReferenceID: body.COMMAND.TXNID,
              TXNID: body.COMMAND.TXNID,
              Operations: operationsList,
              ReferenceID: Utils.generateReferenceID(
                body.COMMAND.MSISDN,
                body.COMMAND.CUSTOMERREFERENCEID,
              ),
            };
            if (
              partner &&
              this.tigoTransactionsConstants.AZAMTV_CONSTANT_SPID.indexOf(
                partner.CollectionAccountNumber,
              ) > -1
            ) {
              const checkForUserObj: any = {
                ...body.COMMAND,
                senderMsisdn: body.COMMAND.CUSTOMERREFERENCEID,
              };
              userFound = await this.paymentVendorController.checkUserForAzamTV(checkForUserObj);
            } else {
              const connectedAppsObj: InterfaceList.CheckUserForConnectedAppInterface = {
                routeInfo: partner.payment_vendor,
                request: {
                  operator: 'Tigo',
                  ReferenceID: Utils.generateReferenceID(body.COMMAND),
                  utilityref: body.COMMAND.CUSTOMERREFERENCEID,
                  Amount: body.COMMAND.AMOUNT,
                  TXNID: body.COMMAND.TXNID,
                  MSISDN: body.COMMAND.MSISDN,
                },
              };
              userFound = await this.paymentVendorController.checkUserForConnectedApp(
                connectedAppsObj,
              );
            }
            if (!userFound || !userFound?.success) {
              failedFlag = true;
              addTigoTransactionObj.Status = STATUS.FAILURE;
              addTigoTransactionObj.Operations.push({
                operation: 'checkUserForConnectedApp',
                requestBody: userFound?.requestBody,
                responseBody: userFound?.responseBody,
                Status: addTigoTransactionObj.Status,
              });
            } else if (userFound?.isFromMQ) {
              failedFlag = false;
              addTigoTransactionObj.Status = STATUS.PENDING;
              addTigoTransactionObj.Operations.push({
                operation: 'checkUserForAzamTV',
                requestBody: userFound.requestBody,
                responseBody: userFound.responseBody,
                Status: addTigoTransactionObj.Status,
              });
              const mqPaymentObject = {
                routeInfo: partner,
                request: {
                  operator: paymentGateways.TIGO,
                  smartCardNo: body.COMMAND.CUSTOMERREFERENCEID,
                  SenderMsisdn: body.COMMAND.MSISDN,
                  amount: body.COMMAND.AMOUNT,
                  reciptNo: addTigoTransactionObj.ExternalReferenceID,
                  referenceNo: addTigoTransactionObj.ReferenceID,
                },
              };
              log.info('---mqPaymentObject---');
              await this.paymentVendorController
                .paymentMQServices(mqPaymentObject)
                .then((mqPayRes: any) => {
                  log.info('---mqPayRes---');
                  if (mqPayRes.success) {
                    failedFlag = false;
                    addTigoTransactionObj.Status = STATUS.COMPLETED;
                  } else {
                    failedFlag = true;
                    addTigoTransactionObj.Status = STATUS.FAILURE;
                  }
                  addTigoTransactionObj.Operations.push({
                    operation: ApiList['PAYMENT_BY_MQ_SERVICE'],
                    requestBody: mqPayRes.requestBody,
                    responseBody: mqPayRes.responseBody,
                    Status: addTigoTransactionObj.Status,
                  });
                })
                .catch((mqPayErr: any) => {
                  log.error('---mqPayErr---', mqPayErr);
                  failedFlag = true;
                  addTigoTransactionObj.Status = STATUS.FAILURE;
                  addTigoTransactionObj.Operations.push({
                    operation: ApiList['PAYMENT_BY_MQ_SERVICE'],
                    requestBody: mqPayErr.requestBody,
                    responseBody: mqPayErr.responseBody,
                    Status: addTigoTransactionObj.Status,
                  });
                });
            } else {
              failedFlag = false;
              addTigoTransactionObj.Status = STATUS.PENDING;
              addTigoTransactionObj.Operations.push({
                operation: 'checkUserForConnectedApp',
                requestBody: userFound.requestBody,
                responseBody: userFound.responseBody,
                Status: addTigoTransactionObj.Status,
              });
              const makePaymentObj = {
                routeDetails: partner.payment_vendor,
                request: {
                  TransactionStatus: 'success',
                  Message: 'Payment successful',
                  Operator: 'Airtel',
                  ReferenceID: addTigoTransactionObj?.ReferenceID,
                  ExternalReferenceID: addTigoTransactionObj?.ExternalReferenceID,
                  UtilityReference: body.COMMAND.CUSTOMERREFERENCEID,
                  Amount: body.COMMAND.AMOUNT,
                  TansactionID: addTigoTransactionObj?.ReferenceID,
                  Msisdn: body.COMMAND.MSISDN,
                },
              };
              log.info('---makePaymentObj---');
              await this.paymentVendorController
                .payUserForConnectedApp(makePaymentObj)
                .then((payRes: any) => {
                  log.info('---payRes---');
                  if (payRes.success) {
                    failedFlag = false;
                    addTigoTransactionObj.Status = STATUS.COMPLETED;
                  } else {
                    failedFlag = true;
                    addTigoTransactionObj.Status = STATUS.FAILURE;
                  }
                  addTigoTransactionObj.Operations.push({
                    operation: 'payUserForConnectedApp',
                    requestBody: payRes.requestBody,
                    responseBody: payRes.responseBody,
                    Status: addTigoTransactionObj.Status,
                  });
                })
                .catch((payErr: any) => {
                  log.error('---payErr---', payErr);
                  failedFlag = true;
                  addTigoTransactionObj.Status = STATUS.FAILURE;
                  addTigoTransactionObj.Operations.push({
                    operation: 'payUserForConnectedApp',
                    requestBody: payErr.requestBody,
                    responseBody: payErr.responseBody,
                    Status: addTigoTransactionObj.Status,
                  });
                });
            }
            let callGatewayOptions:
              | InterfaceList.GatewayFormats.addTransaction
              | InterfaceList.GatewayFormats.updateTransaction;
            if (creationFlag) {
              callGatewayOptions = {
                apiName: 'addTransaction',
                body: { ...addTigoTransactionObj },
              };
            } else {
              callGatewayOptions = {
                apiName: 'updateTransaction',
                body: {
                  UpdateFilter: {
                    TigoTransactionID: gatewayRequestRes?.data?.tigoTransactions.TigoTransactionID,
                  },
                  UpdateAttributes: { ...addTigoTransactionObj },
                },
              };
            }
            await this.tigoGatewayParams.callGateway(callGatewayOptions);
            log.info('---addTigoTransactions---');
            if (failedFlag) {
              return {
                responseType: RESPONSE_TYPE['ERROR'],
                txnID: body.COMMAND.TXNID,
                refID: body.COMMAND.CUSTOMERREFERENCEID,
                result: 'TF',
                errorCode: 'error010',
                msisdn: body.COMMAND.MSISDN,
                flag: 'N',
                content: 'Payment Failed',
              };
            } else {
              return {
                responseType: RESPONSE_TYPE['SUCCESS'],
                txnID: body.COMMAND.TXNID,
                refID: body.COMMAND.CUSTOMERREFERENCEID,
                result: 'TS',
                errorCode: 'error000',
                msisdn: body.COMMAND.MSISDN,
                flag: 'Y',
                content: 'Payment paid successfully',
              };
            }
          } else {
            log.info('partner came is nottttt');
            return {
              responseType: RESPONSE_TYPE['ERROR'],
              txnID: body.COMMAND.TXNID,
              refID: body.COMMAND.CUSTOMERREFERENCEID,
              result: 'TF',
              errorCode: 'error010',
              msisdn: body.COMMAND.MSISDN,
              flag: 'N',
              content: 'Payment Failed',
            };
          }
        })
        .catch((error: any) => {
          log.error('in catch block you see', error);
          return {
            responseType: RESPONSE_TYPE['ERROR'],
            txnID: body.COMMAND.TXNID,
            refID: body.COMMAND.CUSTOMERREFERENCEID,
            result: 'TF',
            errorCode: 'error010',
            msisdn: body.COMMAND.MSISDN,
            flag: 'N',
            content: 'Payment Failed',
          };
        });
    } catch (error) {
      log.error('---processTigoSyncApiFunction.catch.err---', error);
      return {
        responseType: RESPONSE_TYPE['ERROR'],
        txnID: body.COMMAND.TXNID,
        refID: body.COMMAND.CUSTOMERREFERENCEID,
        result: 'TF',
        errorCode: 'error010',
        msisdn: body.COMMAND.MSISDN,
        flag: 'N',
        content: 'Payment Failed',
      };
    }
  }

  async validateTokenFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body }: any = request;
    try {
      log.info('---validateTokenFunction.body---');
      const paymentPartnerFilter: Filter = {
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
      const [paymentPartnerError, paymentPartner]: any[] = await Utils.executePromise(
        this.paymentPartnerRepository.findOne(paymentPartnerFilter),
      );
      if (
        paymentPartnerError ||
        !paymentPartner?.PaymentPartnerID ||
        !paymentPartner?.payment_vendor?.PaymentVendorID
      ) {
        log.error('---paymentPartnerError---', paymentPartnerError);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      }
      const options: any = {
        apiPath: ApiList['VALIDATE_TIGO_TOKEN'],
        form: { ...body },
      };
      log.info('---validateTokenFunction.options---');
      return Utils.callRequest(options)
        .then(async (tokenRes: any) => {
          log.info('---tokenRes---');
          if (
            (tokenRes?.data &&
              typeof tokenRes.data === 'string' &&
              (tokenRes.data = JSON.parse(tokenRes.data))) ||
            tokenRes?.data?.access_token
          ) {
            const queueRequest: any = {
              MnoMerchant: {
                MerchantUsername: options?.form?.Username,
                MerchantPassword: options?.form?.Password,
                MerchantReferenceID: Utils.generateReferenceID(tokenRes.data.access_token),
                ExternalMerchantReferenceID: tokenRes.data.access_token,
                Source: paymentGateways['TIGO'],
              },
              CreateTransactions: {
                IncomingRequestType: SERVICE_TYPE.USSD_PUSH,
                PaymentVendorID: paymentPartner.PaymentVendorID,
                Status: STATUS.TOKEN_VALIDATE,
                ReferenceID: Utils.generateReferenceID(
                  options?.form?.Username,
                  options?.form?.Password,
                ),
                ExternalReferenceID: Utils.generateReferenceID(
                  options?.form?.Username,
                  options?.form?.Password,
                  tokenRes?.data,
                ),
                Operations: [
                  {
                    operation: ApiList['VALIDATE_TIGO_TOKEN'],
                    Status: STATUS.TOKEN_VALIDATE,
                    requestBody: { ...options.form },
                    responseBody: { ...tokenRes.data },
                  },
                ],
              },
            };
            log.info('---queueRequest---');
            await this.processTransactionFunction(queueRequest);
            return {
              messageCode: ResponseMappings['TOKEN_GENERATION_SUCCESS'],
              success: true,
              statusCode: 200,
              msg: 'Token successfully validated',
              data: {
                ReferenceID: queueRequest.CreateTransactions.ReferenceID,
                AccessToken: queueRequest?.MnoMerchant?.MerchantReferenceID,
                TokenType: tokenRes?.data?.token_type,
                ExpiresIn: tokenRes?.data?.expires_in,
              },
            };
          } else {
            log.info('---access.token.was.not.returned');
            return {
              messageCode: ResponseMappings['TOKEN_GENERATION_FAIL'],
              success: true,
              statusCode: 503,
              msg:
                tokenRes?.data.error_description ||
                HttpErrors.BadRequest ||
                'Token could not be generated',
              data: tokenRes?.data || {},
            };
          }
        })
        .catch((tokenErr: any) => {
          log.error('---tokenErr---', tokenErr);
          return {
            messageCode: ResponseMappings['SERVICE_UNAVAILABLE'],
            success: false,
            statusCode: tokenErr.statusCode || 503,
            msg: tokenErr.message || 'Unservicable request',
            data: tokenErr.data || {},
          };
        });
    } catch (error) {
      log.error('---validateTokenFunction.catch.err---', error);
      return {
        messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        data: error.data || {},
      };
    }
  }

  async initiateTransactionFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body, headers }: any = request;
    try {
      log.info('---initiateTransactionFunction.body---');
      const mnoMerchantFilter: Filter = {
        where: {
          MerchantReferenceID: headers.authorization,
          Source: paymentGateways['TIGO'],
        },
      };
      const paymentPartnerFilter = {
        where: {
          PartnerCode: body?.PartnerCode,
          Status: STATUS.ACTIVE,
        },
        include: [
          {
            relation: 'payment_vendor',
          },
        ],
      };
      const callGatewayOptions: any = {
        apiName: 'fetchTransaction',
        body: {
          where: {
            ReferenceID: body.ReferenceID,
          },
        },
      };
      log.info('---paymentPartnerFilter---');
      const [merchantErr, merchantRes]: any = await Utils.executePromise(
        this.mnoMerchantsController.findOne(mnoMerchantFilter),
      );
      const [paymentPartnerErr, paymentPartnerRes]: any = await Utils.executePromise(
        this.paymentPartnerRepository.findOne(paymentPartnerFilter),
      );
      const [gatewayRequestErr, gatewayRequestRes]: any = await Utils.executePromise(
        this.tigoGatewayParams.callGateway(callGatewayOptions),
      );
      if (
        merchantErr ||
        paymentPartnerErr ||
        !paymentPartnerRes?.PaymentPartnerID ||
        !paymentPartnerRes?.payment_vendor
      ) {
        log.info('---merchantErr---', merchantErr);
        log.info('---paymentPartnerErr---', paymentPartnerErr);
        return {
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          data: merchantErr?.data ? merchantErr?.data : {},
        };
      }
      if (
        gatewayRequestErr ||
        (gatewayRequestRes && !gatewayRequestRes.success) ||
        !gatewayRequestRes.data
      ) {
        log.error('---gatewayRequestErr---', gatewayRequestErr);
        return {
          messageCode: ResponseMappings['FAILURE'],
          data: {
            ReferenceID: body.ReferenceID,
            Amount: body.Amount,
          },
        };
      }
      log.info('---gatewayRequestRes---');
      const tigoTransactions: any = gatewayRequestRes?.data?.tigoTransaction;
      const options: any = {
        apiPath: ApiList['INITIATE_TIGO_TRANSACTION'],
        headers: {
          Authorization: `${headers.tokentype} ${merchantRes.ExternalMerchantReferenceID}`,
          Username: merchantRes.MerchantUsername,
          Password: merchantRes.MerchantPassword,
          'Content-type': 'application/json',
        },
        body: {
          CustomerMSISDN: body.CustomerMSISDN,
          Amount: body.Amount,
          BillerMSISDN: body.ReferenceMSISDN,
          Remarks: body.Remarks ? body.Remarks : null,
          ReferenceID: `${paymentPartnerRes.payment_vendor.ServiceType}${Utils.generateReferenceID(
            merchantRes.MerchantReferenceID,
            body.CustomerMSISDN,
            body.Amount,
          )}`,
        },
      };
      log.info('---requestOptions---');
      log.info(options);
      const [requestErr, requestRes]: any = await Utils.executePromise(Utils.callRequest(options));
      if (requestErr || (requestRes && !requestRes.success)) {
        log.error('---requestErr---', requestErr);
        return {
          messageCode: ResponseMappings['TRANSACTION_INITIATION_FAIL'],
          data: requestErr?.data ? requestErr?.data : requestRes?.data ? requestRes?.data : {},
        };
      }
      log.info('---requestRes---');
      const operations: any = tigoTransactions.Operations;
      const queueRequest: any = {
        UpdateTransactions: {
          TigoTransactionID: tigoTransactions.TigoTransactionID,
          IncomingRequestType: SERVICE_TYPE.USSD_PUSH,
          MerchantReferenceID: merchantRes.MerchantReferenceID,
          CUSTOMERREFERENCEID: body.CustomerMSISDN,
          MSISDN: body.CustomerMSISDN,
          BillerMSISDN: body.ReferenceMSISDN,
          Amount: body.Amount,
          PartnerCode: body?.PartnerCode,
          ExternalReferenceID: options?.body?.ReferenceID,
          PaymentVendorID: paymentPartnerRes.PaymentVendorID,
          Status: STATUS.PENDING,
          Operations: operations,
          ReferenceID: Utils.generateReferenceID(
            options?.body?.CustomerMSISDN,
            options?.body?.Amount,
            options?.body?.ReferenceID,
          ),
        },
      };
      operations.push({
        operation: ApiList['INITIATE_TIGO_TRANSACTION'],
        Status: STATUS.PENDING,
        requestBody: requestRes.requestBody,
        responseBody: requestRes.responseBody,
      });
      log.info('---queueRequest---');
      await this.processTransactionFunction(queueRequest);
      return {
        success: true,
        statusCode: 200,
        msg: requestRes?.data?.ResponseDescription || 'Tigo transaction initiated successfully',
        data: {
          ReferenceID: queueRequest?.UpdateTransactions?.ReferenceID,
          ExternalReferenceID: queueRequest?.UpdateTransactions?.ExternalReferenceID,
        },
      };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  async billerCallbackFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body }: any = request;
    try {
      const callGatewayOptions: any = {
        apiName: 'fetchTransaction',
        body: {
          where: {
            ExternalReferenceID: body.ReferenceID,
          },
        },
      };
      const [gatewayRequestErr, gatewayRequestRes]: any = await Utils.executePromise(
        this.tigoGatewayParams.callGateway(callGatewayOptions),
      );
      if (
        gatewayRequestErr ||
        (gatewayRequestRes && !gatewayRequestRes.success) ||
        !gatewayRequestRes?.data?.tigoTransaction
      ) {
        log.error('---gatewayRequestErr---', gatewayRequestErr);
        return {
          messageCode: ResponseMappings['FAILURE'],
          data: {
            ReferenceID: body.ReferenceID,
            Amount: body.Amount,
          },
        };
      }
      log.info('---gatewayRequestRes---');
      if (
        gatewayRequestRes?.data?.tigoTransaction?.BillerMSISDN &&
        gatewayRequestRes?.data?.tigoTransaction?.PartnerCode
      ) {
        const paymentPartnerFilter: any = {
          where: {
            PartnerCode: gatewayRequestRes.data.tigoTransaction.PartnerCode,
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
          log.error('---paymentPartnerErr---', paymentPartnerErr);
          return {
            messageCode: ResponseMappings['FAILURE'],
            data: {
              ReferenceID: body.ReferenceID,
              Amount: body.Amount,
            },
          };
        }
        const queueRequest = {
          gatewayRequestRes,
          body,
          paymentPartnerRes,
        };
        log.info('---queueRequest---');
        gatewayRequestRes.data.tigoTransaction = {
          ...gatewayRequestRes.data.tigoTransaction,
          TransactionID: body.MFSTransactionID,
          Amount: body.Amount,
          Status: STATUS.COMPLETED,
        };
        if (gatewayRequestRes.data.tigoTransaction.Operations?.length) {
          gatewayRequestRes.data.tigoTransaction.Operations.push({
            operation: 'BillerCallback',
            Status: STATUS.COMPLETED,
            requestBody: { ...body },
            responseBody: {},
          });
        }
        await tigoRabbitMq.sendToQueue(
          JSON.stringify(queueRequest),
          this.tigoTransactionsConstants['queueRoutingKey'],
        );
        return {
          messageCode: ResponseMappings['SUCCESS'],
          data: {
            ReferenceID: body.ReferenceID,
            Amount: body.Amount,
          },
        };
      } else {
        log.info('---BILLER_MSISDN_NOT_PROVIDED---');
        return {
          messageCode: ResponseMappings['FAILURE'],
          data: {
            ReferenceID: body.ReferenceID,
            Amount: body.Amount,
          },
        };
      }
    } catch (error) {
      log.error('---billerCallbackFunction.catch.err---');
      log.error(error);
      return {
        messageCode: ResponseMappings['FAILURE'],
        data: {
          ReferenceID: body.ReferenceID,
          Amount: body.Amount,
        },
      };
    }
  }

  async queryTransactionFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body, headers }: any = request;
    try {
      const mnoMerchantFilter: Filter = {
        where: {
          MerchantReferenceID: headers.Authorization,
          Source: paymentGateways['TIGO'],
        },
      };
      const [mnoMerchantErr, mnoMerchantRes]: any = await Utils.executePromise(
        this.mnoMerchantsController.findOne(mnoMerchantFilter),
      );
      if (mnoMerchantErr || (mnoMerchantRes && !mnoMerchantRes.success)) {
        log.info('---mnoMerchantErr---');
        log.info(mnoMerchantErr || mnoMerchantRes);
        return {
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          data: mnoMerchantErr.data
            ? mnoMerchantErr.data
            : mnoMerchantRes.data
            ? mnoMerchantRes.data
            : {},
        };
      }
      log.info('---mnoMerchantRes---');
      log.info(mnoMerchantRes);
      const callRequestOptions: any = {
        apiPath: ApiList['QUERY_TIGO_TRANSACTION'],
        headers: {
          Username: mnoMerchantRes?.MerchantUsername,
          Password: mnoMerchantRes?.MerchantPassword,
          'Content-type': 'application/json',
        },
        body: {
          ReferenceID: body.ReferenceID,
        },
      };
      const [callRequestErr, callRequestRes]: any = await Utils.executePromise(
        Utils.callRequest(callRequestOptions),
      );
      if (callRequestErr || (callRequestRes && !callRequestRes.success) || !callRequestRes.data) {
        log.info('---callRequestErr---');
        log.info(callRequestErr || callRequestRes);
        return {
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          data: callRequestErr.data
            ? callRequestErr.data
            : callRequestRes.data
            ? callRequestRes.data
            : {},
        };
      }
      log.info('---callRequestRes---');
      log.info(callRequestRes);
      const queueRequest: any = {
        CreateTransactions: {
          Operation: ApiList['QUERY_TIGO_TRANSACTION'],
          ServiceType: SERVICE_TYPE['USSD_PUSH'],
          ReferenceID: body.ReferenceID,
          ExternalReferenceID: Utils.generateReferenceID(
            paymentGateways['TIGO'],
            body.ReferenceID,
            mnoMerchantRes.MerchantUsername,
            mnoMerchantRes?.MerchantPassword,
          ),
        },
      };
      log.info(queueRequest);
      tigoRabbitMq.sendToQueue(
        JSON.stringify(queueRequest),
        this.tigoTransactionsConstants['queueRoutingKey'],
      );
      return {
        messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
        success: true,
        statusCode: 200,
        msg: 'Transaction details fetched successfully',
        data: {
          ...callRequestRes,
        },
      };
    } catch (error) {
      log.error('---queryTransactionFunction.catch.err---');
      log.error(error);
      return {
        messageCode: ResponseMappings['SERVICE_UNAVAILABLE'],
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        data: error.data || {},
      };
    }
  }

  async fetchMultipleTransactions(request: any): Promise<any> {
    const callGatewayOptions: any = {
      apiName: 'fetchMultipleTransactions',
      body: { ...request },
    };
    const [transactionsError, transactionsResult]: any[] = await Utils.executePromise(
      this.tigoGatewayParams.callGateway(callGatewayOptions),
    );
    if (transactionsError || !(transactionsResult?.success || transactionsResult?.data)) {
      log.info('---fetchMultipleTransactions.transactionsError---', transactionsError);
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
      this.tigoGatewayParams.callGateway(callGatewayOptions),
    );
    if (countError || !(transactionsCount?.success || transactionsCount?.data)) {
      log.info('---fetchTransactionsCount.countError---', countError);
      return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
    }
    log.info('---fetchTransactionsCount.transactionsCount---');
    return {
      ...transactionsCount,
      messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
    };
  }

  async fetchTigoTransactionDetails(query: any): Promise<any> {
    let count: number = Utils.fetchSkipFilter({
      skip: parseInt(query.skip),
      limit: parseInt(query.limit),
    });
    const tigoResponse: InterfaceList.TransactionResponseInstance = {
      totalCount: 0,
      transactions: [],
    };
    let callRequestOptions: any = {
      apiPath: ApiList['FETCH_TIGO_TRANSACTIONS'],
      body: {
        where: {
          ...Utils.fetchTimestampFilter(query),
          PaymentVendorID: query.PaymentVendorID,
          Amount: query?.Amount ? query.Amount : undefined,
          Status: query?.Status ? query.Status : undefined,
          ReferenceID: query?.ReferenceID ? { like: `%${query.ReferenceID}%` } : undefined,
          ExternalReferenceID: query?.ExternalReferenceID
            ? { like: `%${query.ExternalReferenceID}%` }
            : undefined,
          IncomingRequestType: query?.IncomingRequestType ? query.IncomingRequestType : undefined,
        },
        fields: query.fields,
        order: query?.order
          ? query?.order == 'Time'
            ? 'CreatedAt DESC'
            : query?.order == 'ReferenceMsisdn'
            ? 'BillerMSISDN DESC'
            : query?.order == 'SenderMsisdn'
            ? 'MSISDN DESC'
            : `${query?.order} DESC`
          : 'CreatedAt DESC',
        skip: Utils.fetchSkipFilter({ skip: parseInt(query.skip), limit: parseInt(query.limit) }),
        limit: parseInt(query.limit) || undefined,
      },
    };
    const [callRequestError, callRequestResult]: any[] = await Utils.executePromise(
      Utils.callRequest(callRequestOptions),
    );
    callRequestOptions = {
      apiPath: ApiList['FETCH_TIGO_TRANSACTIONS_COUNT'],
      body: {
        ...Utils.fetchTimestampFilter(query),
        PaymentVendorID: query.PaymentVendorID,
        Amount: query?.Amount ? query.Amount : undefined,
        Status: query?.Status ? query.Status : undefined,
        ReferenceID: query?.ReferenceID ? { like: `%${query.ReferenceID}%` } : undefined,
        ExternalReferenceID: query?.ExternalReferenceID
          ? { like: `%${query.ExternalReferenceID}%` }
          : undefined,
        IncomingRequestType: query?.IncomingRequestType ? query.IncomingRequestType : undefined,
      },
    };
    const [totalCountError, totalCount]: any[] = await Utils.executePromise(
      Utils.callRequest(callRequestOptions),
    );

    if (
      callRequestError ||
      totalCountError ||
      !(callRequestResult?.success || callRequestResult?.data?.data?.tigoTransactions) ||
      !(totalCount?.success || totalCount?.data?.data?.tigoTransactions)
    ) {
      log.error('---callRequestError---', callRequestError);
      log.error('---totalCountError---', totalCountError);
      return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
    }
    log.info('---callRequestResult---');

    log.info('---totalCount---');

    tigoResponse.totalCount = totalCount?.data?.data?.tigoTransactions?.count;
    if (callRequestResult?.data?.data?.tigoTransactions?.length) {
      callRequestResult.data.data.tigoTransactions.forEach((val: any) => {
        tigoResponse.transactions.push({
          SerialNo: ++count,
          ReferenceID: val?.ReferenceID,
          ExternalReferenceID: val?.ExternalReferenceID,
          SenderMsisdn: val?.MSISDN,
          ReferenceMsisdn: val?.BillerMSISDN,
          Amount: val?.Amount,
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
    log.info('---fetchTigoTransactionDetails.tigoResponse---');
    if (!Object.keys(tigoResponse).length) return false;
    return tigoResponse;
  }

  async fetchTigoTransactionsCount(query: any): Promise<any> {
    const filter: any = {
      apiPath: ApiList['FETCH_TIGO_TRANSACTIONS'],
      body: { ...query },
    };
    const [tigoError, tigoTransactions]: any[] = await Utils.executePromise(
      Utils.callRequest(filter),
    );
    if (tigoError) {
      log.error('---tigoError---', tigoError);
      return false;
    } else if (
      !(tigoTransactions?.success || tigoTransactions?.data?.data?.tigoTransactions?.length)
    ) {
      log.info(
        '---!(tigoTransactions?.success || tigoTransactions?.data?.data?.tigoTransactions)---',
      );
      return false;
    }
    log.info('---tigoTransactions---');
    return tigoTransactions.data.data.tigoTransactions;
  }
}
