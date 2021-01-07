/* eslint-disable @typescript-eslint/no-explicit-any */
import { paymentVendorDef } from '../api-specs/payment-vendor';
import {
  api,
  authenticate,
  Filter,
  inject,
  repository,
  Request,
  RestBindings,
  rp,
  Utils,
  xml2Json,
} from '../common';
import {
  ApiList,
  DateTimeFormats,
  InterfaceList,
  JWT_STRATEGY_NAME,
  POST_METHOD,
  ResponseMappings,
  SecretKeys,
  STATUS,
} from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { PaymentPartnerRepository, PaymentVendorRepository } from '../repositories';

const log = new LoggingInterceptor('payment-vendor.Controller');
const { HoursFormat, MqFormat } = DateTimeFormats;

@api(paymentVendorDef)
export class PaymentVendorController {
  constructor(
    @repository(PaymentVendorRepository)
    public paymentVendorRepository: PaymentVendorRepository,

    @repository(PaymentPartnerRepository)
    public paymentPartnerRepository: PaymentPartnerRepository,
  ) {}

  async checkUserForAzamTV(referenceNumber: any): Promise<any> {
    try {
      log.info('---checkUserForAzamTV.referenceNumber---');
      log.info(referenceNumber);
      const options = {
        apiPath: ApiList['CHECK_AZAM_TV_REQUEST'],
        body: {
          referenceNo: Utils.generateReferenceID(referenceNumber.toString()),
          referenceNumber: {
            senderMsisdn: referenceNumber.senderMsisdn,
          },
        },
      };
      return await Utils.callRequest(options)
        .then((customerInfo: any) => {
          const cusinfo = JSON.parse(xml2Json.toJson(customerInfo.data));
          log.info('---cusinfo---');
          let info: any = xml2Json.toJson(
            cusinfo['soap:Envelope']['soap:Body']['GetCustomerInfoResponse'][
              'GetCustomerInfoResult'
            ],
          );
          info = JSON.parse(info);
          if ([0, '0'].indexOf(info['RESPONSEINFO']['STATUS']['ERRORNO']) == -1) {
            log.info('customer error from MQ111');
            return {
              success: false,
              message: 'Something went while fetching data from MQ Services',
              requestBody: customerInfo.requestBody,
              responseBody: customerInfo.responseBody,
              data: info,
              isFromMQ: true,
            };
          } else {
            log.info('customer success from MQ');
            return {
              success: true,
              message: 'Smart card found with  a valid customer',
              requestBody: customerInfo.requestBody,
              responseBody: customerInfo.responseBody,
              data: info,
              isFromMQ: true,
            };
          }
        })
        .catch((err: any) => {
          log.info('---checkUserForAzamTV.callRequest.catch.err---');
          log.info(err);
          return {
            success: false,
            message: 'Something went while fetching data from MQ Services',
            requestBody: err.requestBody,
            responseBody: err.responseBody,
            data: err,
            isFromMQ: true,
          };
        });
    } catch (error) {
      log.error('---checkUserForAzamTV.catch.err---');
      log.error(error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        requestBody: error.requestBody,
        responseBody: error.responseBody,
        msg: error.msg || 'Internal server error',
        data: error.data || {},
      };
    }
  }

  async checkUserForConnectedApp(data: any): Promise<any> {
    try {
      const { request, routeInfo } = data;
      const options = {
        method: POST_METHOD,
        url: routeInfo.VendorIntimationRoute,
        headers: {
          'Content-type': 'application/json',
        },
        body: {
          operator: request.operator,
          reference: request.ReferenceID,
          utilityref: request.utilityref,
          amount: request.Amount,
          transid: request.TXNID,
          msisdn: request.MSISDN,
        },
        json: true, // Automatically stringifies the body to JSON
      };
      log.info('---request_promise---');
      log.info(options);
      return await rp(options)
        .then((appUser: any) => {
          log.info('---checkUserForConnectedApp.then---');
          log.info(appUser);
          if (appUser) {
            return {
              success: true,
              message: 'User found with Coonnected App',
              requestBody: appUser.requestBody,
              responseBody: appUser.responseBody,
              data: appUser,
            };
          } else {
            return {
              success: false,
              message: 'User not found with connected App',
              requestBody: appUser.requestBody,
              responseBody: appUser.responseBody,
              data: appUser,
            };
          }
        })
        .catch((err: any) => {
          log.info('---checkUserForConnectedApp.rp.catch.err---');
          log.info(err);
          return {
            success: false,
            message: 'Something went wrong',
            requestBody: err.requestBody || options,
            responseBody: err.responseBody || err,
            data: err,
          };
        });
    } catch (error) {
      log.error('---checkUserForConnectedApp.catch.err---');
      log.error(error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        message: error.msg || 'Internal server error',
        requestBody: error.requestBody || data,
        responseBody: error.responseBody || error,
        data: error.data || {},
      };
    }
  }

