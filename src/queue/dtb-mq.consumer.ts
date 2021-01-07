import { GatewayInterface, inject, repository } from '../common';
import { DtbTransactionConstant, paymentGateways, STATUS } from '../constants';
import { dtbRabbitMq, PaymentPartnerController, PaymentVendorController } from '../controllers';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { NotificationTransactionsRepository } from '../repositories';

const log = new LoggingInterceptor('dtb-transactions.Consumer');

export class DtbMqConsumer {
  constructor(
    @inject(`controllers.PaymentVendorController`)
    private paymentVendorController: PaymentVendorController,

    @inject(`controllers.PaymentPartnerController`)
    private paymentPartnerController: PaymentPartnerController,

    @repository(NotificationTransactionsRepository)
    public notificationsRepository: NotificationTransactionsRepository,
  ) {}
  private dtbGatewayParams: any = new GatewayInterface(paymentGateways['DTB']);
  private dtbTransactionConstant: any = DtbTransactionConstant;

  private async processTransactionMessage(transactionDetails: string): Promise<any> {
    try {
      let dtbTransactionDetails: any, callGatewayOptions: any;
      dtbTransactionDetails = { ...JSON.parse(transactionDetails) };
      if (dtbTransactionDetails['createTransactionInstance']) {
        callGatewayOptions = {
          apiName: 'addTransaction',
          body: {
            ...dtbTransactionDetails['createTransactionInstance'],
          },
        };
      } else if (dtbTransactionDetails['updateTransactionInstance']) {
        callGatewayOptions = {
          apiName: 'updateTransaction',
          body: {
            UpdateFilter: {
              DtbTransactionID: dtbTransactionDetails['updateTransactionInstance'].DtbTransactionID,
              Status: STATUS.ACTIVE,
            },
            UpdateAttributes: {
              ...dtbTransactionDetails['createTransactionInstance'],
            },
          },
        };
      } else {
        return {
          success: true,
          statusCode: 200,
          msg: 'No transaction requests to perform',
          data: {},
        };
      }
      return this.dtbGatewayParams
        .callGateway(callGatewayOptions)
        .then((res: any) => {
          log.info('---res---');
          log.info(res);
          return {
            success: true,
            statusCode: 200,
            msg: 'Successfully executed',
            data: { ...res },
          };
        })
        .catch((err: any) => {
          log.info('---err---');
          log.info(err);
          return {
            success: true,
            statusCode: 200,
            msg: 'Successfully executed',
            data: { ...err },
          };
        });
    } catch (error) {
      log.error('---processTransactionMessage_CATCH_ERROR---');
      log.error(error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        data: error.data || {},
      };
    }
  }

  async recieveRabbitMessages(routingKey: any, exchangeName: any): Promise<any> {
    try {
      return await dtbRabbitMq
        .recieveRabbitMessages(routingKey, exchangeName)
        .then(async (msg: any) => {
          log.info('---recieveRabbitMessages---');
          if (exchangeName.toUpperCase() === 'GATEWAY') {
            if (msg?.fields?.routingKey === this.dtbTransactionConstant['queueRoutingKey']) {
              // business logics should go here
              await this.processTransactionMessage(msg.content.toString());
            }
            return msg.content.toString();
          } else {
            log.info('---exchange_is_not_GATEWAY---');
            return true;
          }
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
