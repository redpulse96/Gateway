import { GatewayInterface, inject, Utils } from '../common';
import { paymentGateways, STATUS } from '../constants';
import { KcbTransactionConstant } from '../constants/kcb-transactions';
import { kcbRabbitMq, PaymentVendorController } from '../controllers';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
const log = new LoggingInterceptor('kcb-mq.Producer');

export class KCBConsumer {
  constructor(
    @inject(`controllers.PaymentVendorController`)
    private paymentVendorController: PaymentVendorController,
  ) {}
  private kcbTransactionParameters: GatewayInterface = new GatewayInterface(paymentGateways['KCB']);

  private async processLoanRequestKey(data: any) {
    const callGatewayOptions: any = { ...data };
    log.info('---processLoanRequestKey.callGatewayOptions---');
    log.info(callGatewayOptions);
    const [callGatewayErr, callGateway]: any[] = await Utils.executePromise(
      this.kcbTransactionParameters.callGateway(callGatewayOptions),
    );

    if (callGatewayErr) {
      log.error('---processLoanRequestKey.callGatewayErr---');
      log.error(callGatewayErr);
      return callGatewayErr;
    }
    log.info('---processLoanRequestKey.callGateway---');
    log.info(callGateway);
    return callGateway;
  }

  private async processLoanRequestCallbackKey(data: any) {
    const { CreateTransactions, UpdateTransactions, routeInfo } = data;

    if (UpdateTransactions) {
      const paymentObj: any = {
        routeDetails: routeInfo,
        request: {
          TransactionStatus: 'success',
          Message: 'Loan request successfully applied',
          Operator: 'Kcb',
          ReferenceID: UpdateTransactions?.ReferenceID,
          ExternalReferenceID: UpdateTransactions?.ExternalReferenceID,
          UtilityReference: UpdateTransactions.ReferenceMsisdn,
          Amount: UpdateTransactions.LoanAmount,
          TansactionID: UpdateTransactions?.ReferenceID,
          Msisdn: UpdateTransactions.ReferenceMsisdn,
        },
      };
      const [paymentError, payment]: any[] = await Utils.executePromise(
        this.paymentVendorController.payUserForConnectedApp(paymentObj),
      );
      if (paymentError) {
        log.error('---paymentError---');
        log.error(paymentError);
        UpdateTransactions.UpdateAttributes.Operations.push({
          operation: 'payUserForConnectedApp',
          Status: STATUS.FAILURE,
          requestBody: paymentError.requestBody,
          responseBody: paymentError.responseBody,
        });
      } else if (!payment?.success) {
        log.error('---!payment?.success---');
        log.error(payment);
      }
      log.error('---payment---');
      log.error(payment);
      UpdateTransactions.UpdateAttributes.Operations.push({
        operation: 'payUserForConnectedApp',
        Status: UpdateTransactions.UpdateAttributes.Status,
        requestBody: payment.requestBody,
        responseBody: payment.responseBody,
      });
      const callGatewayOptions: any = {
        apiName: 'updateTransaction',
        body: {
          UpdateFilter: UpdateTransactions.UpdateFilter,
          UpdateAttributes: UpdateTransactions.UpdateAttributes,
        },
      };
      log.info('---processLoanRequestCallbackKey.callGatewayOptions---');
      log.info(callGatewayOptions);
      const [callGatewayErr, callGateway]: any[] = await Utils.executePromise(
        this.kcbTransactionParameters.callGateway(callGatewayOptions),
      );

      if (callGatewayErr) {
        log.error('---processLoanRequestCallbackKey.callGatewayErr---');
        log.error(callGatewayErr);
        return callGatewayErr;
      }
      log.info('---processLoanRequestCallbackKey.callGateway---');
      log.info(callGateway);
      return callGateway;
    }

    if (CreateTransactions) {
      const paymentObj: any = {
        routeDetails: routeInfo,
        request: {
          TransactionStatus: 'success',
          Message: 'Loan request successfully applied',
          Operator: 'Kcb',
          ReferenceID: CreateTransactions?.ReferenceID,
          ExternalReferenceID: CreateTransactions?.ExternalReferenceID,
          UtilityReference: CreateTransactions.ReferenceMsisdn,
          Amount: CreateTransactions.LoanAmount,
          TansactionID: CreateTransactions?.ReferenceID,
          Msisdn: CreateTransactions.ReferenceMsisdn,
        },
      };
      const [paymentError, payment]: any[] = await Utils.executePromise(
        this.paymentVendorController.payUserForConnectedApp(paymentObj),
      );
      if (paymentError) {
        log.error('---paymentError---');
        log.error(paymentError);
        CreateTransactions.Operations.push({
          operation: 'payUserForConnectedApp',
          Status: STATUS.FAILURE,
          requestBody: paymentError.requestBody,
          responseBody: paymentError.responseBody,
        });
      } else if (!payment?.success) {
        log.error('---!payment?.success---');
        log.error(payment);
      }
      log.error('---payment---');
      log.error(payment);
      CreateTransactions.Operations.push({
        operation: 'payUserForConnectedApp',
        Status: CreateTransactions.Status,
        requestBody: payment.requestBody,
        responseBody: payment.responseBody,
      });
      const callGatewayOptions: any = {
        apiName: 'addTransaction',
        body: { ...CreateTransactions },
      };
      log.info('---processLoanRequestCallbackKey.callGatewayOptions---');
      log.info(callGatewayOptions);
      const [callGatewayErr, callGateway]: any[] = await Utils.executePromise(
        this.kcbTransactionParameters.callGateway(callGatewayOptions),
      );

      if (callGatewayErr) {
        log.error('---processLoanRequestCallbackKey.callGatewayErr---');
        log.error(callGatewayErr);
        return callGatewayErr;
      }
      log.info('---processLoanRequestCallbackKey.callGateway---');
      log.info(callGateway);
      return callGateway;
    }
  }