  async payUserForConnectedApp(reference: any): Promise<any> {
    try {
      const { request, routeDetails } = reference;
      let message = request.Message;
      // Airtel
      if (message?.toString().toLowerCase().indexOf('invalid pin') > -1) {
        message = 'Invalid Request check PIN';
      }
      // Airtel
      if (message?.toString().toLowerCase().indexOf('pin you have entered is incorrect') > -1) {
        message = 'Invalid PIN number';
      }
      // Airtel
      if (message?.toString().toLowerCase().indexOf('insufficient') > -1) {
        message = 'You dont have sufficient balance';
      }
      // Airtel
      if (message?.toString().toLowerCase().indexOf('general processing') > -1) {
        message = 'Failed to generate USSD Menu. Please contact your MNO';
      }

      // Airtel
      if (message?.toString().toLowerCase().indexOf('no response from flares') > -1) {
        message = 'You have not entered the PIN. USSD Expired.';
      }
      // Tigo
      if (message?.toString().toLowerCase().indexOf('username and password') > -1) {
        message = 'Invalid Request check username or password';
      }

      //=============
      // Airtel
      if (message?.toString().indexOf('User name or password empty') > -1) {
        message = 'Invalid Request check username or password';
      }
      // Airtel
      if (message?.toString().indexOf('CustomerMSISDN not passed') > -1) {
        message = 'Failed to pass customer number';
      }

      // Airtel
      if (message?.toString().indexOf('Password not passed') > -1) {
        message = 'Failed to send password';
      }
      // Tigo
      if (message?.toString().indexOf('Invalid MSISDN') > -1) {
        message = 'Invalid Request check username or password';
      }

      if (message?.toString().indexOf('Username/Password provided is wrong') > -1) {
        message = 'Invalid Request check username or password';
      }
      // Airtel
      if (message?.toString().indexOf('BillerMSISDN not passed') > -1) {
        message = 'Invalid Request customer number not provided';
      }
      // Airtel
      if (message?.toString().indexOf('Failed in Min and Max Amount') > -1) {
        message = 'Invalid Request passed either minimum or maximum limit of transactions';
      }

      // Tigo
      if (message?.toString().indexOf('Biller not active') > -1) {
        message = 'Invalid Request you dont have a active account';
      }

      log.info('---reference---');
      log.info(reference);
      if (routeDetails.VendorProcessingRoute) {
        const options: any = {
          url: routeDetails.VendorProcessingRoute,
          headers: {
            'Content-type': 'application/json',
          },
          rejectUnauthorized: false,
          method: POST_METHOD,
          body: {
            message,
            transactionstatus: request.TransactionStatus,
            operator: request.Operator,
            reference: request.ReferenceID,
            externalreference: request.ExternalReferenceID,
            utilityref: request.UtilityReference,
            amount: request.Amount,
            transid: request.TansactionID,
            msisdn: request.Msisdn,
          },
          json: true,
        };

        log.info('---rp.options---');
        log.info(options);
        return await Utils.callRequest(options)
          .then((appUser: any) => {
            log.info('---AzamApp---');
            log.info(appUser);
            return appUser;
          })
          .catch((err: any) => {
            log.info('---payUserForConnectedApp.callRequest.catch.err---');
            console.dir(err);
            return err;
          });
      } else {
        log.info('---No.vendor.route.provided---');
        log.info(routeDetails);
        return {
          success: true,
          message: 'No vendor route provided',
          data: {},
        };
      }
    } catch (error) {
      log.error('---payUserForConnectedApp.catch.err---');
      console.dir(error);
      return error;
    }
  }

