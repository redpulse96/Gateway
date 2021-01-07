import { kcbDef } from '../api-specs/kcb-transactions';
import { api, GatewayInterface, inject, repository, Request, RestBindings, Utils } from '../common';
import { ApiList, paymentGateways, ResponseMappings, RESPONSE_TYPE, STATUS } from '../constants';
import { KcbTransactionConstant } from '../constants/kcb-transactions';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { RabbitMqProducer } from '../queue';
import { PaymentPartnerRepository, PaymentVendorRepository } from '../repositories';
const log = new LoggingInterceptor('kcb.Controller');
export const kcbRabbitMq = new RabbitMqProducer('gateway');
@api(kcbDef)
export class KcbTransactions {
  constructor(
    @repository(PaymentVendorRepository)
    public paymentVendorRepository: PaymentVendorRepository,

    @repository(PaymentPartnerRepository)
    public paymentPartnerRepository: PaymentPartnerRepository,
  ) {}
  private gatewayParams: GatewayInterface = new GatewayInterface(paymentGateways['KCB']);

  private saveGatewayTransaction(request: any, requestType: string) {
    let gatewayOptions: any = {};
    let queue: string = '';
    switch (requestType) {
      case KcbTransactionConstant['loanRequestKey']:
        queue = KcbTransactionConstant['loanRequestKey'];
        gatewayOptions = {
          apiName: 'addTransaction',
          body: {
            ReferenceMsisdn: request.ReferenceMsisdn,
            LoanAmount: request.LoanAmount,
            ReferenceID: request.ReferenceID,
            ExternalReferenceID: request.ExternalReferenceID,
            Status: request.Status,
            Source: KcbTransactionConstant['Source'],
            Operations: [
              {
                operation: ApiList['LOAN_REQUEST'],
                Status: request.Status,
                requestBody: request.requestBody,
                responseBody: request.responseBody,
              },
            ],
          },
        };

        break;
      case KcbTransactionConstant['loanRequestCallbackKey']:
        queue = KcbTransactionConstant['loanRequestCallbackKey'];
        gatewayOptions.body = { ...request };
        break;
      case KcbTransactionConstant['loanRepaymentKey']:
        queue = KcbTransactionConstant['loanRepaymentKey'];
        gatewayOptions.body = { ...request };
        break;
      case KcbTransactionConstant['loanRepaymentCallbackKey']:
        queue = KcbTransactionConstant['loanRepaymentCallbackKey'];
        gatewayOptions.body = { ...request };
        break;
      case KcbTransactionConstant['queryLoanLimit']:
        queue = KcbTransactionConstant['queryLoanLimit'];
        gatewayOptions.body = { ...request };
        break;
      case KcbTransactionConstant['queryLoanBalance']:
        queue = KcbTransactionConstant['queryLoanBalance'];
        gatewayOptions.body = { ...request };
        break;
    }
    kcbRabbitMq.sendToQueue(JSON.stringify(gatewayOptions), queue);
  }

