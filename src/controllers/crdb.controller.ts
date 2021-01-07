/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { crdbDef } from '../api-specs/crdb-transactions';
import { api, Filter, repository, Utils } from '../common';
import {
  ApiList,
  CrdbTransactionConstant,
  CurrencyCodes,
  ResponseMappings,
  STATUS,
} from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { BankMerchants, PaymentPartner } from '../models';
import { RabbitMqProducer } from '../queue';
import { BankMerchantsRepository, PaymentPartnerRepository } from '../repositories';
export const crdbRabbitMq = new RabbitMqProducer('gateway');
const log = new LoggingInterceptor('crdb.Controllers');

@api(crdbDef)
export class CrdbTransactions {
  constructor(
    @repository(PaymentPartnerRepository)
    private paymentPartnerRepository: PaymentPartnerRepository,

    @repository(BankMerchantsRepository)
    private bankMerchantsRepository: BankMerchantsRepository,
  ) {}
  private crdbTransactionConstant = CrdbTransactionConstant;

  async merchantVerificationFunction(crdbTransaction: any): Promise<any> {
    try {
      let createMerchantInstance: any,
        updateMerchantInstance: any,
        createTransactionInstance: any,
        apiRequestBody: any,
        rpOptions: any,
        rpError: any,
        rpDetails: any,
        rabbitMqProducerObj: any;
      const crdbTransactionReq = { ...crdbTransaction.MerchantDetails };
      const merchantFilter: Filter = {
        where: {
          or: [
            {
              MerchantAccountNumber: crdbTransactionReq?.MerchantAccountNumber,
              Source: this.crdbTransactionConstant.Source,
              Status: STATUS.ACTIVE,
            },
            {
              MobileNumber: crdbTransactionReq?.MerchantMobileNumber,
              Source: this.crdbTransactionConstant.Source,
              Status: STATUS.ACTIVE,
            },
          ],
        },
      };
      const paymentPartnerFilter: Filter = {
        where: {
          PartnerCode: crdbTransactionReq.PartnerCode,
          Status: STATUS.ACTIVE,
        },
        include: [
          {
            relation: 'payment_vendor',
          },
        ],
      };
      const merchantDetails: BankMerchants | null = await this.bankMerchantsRepository.findOne(
        merchantFilter,
      );
      const paymentPartner: PaymentPartner | null = await this.paymentPartnerRepository.findOne(
        paymentPartnerFilter,
      );
      if (!paymentPartner?.PaymentPartnerID) {
        log.info('---paymentPartnerDetails_not_found---');
        log.info(paymentPartner);
        return {
          messageCode: ResponseMappings['INVALID_PARTNER'],
          success: false,
          statusCode: 503,
          msg: 'Service unavailable',
          data: {},
        };
      }
      log.info('---paymentPartnerDetails---');
      log.info(paymentPartner);
      createMerchantInstance = {
        MerchantName: crdbTransactionReq.MerchantName,
        MerchantAccountNumber: crdbTransactionReq?.MerchantAccountNumber,
        MobileNumber: crdbTransactionReq?.MerchantMobileNumber,
        IsMerchantRegistered: true,
        Source: this.crdbTransactionConstant.Source,
        Status: STATUS.ACTIVE,
      };
      apiRequestBody = {
        Operation: this.crdbTransactionConstant.Operations['merchantVerification'].Operation,
        MerchantName: crdbTransactionReq.MerchantName || merchantDetails?.MerchantName,
        MerchantAccountNumber:
          crdbTransactionReq.MerchantAccountNumber || merchantDetails?.MerchantAccountNumber,
        MerchantMobileNumber:
          crdbTransactionReq.MerchantMobileNumber || merchantDetails?.MerchantMobileNumber,
        Otp: crdbTransactionReq.Otp,
        CollectionAccountNumber: paymentPartner?.CollectionAccountNumber,
        Token: this.crdbTransactionConstant.Operations['merchantVerification'].Token,
      };
      if (merchantDetails?.BankMerchantID) {
        updateMerchantInstance = {
          ...merchantDetails,
          ...createMerchantInstance,
        };
        createMerchantInstance = undefined;
      }
      if (!createMerchantInstance) {
        updateMerchantInstance = {
          ...updateMerchantInstance,
          MerchantName: crdbTransactionReq.MerchantName,
          MerchantAccountNumber: crdbTransactionReq.MerchantAccountNumber,
          MobileNumber: crdbTransactionReq.MerchantMobileNumber,
        };
      }
      log.info('---apiRequestBody---');
      log.info(apiRequestBody);
      rpOptions = {
        apiPath: ApiList['CRDB_MERCHANT_VERIFICATION'],
        body: this.crdbTransactionConstant.generateRequestObject(apiRequestBody),
      };
      log.info('---rpOptions---');
      log.info(rpOptions);
      [rpError, rpDetails] = await Utils.executePromise(Utils.callRequest(rpOptions));
      if (rpError || !rpDetails.success) {
        log.info('--rpError---');
        log.info(rpError || rpDetails);
        return {
          messageCode: ResponseMappings['CRDB_TRANSACTION_VALIDATION_FAIL'],
          data: rpError.data || rpDetails || {},
        };
      }
      rpDetails = this.crdbTransactionConstant.processResponseBody(rpDetails.data, apiRequestBody);
      log.info('---rpDetails---');
      log.info(rpDetails);
      createTransactionInstance = {
        ExternalReferenceID: rpDetails.data.ExternalReferenceID,
        Status: STATUS.PENDING,
        ReferenceID: Utils.generateReferenceID(rpDetails.data.ExternalReferenceID),
        Operations: [
          {
            operation: paymentPartner.ExternalEndpointSpecs['merchantVerification'].OPERATION,
            requestBody: { ...rpOptions },
            responseBody: { ...rpDetails },
          },
        ],
        CollectionAccountNumber: apiRequestBody.CollectionAccountNumber,
      };
      if (createTransactionInstance) {
        rpDetails.data.ReferenceID = createTransactionInstance.ReferenceID;
        rpDetails.data.ExternalReferenceID = createTransactionInstance.ExternalReferenceID;
      }

      if (createMerchantInstance) {
        createMerchantInstance.ExternalMerchantReferenceID =
          rpDetails.data.ExternalMerchantReferenceID;
        createMerchantInstance.MerchantReferenceID = Utils.generateReferenceID(
          rpDetails.data.ExternalMerchantReferenceID,
        );
        rpDetails.data.MerchantReferenceID = updateMerchantInstance.createMerchantInstance;
      }

      if (updateMerchantInstance) {
        delete updateMerchantInstance.CreatedAt;
        delete updateMerchantInstance.UpdatedAt;
        updateMerchantInstance.ExternalMerchantReferenceID =
          rpDetails.data.ExternalMerchantReferenceID;
        updateMerchantInstance.MerchantReferenceID = Utils.generateReferenceID(
          rpDetails.data.ExternalMerchantReferenceID,
        );
        rpDetails.data.MerchantReferenceID = updateMerchantInstance.MerchantReferenceID;
      }

      if (!rpDetails.success) {
        createTransactionInstance.Status = STATUS.FAILURE;
        // rabbitMqProducerObj.makePaymentObj = {
        //   routeDetails: paymentPartner.payment_vendor,
        //   request: {
        //     TransactionStatus: 'failed',
        //     Message: rpDetails.message,
        //     Operator: 'Crdb',
        //     ReferenceID: createTransactionInstance.ReferenceID,
        //     ExternalReferenceID: createTransactionInstance.ExternalReferenceID,
        //     UtilityReference:
        //       createMerchantInstance?.MobileNumber || updateMerchantInstance?.MobileNumber,
        //     Amount: createTransactionInstance.Amount,
        //     TansactionID: createTransactionInstance.ExternalReferenceID,
        //     Msisdn:
        //       updateMerchantInstance?.MerchantAccountNumber ||
        //       createMerchantInstance?.MobileNumber ||
        //       updateMerchantInstance?.MobileNumber,
        //   },
        // };
      }
      rabbitMqProducerObj = {
        createTransactionInstance,
        createMerchantInstance,
        updateMerchantInstance,
      };
      await crdbRabbitMq.sendToQueue(
        JSON.stringify(rabbitMqProducerObj),
        this.crdbTransactionConstant.queueRoutingKey,
      );
      return { ...rpDetails };
    } catch (error) {
      log.error('---merchantVerificationFunction_CATCH_ERROR---');
      log.error(error);
      return {
        messageCode: ResponseMappings['SERVICE_UNAVAILABLE'],
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error,\nPlease try again after some time',
        data: error.data || {},
      };
    }
  }