  async paymentMQServices(data: any): Promise<any> {
    try {
      const { request, routeInfo } = data;
      const options = {
        apiPath: ApiList['PAYMENT_BY_MQ_SERVICE'],
        body: {
          smartCardNo: request.smartCardNo,
          amount: request.amount,
          reciptNo: request.reciptNo,
          referenceNo: request.referenceNo,
          paymentDate: Utils.fetchFormattedTimestamp({
            timestamp: Utils.addCalculatedTimestamp({
              timestamp: Utils.fetchCurrentTimestamp(),
              offset: 3,
              unit: HoursFormat,
            }),
            format: MqFormat,
          }),
          remarks: `${request.operator}|${Utils.returnDisplayingMsisdn(request.SenderMsisdn)}`,
        },
      };
      return await Utils.callRequest(options)
        .then((paymentInfo: any) => {
          log.info('---paymentInfo.xml---');
          const pay = JSON.parse(xml2Json.toJson(paymentInfo.data));
          if (pay['soap:Envelope']['soap:Body']['MakePaymentResponse']['MakePaymentResult']) {
            const paymentRes = JSON.parse(
              xml2Json.toJson(
                pay['soap:Envelope']['soap:Body']['MakePaymentResponse']['MakePaymentResult'],
              ),
            );
            log.info('---------paymentRes');
            if ([0, '0'].indexOf(paymentRes.RESPONSEINFO.STATUS.ERRORNO) > -1) {
              return {
                success: true,
                message: 'Smart card successfully validated, payment info recieved',
                requestBody: paymentInfo.requestBody,
                responseBody: paymentInfo.responseBody,
                data: paymentRes,
              };
            }
          }
          return {
            success: false,
            message: 'failed recharged with MQ',
            requestBody: paymentInfo.requestBody,
            responseBody: paymentInfo.responseBody,
            data: null,
          };
        })
        .catch((err: any) => {
          log.info('---paymentMQServices.rp.catch.error---');
          log.info(err);
          return {
            success: false,
            message: 'failed to recharge the MQ Payments',
            requestBody: err?.requestBody,
            responseBody: err?.responseBody,
            data: err,
          };
        });
    } catch (error) {
      log.error('---paymentMQServices.catch.error---');
      log.error(error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        requestBody: data,
        responseBody: error,
        data: error.data || {},
      };
    }
  }