  // SEND LOAN REQUEST
  async loanRequestFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body }: any = request;
    log.info('---Into.loanRequestFunction---');
    log.info(body);

    if (!body || Utils.isEmpty(body)) {
      return { message: ResponseMappings['MISSING_REQUIRED_PARAM'] };
    }

    // CALL REQUEST TO KCB FOR LOAND REQUEST
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
      log.info('---Into.paymentPartnerFilter.loanRequestFunction---');
      log.info(paymentPartnerFilter);
      const [paymentPartnerErr, paymentPartnerRes]: any = await Utils.executePromise(
        this.paymentPartnerRepository.findOne(paymentPartnerFilter),
      );
      if (paymentPartnerErr) {
        log.info('---paymentPartnerErr---');
        log.info(paymentPartnerErr);
        return {
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          data: paymentPartnerErr?.data ? paymentPartnerErr?.data : {},
        };
      } else if (
        !paymentPartnerRes?.PaymentPartnerID ||
        !paymentPartnerRes?.payment_vendor?.VendorCode
      ) {
        log.info('---paymentPartnerRes---');
        log.info(paymentPartnerRes);
        return {
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          data: {},
        };
      }

      const apiBody: any = {
        Operation: KcbTransactionConstant.Operations['loanRequest'],
        Msisdn: body.ReferenceMsisdn,
        Amount: body.Amount,
        Message: body.Message,
        VendorCode: paymentPartnerRes.payment_vendor.VendorCode,
      };
      const callRequestOptions: any = {
        apiPath: ApiList['LOAN_REQUEST'],
        body: KcbTransactionConstant.generateRequestObject(apiBody),
      };

      const [callRequestErr, callRequestRes]: any = await Utils.executePromise(
        Utils.callRequest(callRequestOptions),
      );

      if (callRequestErr || (callRequestRes && !callRequestRes.success)) {
        log.error('---Into.callRequestErr.loanRequestFunction---');
        log.error(callRequestErr);
        log.error('---Into.callRequestRes.loanRequestFunction---');
        log.error(callRequestRes);
        return {
          messageCode: ResponseMappings['SOMETHING_WENT_WRONG'],
          data: callRequestErr?.data ? paymentPartnerErr?.data : callRequestRes,
        };
      }
      log.info('---callRequestRes.loanRequestFunction---');
      log.info(callRequestRes);
      const processedResponse: any = KcbTransactionConstant.processResponseBody(
        callRequestRes.data,
        apiBody,
      );
      const callGatewayOptions: any = {
        ReferenceMsisdn: apiBody.ReferenceMsisdn,
        LoanAmount: apiBody.Amount,
        ReferenceID: processedResponse.ReferenceID,
        ExternalReferenceID: processedResponse.ExternalReferenceID,
        Status: STATUS.LOAN_REQUEST,
        PaymentVendor: paymentPartnerRes.payment_vendor,
        Operations: [
          {
            operation: ApiList['LOAN_REQUEST'],
            Status: STATUS.LOAN_REQUEST,
            requestBody: callRequestRes.requestBody,
            responseBody: callRequestRes.responseBody,
          },
        ],
      };
      this.saveGatewayTransaction(callGatewayOptions, KcbTransactionConstant['loanRequestKey']);
      return { ...processedResponse };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  // GET LOAN REQUEST CALLBACK
  async loanRequestCallbackFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body }: any = request;
    log.info('---Into.loanRequestCallbackFunction---');
    log.info(body);

    if (!body || Utils.isEmpty(body)) {
      return { message: ResponseMappings['MISSING_REQUIRED_PARAM'] };
    }
    try {
      const callGatewayOptions = {
        apiName: 'fetchTransaction',
        body: {
          where: {
            ReferenceID: body.TransactionID,
          },
        },
      };
      const [transactionError, transaction]: any[] = await Utils.executePromise(
        this.gatewayParams.callGateway(callGatewayOptions),
      );

      if (transactionError) {
        log.error('---loanRequestCallbackFunction.transactionError---');
        log.error(transactionError);
        return {
          messageCode: ResponseMappings['SOMETHING_WENT_WRONG'],
          data: transactionError ? transactionError : {},
        };
      } else if (
        !transaction?.success ||
        !transaction?.data ||
        !transaction?.data?.kcbTransaction
      ) {
        log.info(
          '---!transaction?.success || !transaction?.data || !transaction?.data?.kcbTransaction---',
        );
        log.info(transaction);
        return { messageCode: ResponseMappings['BAD_REQUEST'] };
      }
      log.info('---transaction---');
      log.info(transaction);

      const kcbTransaction: any = transaction.data.kcbTransaction;
      const operations: any = kcbTransaction.Operations;

      const saveTransaction: any = {
        routeInfo: kcbTransaction.PaymentVendor,
        UpdateTransactions: {
          UpdateFilter: {
            KcbTransactionID: kcbTransaction.KcbTransactionID,
          },
          UpdateAttributes: {
            ReferenceMsisdn: kcbTransaction.ReferenceMsisdn,
            LoanAmount: body.LoanAmount,
            LoanAccountNo: body.LoanAccountNo,
            LoanType: body.LoanType,
            LoanStartDate: body.LoanStartDate,
            PrincipalAmount: body.PrincipalAmount,
            LoanStatus: body.LoanStatus,
            LoanBalance: body.LoanBalance,
            InterestRate: body.InterestRate,
            InterestAmount: body.InterestAmount,
            Operations: operations,
            Status: STATUS.LOAN_REQUEST_CALLBACK,
          },
        },
        CreateTransactions: {
          ...kcbTransaction,
          ReferenceID: Utils.generateReferenceID(
            kcbTransaction.ReferenceID,
            kcbTransaction.ReferenceMsisdn,
          ),
          ExternalReferenceID: Utils.generateReferenceID(
            kcbTransaction.ExternalReferenceID,
            kcbTransaction.ReferenceMsisdn,
          ),
          RequestedTransactionID: kcbTransaction.ReferenceID,
          ReferenceMsisdn: kcbTransaction.ReferenceMsisdn,
          LoanAmount: body.LoanAmount,
          LoanAccountNo: body.LoanAccountNo,
          LoanType: body.LoanType,
          LoanStartDate: body.LoanStartDate,
          PrincipalAmount: body.PrincipalAmount,
          LoanStatus: body.LoanStatus,
          LoanBalance: body.LoanBalance,
          InterestRate: body.InterestRate,
          InterestAmount: body.InterestAmount,
          Source: KcbTransactionConstant.Source,
          Status: STATUS.LOAN_REQUEST_CALLBACK,
          Operations: [{ ...operations }],
        },
      };
      operations.push({
        Status: STATUS.LOAN_REQUEST_CALLBACK,
        operation: 'loanRequestCallback',
        requestBody: { ...body },
      });
      this.saveGatewayTransaction(
        saveTransaction,
        KcbTransactionConstant['loanRequestCallbackKey'],
      );
      return {
        StatusCode: '0',
        StatusDescription: 'Success',
        MSISDN: kcbTransaction.ReferenceMsisdn,
        TransactionType: '1012',
        TransactionID: kcbTransaction.ReferenceID,
        LoanAmount: body.LoanAmount,
        LoanAccountNo: body.LoanAccountNo,
        LoanType: body.LoanType,
        LoanStartDate: body.LoanStartDate,
        PrincipalAmount: body.PrincipalAmount,
        LoanStatus: body.LoanStatus,
        LoanBalance: body.LoanBalance,
        InterestRate: body.InterestRate,
        InterestAmount: body.InterestAmount,
        RepaymentDate: body.RepaymentDate,
        TransTime: body.TransTime,
      };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  // SEND LOAN REPAYMENT
  async loanRepaymentFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body }: any = request;
    log.info('---Into.loanRepaymentFunction---');
    log.info(body);

    if (!body || Utils.isEmpty(body)) {
      return { message: ResponseMappings['MISSING_REQUIRED_PARAM'] };
    }

    // CALL REQUEST TO KCB FOR LOAND REQUEST
    try {
      const callGatewayOptions: any = {
        apiName: 'fetchTransaction',
        body: {
          where: {
            ReferenceID: body.ReferenceID,
          },
        },
      };
      const [transactionErr, transaction]: any[] = await Utils.executePromise(
        this.gatewayParams.callGateway(callGatewayOptions),
      );

      if (transactionErr) {
        log.error('---transactionErr---');
        log.error(transactionErr);
        return {
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          data: transactionErr?.data || {},
        };
      } else if (
        !transaction?.success ||
        !transaction?.data ||
        !transaction?.data?.kcbTransaction
      ) {
        log.info(
          '---!transaction?.success || !transaction?.data || !transaction?.data?.kcbTransaction---',
        );
        log.error(transaction);
        return {
          messageCode: ResponseMappings['BAD_REQUEST'],
          data: transaction?.data || {},
        };
      }
      log.info('---transaction---');
      log.info(transaction);
      const kcbTransaction = transaction.data.kcbTransaction;

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
      log.info('---Into.paymentPartnerFilter.loanRepaymentFunction---');
      log.info(paymentPartnerFilter);
      const [paymentPartnerErr, paymentPartnerRes]: any = await Utils.executePromise(
        this.paymentPartnerRepository.findOne(paymentPartnerFilter),
      );

      if (paymentPartnerErr) {
        log.info('---paymentPartnerErr.loanRepaymentFunction---');
        log.info(paymentPartnerErr);
        return {
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          data: paymentPartnerErr?.data || {},
        };
      } else if (
        !paymentPartnerRes?.PaymentPartnerID ||
        !paymentPartnerRes.payment_vendor.VendorCode
      ) {
        log.info('---!paymentPartnerRes?.PaymentPartnerID---');
        log.info(paymentPartnerRes);
        return {
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          data: paymentPartnerRes?.data || {},
        };
      }
      log.info('---paymentPartnerRes---');
      log.info(paymentPartnerRes);

      const apiBody: any = {
        Operation: KcbTransactionConstant.Operations['loanPayment'],
        Msisdn: kcbTransaction.ReferenceMsisdn,
        Amount: body.Amount,
        Message: body.Message,
        VendorCode: paymentPartnerRes.payment_vendor.VendorCode,
      };
      const callRequestOptions: any = {
        apiPath: ApiList['LOAN_REPAYMENT'],
        body: KcbTransactionConstant.generateRequestObject(apiBody),
      };

      const [callRequestErr, callRequestRes]: any = await Utils.executePromise(
        Utils.callRequest(callRequestOptions),
      );
      if (callRequestErr || (callRequestRes && !callRequestRes.success)) {
        log.info('---Into callRequestErr loanRequestFunction---');
        log.info(callRequestErr);
        log.info('---Into callRequestRes loanRequestFunction---');
        log.info(callRequestRes);
        return {
          success: RESPONSE_TYPE['ERROR'],
          messageCode: ResponseMappings['SOMETHING_WENT_WRONG'],
          data: callRequestErr?.data ? paymentPartnerErr?.data : callRequestRes,
        };
      }
      const processedResponse: any = KcbTransactionConstant.processResponseBody(
        callRequestRes.data,
        apiBody,
      );
      const operations = kcbTransaction.Operations;
      const saveTransaction: any = {
        UpdateTransactions: {
          UpdateFilter: {
            KcbTransactionID: kcbTransaction.KcbTransactionID,
          },
          UpdateAttributes: {
            Status: STATUS.LOAN_PAYMENT_INITIATED,
            Operations: operations,
          },
        },
        CreateTransactions: {
          ReferenceMsisdn: apiBody.ReferenceMsisdn,
          LoanAmount: apiBody.Amount,
          ReferenceID: processedResponse.ReferenceID,
          ExternalReferenceID: processedResponse.ExternalReferenceID,
          Status: STATUS.LOAN_PAYMENT_INITIATED,
          Operations: [
            {
              operation: ApiList['LOAN_REPAYMENT'],
              Status: STATUS.LOAN_PAYMENT_INITIATED,
              requestBody: callRequestRes.requestBody,
              responseBody: callRequestRes.responseBody,
            },
          ],
        },
      };
      operations.push({
        operation: ApiList['LOAN_REPAYMENT'],
        Status: STATUS.LOAN_PAYMENT_INITIATED,
        requestBody: callRequestRes.requestBody,
        responseBody: callRequestRes.responseBody,
      });
      this.saveGatewayTransaction(saveTransaction, KcbTransactionConstant.loanRepaymentKey);
      return processedResponse;
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  // GET LOAN REPAYMENT CALLBACK

  async loanRepaymentCallbackFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body }: any = request;
    log.info('---Into.loanRequestCallbackFunction---');
    log.info(body);

    if (!body || Utils.isEmpty(body)) {
      return { message: ResponseMappings['MISSING_REQUIRED_PARAM'] };
    }
    try {
      const callGatewayOptions = {
        apiName: 'fetchTransaction',
        body: {
          where: {
            ReferenceID: body.TransactionID,
          },
        },
      };
      const [transactionError, transaction]: any[] = await Utils.executePromise(
        this.gatewayParams.callGateway(callGatewayOptions),
      );

      if (transactionError) {
        log.error('---loanRequestCallbackFunction.transactionError---');
        log.error(transactionError);
        return {
          messageCode: ResponseMappings['SOMETHING_WENT_WRONG'],
          data: transactionError ? transactionError : {},
        };
      } else if (
        !transaction?.success ||
        !transaction?.data ||
        !transaction?.data?.kcbTransaction
      ) {
        log.info(
          '---!transaction?.success || !transaction?.data || !transaction?.data?.kcbTransaction---',
        );
        log.info(transaction);
        return { messageCode: ResponseMappings['BAD_REQUEST'] };
      }
      log.info('---transaction---');
      log.info(transaction);

      const kcbTransaction: any = transaction.data.kcbTransaction;
      const operations: any = kcbTransaction.Operations;

      const saveTransaction: any = {
        routeInfo: kcbTransaction.PaymentVendor,
        UpdateTransactions: {
          UpdateFilter: {
            KcbTransactionID: kcbTransaction.KcbTransactionID,
          },
          UpdateAttributes: {
            ReferenceMsisdn: kcbTransaction.ReferenceMsisdn,
            LoanAmount: body.LoanAmount,
            LoanAccountNo: body.LoanAccountNo,
            LoanType: body.LoanType,
            LoanStartDate: body.LoanStartDate,
            PrincipalAmount: body.PrincipalAmount,
            LoanPaid: body.LoanPaidAmount,
            LoanStatus: body.LoanStatus,
            LoanBalance: body.LoanBalance,
            InterestRate: body.InterestRate,
            InterestAmount: body.InterestAmount,
            Status: STATUS.LOAN_PAYMENT_CALLBACK,
            Operations: operations,
          },
        },
        CreateTransactions: {
          ...kcbTransaction,
          ReferenceID: Utils.generateReferenceID(
            kcbTransaction.ReferenceID,
            kcbTransaction.ReferenceMsisdn,
          ),
          ExternalReferenceID: Utils.generateReferenceID(
            kcbTransaction.ExternalReferenceID,
            kcbTransaction.ReferenceMsisdn,
          ),
          RequestedTransactionID: kcbTransaction.ReferenceID,
          LoanAmount: body.LoanAmount,
          LoanAccountNo: body.LoanAccountNo,
          LoanType: body.LoanType,
          LoanStartDate: body.LoanStartDate,
          PrincipalAmount: body.PrincipalAmount,
          LoanPaid: body.LoanPaidAmount,
          LoanStatus: body.LoanStatus,
          LoanBalance: body.LoanBalance,
          InterestRate: body.InterestRate,
          InterestAmount: body.InterestAmount,
          Source: KcbTransactionConstant.Source,
          Status: STATUS.LOAN_PAYMENT_CALLBACK,
          Operations: [{ ...operations }],
        },
      };
      operations.push({
        Status: STATUS.LOAN_PAYMENT_CALLBACK,
        operation: 'loanRequestCallback',
        requestBody: { ...body },
      });
      this.saveGatewayTransaction(
        saveTransaction,
        KcbTransactionConstant['loanRepaymentCallbackKey'],
      );
      return {
        StatusCode: '0',
        StatusDescription: 'Success',
        MSISDN: kcbTransaction.ReferenceMsisdn,
        TransactionType: '1012',
        TransactionID: kcbTransaction.ReferenceID,
        LoanAmount: body.LoanAmount,
        LoanAccountNo: body.LoanAccountNo,
        LoanType: body.LoanType,
        LoanStartDate: body.LoanStartDate,
        PrincipalAmount: body.PrincipalAmount,
        LoanStatus: body.LoanStatus,
        LoanBalance: body.LoanBalance,
        InterestRate: body.InterestRate,
        InterestAmount: body.InterestAmount,
        RepaymentDate: body.RepaymentDate,
        TransTime: body.TransTime,
      };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  // GET LOAN BALANCE SYNC CALL

  async queryLoanLimitFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body }: any = request;
    log.info('---Into loanRepaymentFunction---');
    log.info(body);

    try {
      const callGatewayOptions: any = {
        apiName: 'fetchTransaction',
        body: {
          where: {
            ReferenceID: body.ReferenceID,
          },
        },
      };
      const [transactionError, transaction]: any[] = await Utils.executePromise(
        this.gatewayParams.callGateway(callGatewayOptions),
      );

      if (transactionError) {
        log.error('---transactionError---');
        log.error(transactionError);
        return {
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          data: transactionError?.data ? transactionError?.data : {},
        };
      } else if (!transaction?.success || !transaction?.data?.kcbTransaction) {
        log.info('---!transaction?.success || !transaction?.data?.kcbTransaction---');
        log.info(transaction);
        return {
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          data: {},
        };
      }
      log.info('---transaction---');
      log.info(transaction);

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
      const [paymentPartnerError, paymentPartner]: any[] = await Utils.executePromise(
        this.paymentPartnerRepository.findOne(paymentPartnerFilter),
      );

      if (paymentPartnerError) {
        log.error('---queryLoanLimitFunction.paymentPartnerError---');
        log.error(paymentPartnerError);
        return {
          messageCode: ResponseMappings['SOMETHING_WENT_WRONG'],
          data: paymentPartnerError ? paymentPartnerError : {},
        };
      } else if (!transaction?.PaymentPartnerID || !transaction?.payment_vendor?.VendorCode) {
        log.info(
          '---!transaction?.PaymentPartnerID || !transaction?.payment_vendor?.VendorCode---',
        );
        log.info(transaction);
        return {
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          data: {},
        };
      }
      log.info('---paymentPartner---');
      log.info(paymentPartner);

      const apiBody: any = {
        Operation: KcbTransactionConstant.Operations['loanLimit'],
        ReferenceID: transaction.ReferenceID,
        ReferenceMsisdn: transaction.ReferenceMsisdn,
        VendorCode: paymentPartner.payment_vendor.VendorCode,
      };

      const callRequestOptions = {
        apiPath: ApiList['QUERY_LOAN_LIMIT'],
        body: KcbTransactionConstant.generateRequestObject(apiBody),
      };
      const [callRequestError, callRequest]: any[] = await Utils.executePromise(
        Utils.callRequest(callRequestOptions),
      );

      if (callRequestError) {
        log.info('---Into callRequestErr loanRequestFunction---');
        log.info(callRequestError);
        return {
          messageCode: ResponseMappings['SOMETHING_WENT_WRONG'],
          data: callRequestError?.data ? callRequestError.data : {},
        };
      } else if (!callRequest.success) {
        log.info('---Into.callRequest---');
        log.info(callRequest);
        return {
          messageCode: ResponseMappings['SOMETHING_WENT_WRONG'],
          data: callRequest?.data ? callRequest.data : {},
        };
      }
      log.info('---callRequest---');
      log.info(callRequest);
      const kcbTransaction: any = transaction.data.kcbTransaction;
      const operations: any = kcbTransaction.Operations;
      const processedResponse: any = KcbTransactionConstant.processResponseBody(
        callRequest.data,
        apiBody,
      );
      const saveTransaction: any = {
        UpdateTransactions: {
          UpdateFilter: {
            KcbTransactionID: kcbTransaction.KcbTransactionID,
          },
          UpdateAttributes: {
            LoanLimit: processedResponse.LoanLimit,
            Operations: [operations],
          },
        },
        CreateTransactions: {
          apiName: 'addTransaction',
          body: {
            ReferenceID: processedResponse.ReferenceID,
            ExternalReferenceID: processedResponse.ExternalReferenceID,
            LoanLimit: processedResponse.LoanLimit,
            Status: STATUS.QUERY_LOAN_LIMIT,
            Source: KcbTransactionConstant.Source,
            Operations: [
              {
                operation: ApiList['QUERY_LOAN_LIMIT'],
                Status: STATUS.QUERY_LOAN_LIMIT,
                requestBody: callRequest.requestBody,
                responseBody: callRequest.responseBody,
              },
            ],
          },
        },
      };
      operations.push({
        operation: ApiList['QUERY_LOAN_LIMIT'],
        Status: STATUS.QUERY_LOAN_LIMIT,
        requestBody: callRequest.requestBody,
        responseBody: callRequest.responseBody,
      });
      this.saveGatewayTransaction(saveTransaction, KcbTransactionConstant['queryLoanLimit']);
      return processedResponse;
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  // GET LOAN LIMIT SYNC CALL

  async queryLoanBalanceFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body }: any = request;
    log.info('---Into.queryLoanBalanceFunction---');
    log.info(body);

    try {
      const callGatewayOptions: any = {
        apiName: 'fetchTransaction',
        body: {
          where: {
            ReferenceID: body.ReferenceID,
          },
        },
      };
      const [transactionError, transaction]: any[] = await Utils.executePromise(
        this.gatewayParams.callGateway(callGatewayOptions),
      );

      if (transactionError) {
        log.error('---transactionError---');
        log.error(transactionError);
        return {
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          data: transactionError?.data ? transactionError?.data : {},
        };
      } else if (!transaction?.success || !transaction?.data?.kcbTransaction) {
        log.info('---!transaction?.success || !transaction?.data?.kcbTransaction---');
        log.info(transaction);
        return {
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          data: {},
        };
      }
      log.info('---transaction---');
      log.info(transaction);

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
      const [paymentPartnerError, paymentPartner]: any[] = await Utils.executePromise(
        this.paymentPartnerRepository.findOne(paymentPartnerFilter),
      );

      if (paymentPartnerError) {
        log.error('---queryLoanBalanceFunction.paymentPartnerError---');
        log.error(paymentPartnerError);
        return {
          messageCode: ResponseMappings['SOMETHING_WENT_WRONG'],
          data: paymentPartnerError ? paymentPartnerError : {},
        };
      } else if (!transaction?.PaymentPartnerID || !transaction?.payment_vendor?.VendorCode) {
        log.info(
          '---!transaction?.PaymentPartnerID || !transaction?.payment_vendor?.VendorCode---',
        );
        log.info(transaction);
        return {
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          data: {},
        };
      }
      log.info('---paymentPartner---');
      log.info(paymentPartner);

      const apiBody: any = {
        Operation: KcbTransactionConstant.Operations['loanBalance'],
        ReferenceID: transaction.ReferenceID,
        ReferenceMsisdn: transaction.ReferenceMsisdn,
        VendorCode: paymentPartner.payment_vendor.VendorCode,
      };

      const callRequestOptions = {
        apiPath: ApiList['QUERY_LOAN_BALANCE'],
        body: KcbTransactionConstant.generateRequestObject(apiBody),
      };
      const [callRequestError, callRequest]: any[] = await Utils.executePromise(
        Utils.callRequest(callRequestOptions),
      );

      if (callRequestError) {
        log.info('---Into callRequestErr loanRequestFunction---');
        log.info(callRequestError);
        return {
          messageCode: ResponseMappings['SOMETHING_WENT_WRONG'],
          data: callRequestError?.data ? callRequestError.data : {},
        };
      } else if (!callRequest.success) {
        log.info('---Into.callRequest---');
        log.info(callRequest);
        return {
          messageCode: ResponseMappings['SOMETHING_WENT_WRONG'],
          data: callRequest?.data ? callRequest.data : {},
        };
      }
      log.info('---callRequest---');
      log.info(callRequest);
      const kcbTransaction: any = transaction.data.kcbTransaction;
      const operations: any = kcbTransaction.Operations;
      const processedResponse: any = KcbTransactionConstant.processResponseBody(
        callRequest.data,
        apiBody,
      );
      const saveTransaction: any = {
        UpdateTransactions: {
          UpdateFilter: {
            KcbTransactionID: kcbTransaction.KcbTransactionID,
          },
          UpdateAttributes: {
            LoanBalance: processedResponse.LoanBalance,
            Operations: [operations],
          },
        },
        CreateTransactions: {
          apiName: 'addTransaction',
          body: {
            ReferenceID: processedResponse.ReferenceID,
            ExternalReferenceID: processedResponse.ExternalReferenceID,
            LoanBalance: processedResponse.LoanBalance,
            Status: STATUS.QUERY_LOAN_BALANCE,
            Source: KcbTransactionConstant.Source,
            Operations: [
              {
                operation: ApiList['QUERY_LOAN_BALANCE'],
                Status: STATUS.QUERY_LOAN_BALANCE,
                requestBody: callRequest.requestBody,
                responseBody: callRequest.responseBody,
              },
            ],
          },
        },
      };
      operations.push({
        operation: ApiList['QUERY_LOAN_BALANCE'],
        Status: STATUS.QUERY_LOAN_BALANCE,
        requestBody: callRequest.requestBody,
        responseBody: callRequest.responseBody,
      });
      this.saveGatewayTransaction(saveTransaction, KcbTransactionConstant['queryLoanBalance']);
      return processedResponse;
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }
}