  private async processLoanRepaymentKey(data: any) {
    const callGatewayOptions: any = { ...data };
    log.info('---processLoanRepaymentKey.callGatewayOptions---');
    log.info(callGatewayOptions);
    const [callGatewayErr, callGateway]: any[] = await Utils.executePromise(
      this.kcbTransactionParameters.callGateway(callGatewayOptions),
    );

    if (callGatewayErr) {
      log.error('---processLoanRepaymentKey.callGatewayErr---');
      log.error(callGatewayErr);
      return callGatewayErr;
    }
    log.info('---processLoanRepaymentKey.callGateway---');
    log.info(callGateway);
    return callGateway;
  }

  private async processLoanRepaymentCallbackKey(data: any) {
    const { CreateTransactions, UpdateTransactions, routeInfo } = data;

    if (UpdateTransactions) {
      const paymentObj: any = {
        routeDetails: routeInfo,
        request: {
          TransactionStatus: 'success',
          Message: 'Loan request successfully applied',
          Operator: 'Kcb',
          ReferenceID: UpdateTransactions?.ReferenceID,
          ExternalReferenceID: UpdateTransactions?.ExternalReferenceID,
          UtilityReference: UpdateTransactions.ReferenceMsisdn,
          Amount: UpdateTransactions.LoanAmount,
          TansactionID: UpdateTransactions?.ReferenceID,
          Msisdn: UpdateTransactions.ReferenceMsisdn,
        },
      };
      const [paymentError, payment]: any[] = await Utils.executePromise(
        this.paymentVendorController.payUserForConnectedApp(paymentObj),
      );
      if (paymentError) {
        log.error('---paymentError---');
        log.error(paymentError);
        UpdateTransactions.UpdateAttributes.Operations.push({
          operation: 'payUserForConnectedApp',
          Status: STATUS.FAILURE,
          requestBody: paymentError.requestBody,
          responseBody: paymentError.responseBody,
        });
      } else if (!payment?.success) {
        log.error('---!payment?.success---');
        log.error(payment);
      }
      log.error('---payment---');
      log.error(payment);
      UpdateTransactions.UpdateAttributes.Operations.push({
        operation: 'payUserForConnectedApp',
        Status: UpdateTransactions.UpdateAttributes.Status,
        requestBody: payment.requestBody,
        responseBody: payment.responseBody,
      });
      const callGatewayOptions: any = {
        apiName: 'updateTransaction',
        body: {
          UpdateFilter: UpdateTransactions.UpdateFilter,
          UpdateAttributes: UpdateTransactions.UpdateAttributes,
        },
      };
      log.info('---processLoanRepaymentCallbackKey.callGatewayOptions---');
      log.info(callGatewayOptions);
      const [callGatewayErr, callGateway]: any[] = await Utils.executePromise(
        this.kcbTransactionParameters.callGateway(callGatewayOptions),
      );

      if (callGatewayErr) {
        log.error('---processLoanRepaymentCallbackKey.callGatewayErr---');
        log.error(callGatewayErr);
        return callGatewayErr;
      }
      log.info('---processLoanRepaymentCallbackKey.callGateway---');
      log.info(callGateway);
      return callGateway;
    }

    if (CreateTransactions) {
      const paymentObj: any = {
        routeDetails: routeInfo,
        request: {
          TransactionStatus: 'success',
          Message: 'Loan request successfully applied',
          Operator: 'Kcb',
          ReferenceID: CreateTransactions?.ReferenceID,
          ExternalReferenceID: CreateTransactions?.ExternalReferenceID,
          UtilityReference: CreateTransactions.ReferenceMsisdn,
          Amount: CreateTransactions.LoanAmount,
          TansactionID: CreateTransactions?.ReferenceID,
          Msisdn: CreateTransactions.ReferenceMsisdn,
        },
      };
      const [paymentError, payment]: any[] = await Utils.executePromise(
        this.paymentVendorController.payUserForConnectedApp(paymentObj),
      );
      if (paymentError) {
        log.error('---paymentError---');
        log.error(paymentError);
        CreateTransactions.Operations.push({
          operation: 'payUserForConnectedApp',
          Status: STATUS.FAILURE,
          requestBody: paymentError.requestBody,
          responseBody: paymentError.responseBody,
        });
      } else if (!payment?.success) {
        log.error('---!payment?.success---');
        log.error(payment);
      }
      log.error('---payment---');
      log.error(payment);
      CreateTransactions.Operations.push({
        operation: 'payUserForConnectedApp',
        Status: CreateTransactions.Status,
        requestBody: payment.requestBody,
        responseBody: payment.responseBody,
      });
      const callGatewayOptions: any = {
        apiName: 'addTransaction',
        body: { ...CreateTransactions },
      };
      log.info('---processLoanRepaymentCallbackKey.callGatewayOptions---');
      log.info(callGatewayOptions);
      const [callGatewayErr, callGateway]: any[] = await Utils.executePromise(
        this.kcbTransactionParameters.callGateway(callGatewayOptions),
      );

      if (callGatewayErr) {
        log.error('---processLoanRepaymentCallbackKey.callGatewayErr---');
        log.error(callGatewayErr);
        return callGatewayErr;
      }
      log.info('---processLoanRepaymentCallbackKey.callGateway---');
      log.info(callGateway);
      return callGateway;
    }
  }