  async validateGatewayRequestFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    try {
      const { body, headers } = request;
      const paymentVendorFilter: Filter = {
        where: {
          PaymentVendorName: body.VendorName,
          Status: STATUS.ACTIVE,
        },
      };
      const paymentVendorDetails: any = await this.paymentVendorRepository.findOne(
        paymentVendorFilter,
      );
      if (paymentVendorDetails?.PaymentVendorID) {
        log.info('---paymentVendorDetails---');
        log.info(paymentVendorDetails);
        const codeSchema: any = paymentVendorDetails.CodeSchema.replace(
          '%',
          `${paymentVendorDetails.VendorCode}${paymentVendorDetails.SecretCode}`,
        );
        if (
          !(codeSchema === headers.authorization) &&
          !body.PartnerCode &&
          paymentVendorDetails?.payment_partner &&
          !(body.PartnerCode === paymentVendorDetails?.payment_partner.PartnerCode)
        ) {
          return {
            success: false,
            statusCode: 400,
            msg: 'Unauthorized access',
            data: {},
          };
        }
        const gatewayDetails: any = {
          VendorCode: paymentVendorDetails?.VendorCode,
          PartnerCode: paymentVendorDetails?.PartnerCode,
        };
        log.info('---validateGatewayRequestFunction.gatewayDetails---');
        log.info(gatewayDetails);
        return {
          success: true,
          statusCode: 200,
          msg: 'Gateway successfully validated',
          data: {
            gatewayDetails,
          },
        };
      }
      log.info('---paymentVendorDetails_not_found---');
      return {
        success: false,
        statusCode: 400,
        msg: 'Bad request',
        data: {},
      };
    } catch (error) {
      log.error('---validategatewayRequestFunction_CATCH_ERROR---');
      log.error(error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        data: error.data || {},
      };
    }
  }

  @authenticate(JWT_STRATEGY_NAME)
  async updatePaymentVendorFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { body }: any = request;
    try {
      log.info('---updatePaymentVendorFunction.body---');
      log.info(body);

      const paymentVendorFilter: Filter = {
        where: {
          VendorCode: body?.VendorCode,
          Status: STATUS.PENDING,
        },
      };
      const [paymentVendorError, paymentVendor]: any = await Utils.executePromise(
        this.paymentVendorRepository.findOne(paymentVendorFilter),
      );
      if (paymentVendorError || !paymentVendor?.PaymentVendorID) {
        log.info('---paymentVendorError---');
        log.info(paymentVendorError);
        return { messageCode: ResponseMappings['INVALID_VENDOR'] };
      }
      log.info('---paymentVendor---');
      log.info(paymentVendor);

      const paymentPartnerFilter: Filter = {
        where: {
          PartnerCode: body?.PartnerCode,
          Status: STATUS.PENDING,
        },
      };
      const [paymentPartnerError, paymentPartner]: any = await Utils.executePromise(
        this.paymentPartnerRepository.findOne(paymentPartnerFilter),
      );
      if (paymentPartnerError || !paymentPartner?.PaymentPartnerID) {
        log.info('---paymentPartnerError---');
        log.info(paymentPartnerError);
        return { messageCode: ResponseMappings['INVALID_PARTNER'] };
      }
      log.info('---paymentPartner---');
      log.info(paymentPartner);

      const updatedPaymentVendorObj: any = Object.assign(paymentVendor, {
        PaymentVendorDescription: `${paymentVendor.PaymentVendorName.toUpperCase()}-${paymentPartner.PaymentPartnerName.toUpperCase()}`,
        VendorCode: Utils.hashBasedEncryption(
          paymentVendor?.CodeScheme.toUpperCase(),
          paymentVendor?.PaymentVendorName,
          SecretKeys.PaymentVendor,
          Utils.fetchCurrentTimestamp(),
        ),
        Status: STATUS.ACTIVE,
      });
      delete updatedPaymentVendorObj['PaymentVendorID'];

      const updatedPaymentPartnerObj: any = Object.assign(paymentPartner, {
        PaymentVendorID: paymentVendor.PaymentVendorID,
        PaymentPartnerDescription: `${paymentPartner.PaymentPartnerName.toUpperCase()}-${paymentVendor.PaymentVendorName.toUpperCase()}`,
        PartnerCode: Utils.hashBasedEncryption(
          paymentPartner?.CodeScheme.toUpperCase(),
          paymentPartner?.PaymentPartnerName,
          paymentPartner?.CollectionAccountNumber,
          paymentPartner?.CollectionAccountPassword,
          paymentPartner?.Username,
          paymentPartner?.Password,
          SecretKeys.PaymentPartner,
          Utils.fetchCurrentTimestamp(),
        ),
        Status: STATUS.ACTIVE,
      });
      delete updatedPaymentPartnerObj['PaymentPartnerID'];

      const updatePreviousVendor: any = await Utils.executePromise(
        this.paymentVendorRepository.updateById(paymentVendor.PaymentVendorID, {
          Status: STATUS.INACTIVE,
        }),
      );
      const updatePreviousPartner: any = await Utils.executePromise(
        this.paymentPartnerRepository.updateById(paymentPartner.PaymentPartnerID, {
          Status: STATUS.INACTIVE,
        }),
      );
      if (!updatePreviousVendor || !updatePreviousPartner) {
        log.info('---updatePreviousVendor.update.failure---');
        log.info(updatePreviousVendor);
        log.info('---updatePreviousPartner.update.failure---');
        log.info(updatePreviousPartner);
        return { messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'] };
      }
      log.info('---updatePreviousVendor.update.success---');
      log.info(updatePreviousVendor);
      log.info('---updatePreviousPartner.update.success---');
      log.info(updatePreviousPartner);

      const [updatedPaymentVendorError, updatedPaymentVendor]: any = await Utils.executePromise(
        this.paymentVendorRepository.create(updatedPaymentVendorObj),
      );
      const [updatedPaymentPartnerError, updatedPaymentPartner]: any = await Utils.executePromise(
        this.paymentPartnerRepository.create(updatedPaymentPartnerObj),
      );
      if (updatedPaymentVendorError || updatedPaymentPartnerError) {
        log.info('---updatedPaymentVendorError---');
        log.info(updatedPaymentVendorError);
        log.info('---updatedPaymentPartnerError---');
        log.info(updatedPaymentPartnerError);
        return {
          messageCode: ResponseMappings['INVALID_PARTNER'],
        };
      }
      log.info('---updatedPaymentVendor---');
      log.info(updatedPaymentVendor);
      log.info('---updatedPaymentPartner---');
      log.info(updatedPaymentPartner);

      return { messageCode: ResponseMappings['UPDATE_SUCCESS'] };
    } catch (error) {
      log.error('---updatePaymentVendorFunction.catch.error---');
      log.error(error);
      return {
        messageCode: ResponseMappings['SERVICE_UNAVAILABLE'],
        data: error || {},
      };
    }
  }
}