  async initiateTransactionFunction(crdbTransaction: any): Promise<any> {
    try {
      let createTransactionInstance: any,
        apiRequestBody: any,
        rpOptions: any,
        rpError: any,
        rpDetails: any,
        rabbitMqProducerObj: any;
      const crdbTransactionReq: any = { ...crdbTransaction.TransactionDetails };
      const merchantFilter: Filter = {
        where: {
          MerchantReferenceID: crdbTransactionReq.MerchantReferenceID,
          Status: STATUS.ACTIVE,
        },
      };
      const paymentPartnerFilter: any = {
        where: {
          PartnerCode: crdbTransactionReq.PartnerCode,
          Status: STATUS.ACTIVE,
        },
        include: [
          {
            relation: 'payment_vendor',
          },
        ],
      };
      const [merchantError, merchantDetails]: any[] = await Utils.executePromise(
        this.bankMerchantsRepository.findOne(merchantFilter),
      );
      const [paymentPartnerError, paymentPartner]: any[] = await Utils.executePromise(
        this.paymentPartnerRepository.findOne(paymentPartnerFilter),
      );
      if (merchantError || paymentPartnerError) {
        log.info('---merchantError---');
        log.info(merchantError);
        log.info('---paymentPartnerError---');
        log.info(paymentPartnerError);
        return { messageCode: ResponseMappings['FAILURE'] };
      } else if (!merchantDetails || !paymentPartner) {
        log.info('---not.found.merchantDetails|paymentPartner---');
        log.info(merchantDetails || paymentPartner);
        return { messageCode: ResponseMappings['INVALID_CREDENTIALS'] };
      }

      apiRequestBody = {
        Operation: this.crdbTransactionConstant.Operations['initiateTransaction'].Operation,
        Token: this.crdbTransactionConstant.Operations['initiateTransaction'].Token,
        ExternalMerchantReferenceID: merchantDetails?.ExternalMerchantReferenceID,
        Amount: crdbTransactionReq.Amount,
        CurrencyCode: crdbTransactionReq.CurrencyCode || CurrencyCodes.TanzanianShilling,
        PaymentReferenceID: Utils.generateReferenceID(crdbTransactionReq.MerchantReferenceID),
        CollectionAccountNumber: paymentPartner.CollectionAccountNumber,
      };
      rpOptions = {
        apiPath: ApiList['CRDB_TRANSACTION_INITIATION'],
        body: this.crdbTransactionConstant.generateRequestObject(apiRequestBody),
      };
      [rpError, rpDetails] = await Utils.executePromise(Utils.callRequest(rpOptions));
      if (rpError) {
        log.info('--rpError---');
        log.info(rpError);
        return {
          messageCode: ResponseMappings['CRDB_TRANSACTION_INITIATION_FAIL'],
          success: false,
          statusCode: rpError.statusCode,
          msg: rpError.message,
          data: rpError.data,
        };
      }
      rpDetails = this.crdbTransactionConstant.processResponseBody(rpDetails.data, apiRequestBody);
      log.info('--rpDetails---');
      log.info(rpDetails);
      createTransactionInstance = {
        CollectionAccountNumber: paymentPartner.CollectionAccountNumber,
        Amount: apiRequestBody.Amount,
        CurrencyCode: apiRequestBody.CurrencyCode,
        BankMerchantID: merchantDetails.BankMerchantID,
        Status: STATUS.PENDING,
        Operations: [
          {
            operation: this.crdbTransactionConstant.Operations['initiateTransaction'].Operation,
            Status: STATUS.PENDING,
            requestBody: { ...rpOptions },
            responseBody: { ...rpDetails },
          },
        ],
      };
      if (rpDetails.success) {
        createTransactionInstance.ReferenceID = Utils.generateReferenceID(
          rpDetails.data.ExternalReferenceID,
        );
        createTransactionInstance.ExternalReferenceID = rpDetails.data.ExternalReferenceID;
        createTransactionInstance.Status = STATUS.COMPLETED;

        rpDetails.data.ReferenceID = createTransactionInstance.ReferenceID;
        rpDetails.data.ExternalReferenceID = createTransactionInstance.ExternalReferenceID;
      }

      const makePaymentObj = {
        routeDetails: paymentPartner.payment_vendor,
        request: {
          TransactionStatus: rpDetails.success ? 'success' : 'failed',
          Message: rpDetails.message,
          Operator: 'Crdb',
          ReferenceID: createTransactionInstance.ReferenceID,
          ExternalReferenceID: createTransactionInstance.ExternalReferenceID,
          UtilityReference: merchantDetails.MobileNumber,
          Amount: createTransactionInstance.Amount,
          TansactionID: createTransactionInstance.ExternalReferenceID,
          Msisdn: merchantDetails.MerchantAccountNumber || merchantDetails.MobileNumber,
        },
      };

      rabbitMqProducerObj = { createTransactionInstance, makePaymentObj };
      await crdbRabbitMq.sendToQueue(
        JSON.stringify(rabbitMqProducerObj),
        this.crdbTransactionConstant.queueRoutingKey,
      );

      return { ...rpDetails };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }
}