  private async processQueryLoanLimit(data: any) {
    const { CreateTransactions, UpdateTransactions } = data;

    if (UpdateTransactions) {
      const callGatewayOptions: any = {
        apiName: 'updateTransaction',
        body: {
          UpdateFilter: UpdateTransactions.UpdateFilter,
          UpdateAttributes: UpdateTransactions.UpdateAttributes,
        },
      };
      log.info('---processQueryLoanLimit.callGatewayOptions---');
      log.info(callGatewayOptions);
      const [callGatewayErr, callGateway]: any[] = await Utils.executePromise(
        this.kcbTransactionParameters.callGateway(callGatewayOptions),
      );

      if (callGatewayErr) {
        log.error('---processQueryLoanLimit.callGatewayErr---');
        log.error(callGatewayErr);
        return callGatewayErr;
      }
      log.info('---processQueryLoanLimit.callGateway---');
      log.info(callGateway);
      return callGateway;
    }

    if (CreateTransactions) {
      const callGatewayOptions: any = {
        apiName: 'addTransaction',
        body: { ...CreateTransactions },
      };
      log.info('---processQueryLoanLimit.callGatewayOptions---');
      log.info(callGatewayOptions);
      const [callGatewayErr, callGateway]: any[] = await Utils.executePromise(
        this.kcbTransactionParameters.callGateway(callGatewayOptions),
      );

      if (callGatewayErr) {
        log.error('---processQueryLoanLimit.callGatewayErr---');
        log.error(callGatewayErr);
        return callGatewayErr;
      }
      log.info('---processQueryLoanLimit.callGateway---');
      log.info(callGateway);
      return callGateway;
    }
  }

