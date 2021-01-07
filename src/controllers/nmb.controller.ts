import { nmbDef } from '../api-specs/nmb-transactions';
import { api, Filter, repository, Utils } from '../common';
import {
  ApiList,
  InterfaceList,
  NmbTransactionConstant,
  ResponseMappings,
  SERVICE_TYPE,
  STATUS,
} from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { RabbitMqProducer } from '../queue';
import { BankMerchantsRepository, PaymentPartnerRepository } from '../repositories';
export const nmbRabbitMq = new RabbitMqProducer('gateway');
const NODE_ENV = process.env.NODE_ENV;
const log = new LoggingInterceptor('nmb.Controllers');

@api(nmbDef)
export class NmbTransactions {
  constructor(
    @repository(PaymentPartnerRepository)
    private paymentPartnerRepository: PaymentPartnerRepository,

    @repository(BankMerchantsRepository)
    private bankMerchantsRepository: BankMerchantsRepository,
  ) {}
  private nmbTransactionConstant: any = NmbTransactionConstant;

  async queryAccountInquiryFunction(nmbTransaction: any): Promise<any> {
    try {
      let nmbTransactionReq: any,
        paymentPartnerFilter: Filter,
        paymentPartnerDetails: any,
        merchantExistanceFilter: any,
        merchantExistanceError: any,
        merchantExistanceDetails: any,
        rpOptions: any,
        rpError: any,
        rpDetails: any,
        createTransactionInstanceObj: any,
        createMerchantInstanceObj: any,
        responseBody: any,
        apiRequestObject: InterfaceList.NmbRequestObject,
        rabbitMQProducerObj: any;
      nmbTransactionReq = { ...nmbTransaction.QueryDetails };
      paymentPartnerFilter = {
        where: {
          PartnerCode: nmbTransactionReq.PartnerCode,
          Status: STATUS.ACTIVE,
        },
      };
      paymentPartnerDetails = await this.paymentPartnerRepository.findOne(paymentPartnerFilter);
      if (paymentPartnerDetails?.PaymentPartnerID) {
        log.info('---paymentPartnerDetails---');
        log.info(paymentPartnerDetails);
        apiRequestObject = {
          operation: this.nmbTransactionConstant.Operations['queryAccountInquiry'].Operation,
          integrationPartner: paymentPartnerDetails,
          request: {
            AccountNumber: nmbTransactionReq.MerchantAccountNumber,
            AzamTransactionRef: Utils.generateReferenceID(
              nmbTransactionReq.MerchantAccountNumber,
              nmbTransactionReq.CountryCode,
            ),
          },
        };
        createTransactionInstanceObj = {
          ReferenceID: Utils.generateReferenceID(
            nmbTransactionReq.MerchantAccountNumber,
            nmbTransactionReq.MerchantReferenceID,
          ),
          PaymentPartnerID: paymentPartnerDetails.PaymentPartnerID,
          Amount: nmbTransactionReq.Amount || null,
          IncomingRequestType: SERVICE_TYPE.USSD_PUSH,
        };
        merchantExistanceFilter = {
          where: {
            or: [
              {
                MerchantReferenceID: nmbTransactionReq?.MerchantReferenceID,
                IsMerchantRegistered: false,
                Status: STATUS.ACTIVE,
              },
              {
                MerchantAccountNumber: nmbTransactionReq?.MerchantAccountNumber,
                Status: STATUS.ACTIVE,
              },
            ],
          },
        };
        [merchantExistanceError, merchantExistanceDetails] = await Utils.executePromise(
          this.bankMerchantsRepository.findOne(merchantExistanceFilter),
        );
        if (merchantExistanceError) {
          log.info('---merchantExistanceError---');
          log.info(merchantExistanceError);
          return { messageCode: ResponseMappings['BAD_REQUEST'] };
        } else if (merchantExistanceDetails) {
          log.info('---merchantExistanceDetails---');
          log.info(merchantExistanceDetails);
          apiRequestObject.request.AccountNumber = merchantExistanceDetails.MerchantAccountNumber;
          responseBody = {
            MerchantAccountNumber: nmbTransactionReq.MerchantAccountNumber,
            MerchantReferenceID: Utils.generateReferenceID(
              nmbTransactionReq.MerchantAccountNumber,
              nmbTransactionReq.CountryCode,
            ),
          };
          createTransactionInstanceObj.BankMerchantID = merchantExistanceDetails.BankMerchantID;
        } else {
          responseBody = {
            MerchantAccountNumber: nmbTransactionReq.MerchantAccountNumber,
            MerchantReferenceID: Utils.generateReferenceID(
              nmbTransactionReq.MerchantAccountNumber,
              nmbTransactionReq.CountryCode,
            ),
          };
          createMerchantInstanceObj = {
            MerchantAccountNumber: nmbTransactionReq.MerchantAccountNumber,
            MerchantReferenceID: Utils.generateReferenceID(
              nmbTransactionReq.MerchantAccountNumber,
              nmbTransactionReq.CountryCode,
            ),
            Source: this.nmbTransactionConstant.Source,
            IsMerchantRegistered: false,
            Status: STATUS.ACTIVE,
          };
        }
        apiRequestObject.request.AccountNumber = nmbTransactionReq.MerchantAccountNumber;
        rpOptions = {
          apiPath: ApiList['NMB_ACCOUNT_INQUIRY'],
          body: this.nmbTransactionConstant.generateRequestObj(apiRequestObject),
        };
        log.info('---rpOptions---');
        log.info(rpOptions);
        [rpError, rpDetails] = await Utils.executePromise(Utils.callRequest(rpOptions));
        if (rpError) {
          log.info('---rpError---');
          log.info(rpError);
          return {
            messageCode: ResponseMappings['SERVICE_UNAVAILABLE'],
            data: rpError.data || {},
          };
        }
        rpDetails = this.nmbTransactionConstant.processResponseBody(rpDetails.data);
        log.info('---rpDetails---');
        log.info(rpDetails);
        if (rpDetails.success) {
          createMerchantInstanceObj &&
            (createMerchantInstanceObj.MerchantName = rpDetails.data.CUSTNAME);
          createTransactionInstanceObj.CurrencyCode = rpDetails?.data?.CCY;
          createTransactionInstanceObj.Status = STATUS.SUCCESS;
          rpDetails.data = {
            MerchantName: createMerchantInstanceObj?.MerchantName || rpDetails.data.CUSTNAME,
            CurrencyCode: createTransactionInstanceObj.CurrencyCode,
            MerchantReferenceID: responseBody.MerchantReferenceID,
            MerchantAccountNumber: responseBody.MerchantAccountNumber,
          };
        } else {
          createTransactionInstanceObj.Status = STATUS.FAILURE;
        }
        rabbitMQProducerObj = {
          createMerchantInstanceObj,
          createTransactionInstanceObj,
        };
        await nmbRabbitMq.sendToQueue(
          JSON.stringify(rabbitMQProducerObj),
          this.nmbTransactionConstant['queueRoutingKey'],
        );
        return rpDetails;
      } else {
        log.info('---NO_integrationPartner---');
        log.info(paymentPartnerDetails);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      }
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  /**
   * @param MerchantAccountNumber MerchantAccountNumber: Account number of the merchant to be registered
   * @param MerchantName MerchantName: Name of the merchant to be registered
   */
  async merchantRegistrationFunction(nmbTransaction: any): Promise<any> {
    try {
      let nmbTransactionReq,
        paymentPartnerFilter: any,
        merchantFilter: any,
        merchant: any,
        paymentPartner: any,
        createMerchantInstanceObj: any,
        updateMerchantInstanceObj: any,
        rpOptions: any,
        rpError: any,
        rpDetails: any,
        apiRequestBody: any,
        rabbitMqProducerObj: any;

      nmbTransactionReq = { ...nmbTransaction.merchantDetails };
      merchantFilter = {
        where: {
          MerchantAccountNumber: nmbTransactionReq.MerchantAccountNumber,
          Status: STATUS.ACTIVE,
        },
      };
      paymentPartnerFilter = {
        where: {
          PartnerCode: nmbTransactionReq.PartnerCode,
          Status: STATUS.ACTIVE,
        },
      };
      merchant = await this.bankMerchantsRepository.findOne(merchantFilter);
      paymentPartner = await this.paymentPartnerRepository.findOne(paymentPartnerFilter);
      if (!paymentPartner?.PaymentPartnerID) {
        log.info('---NO_INTEGRATION_PARTNER_FOUND---');
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      } else {
        if (merchant?.BankMerchantID) {
          updateMerchantInstanceObj = {
            BankMerchantID: merchant.BankMerchantID,
            MerchantName: nmbTransactionReq.MerchantName,
            MerchantReferenceID: Utils.generateReferenceID(
              nmbTransactionReq.MerchantAccountNumber,
              nmbTransactionReq.CountryCode,
            ),
            IsMerchantRegistered: true,
            Status: STATUS.ACTIVE,
          };
        } else {
          createMerchantInstanceObj = {
            MerchantAccountNumber: nmbTransactionReq.MerchantAccountNumber,
            MerchantName: nmbTransactionReq.MerchantName,
            MerchantReferenceID: Utils.generateReferenceID(
              nmbTransactionReq.MerchantAccountNumber,
              nmbTransactionReq.CountryCode,
            ),
            Source: this.nmbTransactionConstant.Source,
            IsMerchantRegistered: true,
            Status: STATUS.ACTIVE,
          };
        }
        apiRequestBody = {
          operation: this.nmbTransactionConstant.Operations['merchantRegistration'].Operation,
          integrationPartner: paymentPartner,
          request: {
            MerchantAccountNumber: nmbTransactionReq.MerchantAccountNumber,
            MerchantName: nmbTransactionReq.MerchantName,
          },
        };
        rpOptions = {
          apiPath: ApiList['NMB_MERCHANT_REGISTRATION'],
          body: this.nmbTransactionConstant.generateRequestObj(apiRequestBody),
        };
        [rpError, rpDetails] = await Utils.executePromise(Utils.callRequest(rpOptions));
        if (rpError) {
          log.info('---rpError---');
          log.info(rpError);
          return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
        }
        rpDetails = this.nmbTransactionConstant.processResponseBody(rpDetails.data);
        log.info('---rpDetails---');
        log.info(rpDetails);
        if (rpDetails?.data?.drtoken) {
          if (createMerchantInstanceObj)
            createMerchantInstanceObj.ExternalMerchantReferenceID = rpDetails.data.drtoken;
          if (updateMerchantInstanceObj)
            updateMerchantInstanceObj.ExternalMerchantReferenceID = rpDetails.data.drtoken;
          rpDetails.data = {
            MerchantReferenceID:
              createMerchantInstanceObj?.MerchantReferenceID ||
              updateMerchantInstanceObj?.MerchantReferenceID,
            ExternalMerchantReferenceID:
              createMerchantInstanceObj?.ExternalMerchantReferenceID ||
              updateMerchantInstanceObj?.ExternalMerchantReferenceID,
          };
        }
        rabbitMqProducerObj = {
          createMerchantInstanceObj,
          updateMerchantInstanceObj,
        };
        await nmbRabbitMq.sendToQueue(
          JSON.stringify(rabbitMqProducerObj),
          this.nmbTransactionConstant['queueRoutingKey'],
        );
        return rpDetails;
      }
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  /**
   * @param MerchantReferenceID MerchantReferenceID: Gateway ReferenceID which should be used to retrieve the drtoken for deregistration
   */
  async merchantDeregistrationFunction(nmbTransaction: any): Promise<any> {
    try {
      let nmbTransactionReq: any,
        paymentPartnerFilter: any,
        paymentPartner: any,
        merchantFilter: any,
        merchantDetails: any,
        updateMerchantInstanceObj: any,
        apiRequestBody: any,
        rpOptions: any,
        rpError: any,
        rpDetails: any,
        rabbitMqProducerObj: any;

      nmbTransactionReq = { ...nmbTransaction };
      paymentPartnerFilter = {
        where: {
          PartnerCode: nmbTransactionReq.PartnerCode,
          Status: STATUS.ACTIVE,
        },
      };
      merchantFilter = {
        where: {
          MerchantReferenceID: nmbTransactionReq.MerchantReferenceID,
          IsMerchantRegistered: true,
          Status: STATUS.ACTIVE,
        },
      };
      paymentPartner = await this.paymentPartnerRepository.findOne(paymentPartnerFilter);
      log.info('---paymentPartner---');
      log.info(paymentPartner);
      if (paymentPartner?.PaymentPartnerID) {
        merchantDetails = await this.bankMerchantsRepository.findOne(merchantFilter);
        log.info('---merchantDetails---');
        log.info(merchantDetails);
        if (merchantDetails?.BankMerchantID) {
          apiRequestBody = {
            operation: this.nmbTransactionConstant.Operations['merchantDeregistration'].Operation,
            integrationPartner: paymentPartner,
            request: {
              MerchantToken: merchantDetails.ExternalMerchantReferenceID,
            },
          };
          rpOptions = {
            apiPath: ApiList['NMB_MERCHANT_DEREGISTRATION'],
            body: this.nmbTransactionConstant.generateRequestObj(apiRequestBody),
          };
          [rpError, rpDetails] = await Utils.executePromise(Utils.callRequest(rpOptions));
          if (NODE_ENV === 'local') {
            [rpError, rpDetails] = [
              null,
              {
                drtoken: '54889498175708007081645011226',
                responsemessage: 'SUCCESS',
                responsecode: '00',
              },
            ];
          }
          if (rpError) {
            log.info('---rpError---');
            log.info(rpError);
            return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
          }
          log.info('---rpDetails---');
          log.info(rpDetails);
          rpDetails = this.nmbTransactionConstant.processResponseBody(rpDetails.data);
          if (rpDetails.success) {
            updateMerchantInstanceObj = {
              BankMerchantID: merchantDetails.BankMerchantID,
              IsMerchantRegistered: false,
            };
            rabbitMqProducerObj = {
              updateMerchantInstanceObj,
            };
            await nmbRabbitMq.sendToQueue(
              JSON.stringify(rabbitMqProducerObj),
              this.nmbTransactionConstant['queueRoutingKey'],
            );
          }
          rpDetails.data = {};
          return rpDetails;
        } else {
          log.info('---NO_NMB_MERCHANT_FOUND---');
          return { messageCode: ResponseMappings['BAD_REQUEST'] };
        }
      } else {
        log.info('---NO_INTEGRATION_PARTNER_FOUND---');
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      }
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  async initiateTransactionFunction(nmbTransaction: any): Promise<any> {
    try {
      let nmbTransactionReq: any,
        paymentPartnerFilter: any,
        merchantFilter: any,
        paymentPartner: any,
        merchantDetails: any,
        createTransactionInstanceObj: any,
        apiRequestBody: any,
        rpOptions: any,
        rpError: any,
        rpDetails: any,
        rabbitMqProducerObj: any;
      nmbTransactionReq = { ...nmbTransaction.transactionDetails };
      paymentPartnerFilter = {
        where: {
          PartnerCode: nmbTransactionReq.PartnerCode,
          Status: STATUS.ACTIVE,
        },
        include: [
          {
            relation: 'payment_vendor',
          },
        ],
      };
      merchantFilter = {
        where: {
          MerchantReferenceID: nmbTransactionReq.MerchantReferenceID,
          IsMerchantRegistered: true,
          Status: STATUS.ACTIVE,
        },
      };
      paymentPartner = await this.paymentPartnerRepository.findOne(paymentPartnerFilter);
      merchantDetails = await this.bankMerchantsRepository.findOne(merchantFilter);
      if (
        !paymentPartner?.PaymentPartnerID ||
        !paymentPartner.payment_vendor ||
        !merchantDetails?.BankMerchantID
      ) {
        log.info('---NO INTEGRATION_PARTNER---');
        log.info(paymentPartner);
        log.info('---NO_NMB_MERCHANT_DETAILS_FOUND---');
        log.info(merchantDetails);
        return { messageCode: ResponseMappings['BAD_REQUEST'] };
      }
      createTransactionInstanceObj = {
        BankMerchantID: merchantDetails?.BankMerchantID,
        ReferenceID: Utils.generateReferenceID(merchantDetails.MerchantAccountNumber),
        PaymentPartnerID: paymentPartner.PaymentPartnerID,
        IncomingRequestType: SERVICE_TYPE.USSD_PUSH,
        Amount: nmbTransactionReq?.Amount,
        Status: STATUS.PENDING,
        Operations: [],
      };
      apiRequestBody = {
        operation: this.nmbTransactionConstant.Operations['initiateTransaction'].Operation,
        integrationPartner: paymentPartner,
        request: {
          MerchantMobileNumber: nmbTransactionReq?.MobileNumber,
          MerchantToken: merchantDetails?.ExternalMerchantReferenceID,
          Amount: nmbTransactionReq?.Amount,
          BusinessCode: paymentPartner?.CollectionAccountNumber,
          ReferenceID: createTransactionInstanceObj?.ReferenceID,
        },
      };
      rpOptions = {
        apiPath: ApiList['NMB_TRANSACTION_INITIATION'],
        body: this.nmbTransactionConstant.generateRequestObj(apiRequestBody),
      };
      [rpError, rpDetails] = await Utils.executePromise(Utils.callRequest(rpOptions));
      if (NODE_ENV === 'local') {
        [rpError, rpDetails] = [
          null,
          {
            txnref: 'EC700000156213',
            responsemessage: 'SUCCESS',
            responsecode: '00',
            hostref: '101FTMN161790391',
          },
        ];
      }
      if (rpError) {
        log.info('---rpError---');
        log.info(rpError);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      }
      log.info('---rpDetails---');
      log.info(rpDetails);
      createTransactionInstanceObj.Operations.push({
        operation: this.nmbTransactionConstant.Operations['initiateTransaction'].Operation,
        requestBody: { ...rpDetails.requestBody },
        responseBody: { ...rpDetails.responseBody },
      });
      rpDetails = this.nmbTransactionConstant.processResponseBody(rpDetails.data);
      if (rpDetails.success) {
        createTransactionInstanceObj.ExternalTransactionReferenceID = rpDetails.data.txnref;
        createTransactionInstanceObj.Status = STATUS.SUCCESS;
        rpDetails.data = {
          ReferenceID: createTransactionInstanceObj.ReferenceID,
          ExternalReferenceID: createTransactionInstanceObj.ExternalTransactionReferenceID,
        };
      } else {
        createTransactionInstanceObj.Status = STATUS.FAILURE;
        rpDetails.data = {};
      }
      const makePaymentObj = {
        routeDetails: paymentPartner.payment_vendor,
        request: {
          TransactionStatus: rpDetails.success ? 'success' : 'failed',
          Message: rpDetails.message,
          Operator: 'Nmb',
          ReferenceID: createTransactionInstanceObj.ReferenceID,
          ExternalReferenceID: createTransactionInstanceObj.ExternalReferenceID,
          UtilityReference: nmbTransactionReq.MobileNumber,
          Amount: createTransactionInstanceObj.Amount,
          TansactionID: createTransactionInstanceObj.ExternalReferenceID,
          Msisdn: merchantDetails.MerchantAccountNumber || merchantDetails.MobileNumber,
        },
      };
      rabbitMqProducerObj = { createTransactionInstanceObj, makePaymentObj };
      await nmbRabbitMq.sendToQueue(
        JSON.stringify(rabbitMqProducerObj),
        this.nmbTransactionConstant['queueRoutingKey'],
      );

      return rpDetails;
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  async authorizeMerchantFunction(nmbTransaction: any): Promise<any> {
    try {
      let nmbTransactionReq: any,
        paymentPartnerFilter: any,
        merchantFilter: any,
        paymentPartner: any,
        merchantDetails: any,
        createTransactionInstanceObj: any,
        apiRequestBody: any,
        rpOptions: any,
        rpError: any,
        rpDetails: any,
        rabbitMqProducerObj: any;
      nmbTransactionReq = { ...nmbTransaction.transactionDetails };
      paymentPartnerFilter = {
        where: {
          PartnerCode: nmbTransactionReq.PartnerCode,
          Status: STATUS.ACTIVE,
        },
      };
      merchantFilter = {
        where: {
          MerchantReferenceID: nmbTransactionReq.MerchantReferenceID,
          IsMerchantRegistered: true,
          Status: STATUS.ACTIVE,
        },
      };
      paymentPartner = await this.paymentPartnerRepository.findOne(paymentPartnerFilter);
      merchantDetails = await this.bankMerchantsRepository.findOne(merchantFilter);
      if (!paymentPartner?.PaymentPartnerID || !merchantDetails?.BankMerchantID) {
        log.info('---NO INTEGRATION_PARTNER---');
        log.info(paymentPartner);
        log.info('---NO_NMB_MERCHANT_DETAILS_FOUND---');
        log.info(merchantDetails);
        return { messageCode: ResponseMappings['BAD_REQUEST'] };
      }
      createTransactionInstanceObj = {
        BankMerchantID: merchantDetails?.BankMerchantID,
        ReferenceID: Utils.generateReferenceID(
          merchantDetails.MerchantAccountNumber,
          merchantDetails.MerchantAccountNumber,
        ),
        PaymentPartnerID: paymentPartner.PaymentPartnerID,
        IncomingRequestType: SERVICE_TYPE.USSD_PUSH,
      };
      apiRequestBody = {
        operation: this.nmbTransactionConstant.Operations['authorizeMerchant'].Operation,
        integrationPartner: paymentPartner,
        request: {
          MerchantMobileNumber: nmbTransactionReq?.MobileNumber,
          MerchantToken: merchantDetails?.ExternalMerchantReferenceID,
          Otp: nmbTransactionReq?.Otp,
          ReferenceID: createTransactionInstanceObj?.ReferenceID,
        },
      };
      rpOptions = {
        apiPath: ApiList['NMB_MERCHANT_AUTHORIZATION'],
        body: this.nmbTransactionConstant.generateRequestObj(apiRequestBody),
      };
      [rpError, rpDetails] = await Utils.executePromise(Utils.callRequest(rpOptions));
      if (rpError) {
        log.info('---rpError---');
        log.info(rpError);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      }
      log.info('---rpDetails---');
      log.info(rpDetails);
      createTransactionInstanceObj.Operations = {
        operation: this.nmbTransactionConstant.Operations['authorizeMerchant'].Operation,
        requestBody: { ...rpOptions },
        responseBody: { ...rpDetails },
      };
      rpDetails = this.nmbTransactionConstant.processResponseBody(rpDetails.data);
      if (rpDetails.success) {
        createTransactionInstanceObj.Status = STATUS.SUCCESS;
      } else {
        createTransactionInstanceObj.Status = STATUS.FAILURE;
      }
      rabbitMqProducerObj = { createTransactionInstanceObj };
      await nmbRabbitMq.sendToQueue(
        JSON.stringify(rabbitMqProducerObj),
        this.nmbTransactionConstant['queueRoutingKey'],
      );

      return rpDetails;
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }
}
