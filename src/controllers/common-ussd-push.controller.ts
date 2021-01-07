/* eslint-disable no-invalid-this */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Filter } from '@loopback/repository';
import { PaymentVendorCrudController } from '.';
import { commonApiDef } from '../api-specs/common-api/';
import { api, inject, Request, RestBindings, Utils } from '../common';
import {
  ApiList,
  InterfaceList,
  paymentGateways,
  ResponseMappings,
  SecretKeys,
  STATUS,
} from '../constants';
import { ERRORCODE } from '../constants/common-ussd-push';
import { LoggingInterceptor } from '../interceptors';
import { PaymentPartner } from '../models';
const log = new LoggingInterceptor('common-ussd-push.Controller');

@api(commonApiDef)
export class CommonUssdPush {
  constructor(
    @inject(`controllers.PaymentVendorCrudController`)
    public PaymentVendorCrudController: PaymentVendorCrudController,
  ) {}

  async validateApplicationRequestFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    try {
      const { body } = request;
      const paymentVendorFilter: Filter = {
        where: {
          VendorCode: body.VendorCode,
          Status: STATUS.ACTIVE,
        },
        include: [
          {
            relation: 'payment_partner',
          },
        ],
      };
      const paymentVendorDetails: any = await this.PaymentVendorCrudController.findOne(
        paymentVendorFilter,
      );
      if (paymentVendorDetails?.data?.PaymentVendorID) {
        log.info('---paymentVendorDetails---');
        if (
          !body.PartnerCode &&
          paymentVendorDetails?.data?.payment_partner?.length &&
          paymentVendorDetails.data.payment_partner.map(
            (val: any) => val.PartnerCode == body.PartnerCode,
          )
        ) {
          return {
            messageCode: ResponseMappings['UNAUTHORIZED_ACTION'],
            data: {},
          };
        }
        const selectedPartner: PaymentPartner = paymentVendorDetails.data.payment_partner.find(
          (val: any) => val.PartnerCode == body.PartnerCode,
        );
        const gatewayDetails: any = {
          PartnerCode: selectedPartner?.PartnerCode,
          Operator: selectedPartner.AuthScheme,
          Username: selectedPartner.Username,
          Password: selectedPartner.Password,
        };
        const encryptionData: InterfaceList.CryptoEncryption = {
          EncyrptionString: JSON.stringify(gatewayDetails),
          SecretKey: SecretKeys.MnoUssdPush,
        };
        const token: any = Utils.encryptData(encryptionData);
        log.info('---validateGatewayRequestFunction.gatewayDetails---');
        log.info(gatewayDetails);
        return {
          messageCode: ResponseMappings['SUCCESS'],
          data: {
            token,
          },
        };
      }
      return { messageCode: ResponseMappings['BAD_REQUEST'] };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  private verfiyAuthorization(headers: any): any {
    try {
      if (!headers) {
        return {
          success: false,
          msg: ERRORCODE.NULLHEADER,
        };
      }
      const { authorization } = headers;
      if (!authorization) {
        return {
          success: false,
          msg: ERRORCODE.NULLAUTHORIZATION,
        };
      }
      const decryptData: InterfaceList.CryptoEncryption = {
        EncyrptionString: authorization,
        SecretKey: SecretKeys.MnoUssdPush,
      };
      const cipherText: any = Utils.decryptData(decryptData);
      const cipherObject: any = JSON.parse(cipherText);
      log.info(cipherObject);
      return {
        success: true,
        data: { ...cipherObject },
      };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  }

  async callCommonApiForMno(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    try {
      const { body, headers } = request;
      const verifyToken: any = this.verfiyAuthorization(headers);
      log.info('---verifyToken---');
      log.info(verifyToken);
      if (!verifyToken.success) {
        return {
          messageCode: ResponseMappings['BAD_REQUEST'],
          success: verifyToken.success,
          msg: verifyToken.msg,
          data: {},
        };
      }
      const { PartnerCode, Operator } = verifyToken.data;
      switch (Operator.toUpperCase()) {
        case paymentGateways.AIRTEL.toUpperCase():
          const callAirtelTransaction: any = {
            apiPath: ApiList['AIRTEL_USSD_PUSH_API'],
            body: {
              PartnerCode,
              CustomerMsisdn: body.SenderMsisdn,
              ReferenceMsisdn: body.ReferenceMsisdn,
              Amount: body.Amount,
            },
          };
          const [airtelTransactionErr, airtelTransactionRes]: any[] = await Utils.executePromise(
            Utils.callRequest(callAirtelTransaction),
          );
          if (
            airtelTransactionErr ||
            !(airtelTransactionRes?.success || airtelTransactionRes?.data) ||
            !(airtelTransactionRes?.data?.success || airtelTransactionRes?.data?.data)
          ) {
            log.error(
              '---this.airtelTransactions.incomingApplicationFunction.airtelTransactionErr---',
              airtelTransactionErr,
            );
            log.info(
              '---airtelTransactions.incomingApplicationFunction.airtelTransactionRes?.data?.success---',
            );
            return {
              messageCode:
                airtelTransactionErr?.messageCode ||
                airtelTransactionErr?.data?.messageCode ||
                airtelTransactionRes?.messageCode ||
                airtelTransactionRes?.data?.messageCode ||
                ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
            };
          }
          log.info(
            '---this.airtelTransactions.incomingApplicationFunction.airtelTransactionRes---',
          );
          return {
            messageCode: ResponseMappings['SUCCESS'],
            ...airtelTransactionRes?.data,
          };

        case paymentGateways.TIGO.toUpperCase():
          const { Username, Password } = verifyToken.data;
          if (!(Username && Password)) {
            log.info('---USERNAME---||---PASSWORD---');
            return { messageCode: ResponseMappings['BAD_REQUEST'] };
          }
          const validateTokenOptions: any = {
            apiPath: ApiList['VALIDATE_TIGO_TOKEN_INTERNAL'],
            body: { Username, Password },
          };
          const [validateTokenErr, validateTokenRes]: any[] = await Utils.executePromise(
            Utils.callRequest(validateTokenOptions),
          );
          if (
            validateTokenErr ||
            !validateTokenRes.success ||
            !validateTokenRes?.data?.data?.AccessToken
          ) {
            log.info('---validateTokenErr---||---validateTokenRes---', validateTokenErr);
            return {
              messageCode:
                validateTokenErr?.messageCode ||
                validateTokenErr?.data?.messageCode ||
                validateTokenRes?.messageCode ||
                validateTokenRes?.data?.messageCode ||
                ResponseMappings['TOKEN_GENERATION_FAIL'],
            };
          }
          log.info('---validateTokenRes---');
          const initiateTransactionOptions: any = {
            apiPath: ApiList['INITIATE_TIGO_TRANSACTION_INTERNAL'],
            headers: {
              authorization: validateTokenRes?.data?.data?.AccessToken,
              tokenType: validateTokenRes?.data?.data?.TokenType,
            },
            body: {
              PartnerCode,
              CustomerMSISDN: body.SenderMsisdn,
              ReferenceMSISDN: body.ReferenceMsisdn,
              ReferenceID: validateTokenRes.data.data.ReferenceID,
              Remarks: body.Remarks,
              Amount: body.Amount,
            },
          };
          const [
            initiateTransactionErr,
            initiateTransactionRes,
          ]: any[] = await Utils.executePromise(Utils.callRequest(initiateTransactionOptions));
          if (
            initiateTransactionErr ||
            !(
              initiateTransactionRes.success ||
              initiateTransactionRes?.data?.success ||
              initiateTransactionRes?.data?.data
            )
          ) {
            log.error('---initiateTransactionErr---', initiateTransactionErr);
            return {
              messageCode:
                initiateTransactionErr?.messageCode ||
                initiateTransactionErr?.data?.messageCode ||
                initiateTransactionRes?.messageCode ||
                initiateTransactionRes?.data?.messageCode ||
                ResponseMappings['SERVICE_UNAVAILABLE'],
            };
          }
          log.info('---initiateTransactionRes---');
          return {
            messageCode: ResponseMappings['SUCCESS'],
            data:
              initiateTransactionRes.data.data ||
              initiateTransactionRes.data ||
              initiateTransactionRes,
          };

        case paymentGateways.HALOTEL.toUpperCase():
          const callHalotelTransaction: any = {
            apiPath: ApiList['HALOTEL_USSD_PUSH_API'],
            body: {
              PartnerCode,
              SenderMsisdn: body.SenderMsisdn,
              ReferenceMsisdn: body.ReferenceMsisdn,
              Amount: body.Amount,
            },
          };
          const [halotelTransactionErr, halotelTransactionRes]: any[] = await Utils.executePromise(
            Utils.callRequest(callHalotelTransaction),
          );
          if (
            halotelTransactionErr ||
            !(
              halotelTransactionRes?.success ||
              halotelTransactionRes?.data?.success ||
              halotelTransactionRes?.data?.data
            )
          ) {
            log.error(
              '---this.halotelTransactions.incomingApplicationFunction.halotelTransactionErr---',
              halotelTransactionErr,
            );
            log.info(
              '---this.halotelTransactions.incomingApplicationFunction.halotelTransactionRes?.data?.data---',
            );
            return {
              messageCode:
                initiateTransactionErr?.messageCode ||
                initiateTransactionErr?.data?.messageCode ||
                initiateTransactionRes?.messageCode ||
                initiateTransactionRes?.data?.messageCode ||
                ResponseMappings['SERVICE_UNAVAILABLE'],
            };
          }
          log.info(
            '---this.halotelTransactions.incomingApplicationFunction.halotelTransactionRes---',
          );
          return {
            messageCode: ResponseMappings['SUCCESS'],
            ...halotelTransactionRes.data,
          };

        default:
          return { messageCode: ResponseMappings['BAD_REQUEST'] };
      }
    } catch (error) {
      log.error('---callCommonApiForVendor.catch.error---', error);
      return { messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'] };
    }
  }

  async callCommonApiForBank(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body, headers } = request;
    log.info('---callCommonApiForBank.body---');

    const verifyToken: any = this.verfiyAuthorization(headers);
    log.info('---callCommonApiForBank.verifyToken---');
    log.info(verifyToken);
    if (!verifyToken.success) {
      return {
        messageCode: ResponseMappings['BAD_REQUEST'],
        success: verifyToken.success,
        msg: verifyToken.msg,
        data: {},
      };
    }
    const { PartnerCode, Operator } = verifyToken.data;
    switch (Operator.toUpperCase()) {
      case paymentGateways.CRDB.toUpperCase():
        const callMerchantVerification: any = {
          apiPath: ApiList['CRDB_MERCHANT_VERIFICATION_INTERNAL'],
          body: {
            MerchantDetails: {
              PartnerCode,
              MerchantAccountNumber: body.MerchantAccountNumber,
              MerchantName: body.MerchantName,
              MerchantMobileNumber: body.MerchantMobileNumber,
              Otp: body.Otp,
            },
          },
        };
        const [merchantErr, merchant]: any[] = await Utils.executePromise(
          Utils.callRequest(callMerchantVerification),
        );
        if (merchantErr) {
          log.error('---merchantErr---', merchantErr);
          return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
        } else if (!merchant?.success || !merchant?.data?.success || !merchant?.data?.data) {
          log.error('---!merchant?.success ||---');
          return (
            merchant?.data ||
            merchant || {
              messageCode: ResponseMappings['SERVICE_UNAVAILABLE'],
            }
          );
        }
        log.info('---merchant---');
        const callTransactionInitiation: any = {
          apiPath: ApiList['CRDB_INITIATE_TRANSACTION_INTERNAL'],
          body: {
            TransactionDetails: {
              PartnerCode,
              MerchantReferenceID: merchant.data.data.MerchantReferenceID,
              CurrencyCode: body.CurrencyCode || 'TZS',
              Amount: body.Amount,
            },
          },
        };
        const [transactionErr, transaction]: any[] = await Utils.executePromise(
          Utils.callRequest(callTransactionInitiation),
        );
        if (transactionErr) {
          log.error('---transactionErr---', transactionErr);
          return (
            transactionErr?.data ||
            transactionErr || {
              messageCode: ResponseMappings['SERVICE_UNAVAILABLE'],
            }
          );
        } else if (
          !transaction?.success ||
          !transaction?.data?.success ||
          !transaction?.data?.data
        ) {
          log.info('---!transaction?.success ||---');
          return (
            transaction?.data ||
            transaction || {
              messageCode: ResponseMappings['SERVICE_UNAVAILABLE'],
            }
          );
        }
        log.info('---transaction---');
        return transaction.data;
      case paymentGateways.NMB.toUpperCase():
        const callMerchantRegistration: any = {
          apiPath: ApiList['NMB_MERCHANT_REGISTRATION_INTERNAL'],
          body: {
            merchantDetails: {
              PartnerCode,
              MerchantAccountNumber: body.MerchantAccountNumber,
              MerchantName: body.MerchantName,
            },
          },
        };
        const [registerErr, register]: any[] = await Utils.executePromise(
          Utils.callRequest(callMerchantRegistration),
        );
        if (registerErr) {
          log.error('---registerErr---', registerErr);
          return (
            registerErr?.data ||
            registerErr || {
              messageCode: ResponseMappings['SERVICE_UNAVAILABLE'],
            }
          );
        } else if (
          !register?.success ||
          !register?.data?.success ||
          !register?.data?.data ||
          !register?.data?.data?.MerchantReferenceID
        ) {
          log.error('---!register?.success ||---');
          return (
            register?.data ||
            register || {
              messageCode: ResponseMappings['SERVICE_UNAVAILABLE'],
            }
          );
        }
        log.info('---register---');

        const callMerchantAuth: any = {
          apiPath: ApiList['NMB_MERCHANT_AUTH_INTERNAL'],
          body: {
            transactionDetails: {
              PartnerCode,
              MerchantReferenceID: register.data.data.MerchantReferenceID,
              Otp: body.Otp,
              CountryCode: body.CountryCode || 'TZS',
            },
          },
        };
        const [merchantAuthErr, merchantAuth]: any[] = await Utils.executePromise(
          Utils.callRequest(callMerchantAuth),
        );
        if (merchantAuthErr) {
          log.error('---merchantAuthErr---', merchantAuthErr);
          return (
            merchantAuthErr?.data ||
            merchantAuthErr || {
              messageCode: ResponseMappings['SERVICE_UNAVAILABLE'],
            }
          );
        } else if (
          !merchantAuth?.success ||
          !merchantAuth?.data?.success ||
          !merchantAuth?.data?.data
        ) {
          log.error('---!merchantAuth?.success ||---');
          return (
            merchantAuth?.data ||
            merchantAuth || {
              messageCode: ResponseMappings['SERVICE_UNAVAILABLE'],
            }
          );
        }
        log.info('---merchantAuth---');

        const callInitiateTransaction: any = {
          apiPath: ApiList['NMB_INITIATE_TRANSACTION_INTERNAL'],
          body: {
            transactionDetails: {
              PartnerCode,
              MerchantReferenceID: register.data.data.MerchantReferenceID,
              MobileNumber: body.MerchantMobileNumber,
              Amount: body.Amount,
              CountryCode: body.CountryCode || 'TZS',
            },
          },
        };

        const [nmbTransactionErr, nmbTransaction]: any[] = await Utils.executePromise(
          Utils.callRequest(callInitiateTransaction),
        );
        if (nmbTransactionErr) {
          log.error('---nmbTransactionErr---', nmbTransactionErr);
          return (
            nmbTransactionErr?.data ||
            nmbTransactionErr || {
              messageCode: ResponseMappings['SERVICE_UNAVAILABLE'],
            }
          );
        } else if (
          !nmbTransaction?.success ||
          !nmbTransaction?.data?.success ||
          !nmbTransaction?.data?.data
        ) {
          log.error('---!nmbTransaction?.success ||---');
          return (
            nmbTransaction?.data ||
            nmbTransaction || {
              messageCode: ResponseMappings['SERVICE_UNAVAILABLE'],
            }
          );
        }
        log.info('---nmbTransaction---');
        return nmbTransaction.data;

      case paymentGateways.DTB.toUpperCase():
        break;
      case paymentGateways.KCB.toUpperCase():
        break;
    }
    try {
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }
}