  private async processQueryLoanBalance(data: any) {
    const { CreateTransactions, UpdateTransactions } = data;

    if (UpdateTransactions) {
      const callGatewayOptions: any = {
        apiName: 'updateTransaction',
        body: {
          UpdateFilter: UpdateTransactions.UpdateFilter,
          UpdateAttributes: UpdateTransactions.UpdateAttributes,
        },
      };
      log.info('---processQueryLoanBalance.callGatewayOptions---');
      log.info(callGatewayOptions);
      const [callGatewayErr, callGateway]: any[] = await Utils.executePromise(
        this.kcbTransactionParameters.callGateway(callGatewayOptions),
      );

      if (callGatewayErr) {
        log.error('---processQueryLoanBalance.callGatewayErr---');
        log.error(callGatewayErr);
        return callGatewayErr;
      }
      log.info('---processQueryLoanBalance.callGateway---');
      log.info(callGateway);
      return callGateway;
    }

    if (CreateTransactions) {
      const callGatewayOptions: any = {
        apiName: 'addTransaction',
        body: { ...CreateTransactions },
      };
      log.info('---processQueryLoanBalance.callGatewayOptions---');
      log.info(callGatewayOptions);
      const [callGatewayErr, callGateway]: any[] = await Utils.executePromise(
        this.kcbTransactionParameters.callGateway(callGatewayOptions),
      );

      if (callGatewayErr) {
        log.error('---processQueryLoanBalance.callGatewayErr---');
        log.error(callGatewayErr);
        return callGatewayErr;
      }
      log.info('---processQueryLoanBalance.callGateway---');
      log.info(callGateway);
      return callGateway;
    }
  }

  async recieveRabbitMessages(routingKey: any, exchangeName: any): Promise<any> {
    try {
      return await kcbRabbitMq
        .recieveRabbitMessages(routingKey, exchangeName)
        .then((boundQueue: any) => {
          boundQueue.channelRes.consume(
            boundQueue.channelQRes.queue,
            async (msg: any) => {
              log.info('---recieveRabbitMessages---');
              const jsonData: any = JSON.parse(msg?.content?.toString());

              if (msg?.content?.toString() && exchangeName.toUpperCase() == 'GATEWAY') {
                switch (msg?.fields?.routingKey) {
                  case KcbTransactionConstant['loanRequestKey']:
                    await this.processLoanRequestKey(jsonData);
                    break;
                  case KcbTransactionConstant['loanRequestCallbackKey']:
                    await this.processLoanRequestCallbackKey(jsonData);
                    break;
                  case KcbTransactionConstant['loanRepaymentKey']:
                    await this.processLoanRepaymentKey(jsonData);
                    break;
                  case KcbTransactionConstant['loanRepaymentCallbackKey']:
                    await this.processLoanRepaymentCallbackKey(jsonData);
                    break;
                  case KcbTransactionConstant['queryLoanLimit']:
                    await this.processQueryLoanLimit(jsonData);
                    break;
                  case KcbTransactionConstant['queryLoanBalance']:
                    await this.processQueryLoanBalance(jsonData);
                    break;
                  default:
                    break;
                }
              }
              await boundQueue.channelRes.ack(msg);
              return msg;
            },
            { noAck: true },
          );
        })
        .catch((err: any) => {
          log.error('---recieveRabbitMessages---');
          log.error(err);
          return {
            success: false,
            statusCode: 500,
            msg: 'Internal server error',
            data: err || {},
          };
        });
    } catch (error) {
      log.error('---recieveRabbitMessages_CATCH_ERROR---');
      log.error(error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        data: error.data || {},
      };
    }
  }
}
