import { GatewayInterface, inject, repository, Utils } from '../common';
import { CrdbTransactionConstant, paymentGateways, STATUS } from '../constants';
import { crdbRabbitMq, PaymentPartnerController, PaymentVendorController } from '../controllers';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { BankMerchantsRepository, NotificationTransactionsRepository } from '../repositories';
const log = new LoggingInterceptor('crdb-transactions.Consumer');

export class CrdbMqConsumer {
  constructor(
    @inject(`controllers.PaymentVendorController`)
    private paymentVendorController: PaymentVendorController,

    @inject(`controllers.PaymentPartnerController`)
    private paymentPartnerController: PaymentPartnerController,

    @repository(NotificationTransactionsRepository)
    public notificationsRepository: NotificationTransactionsRepository,

    @repository(BankMerchantsRepository)
    private bankMerchantsRepository: BankMerchantsRepository,
  ) {}
  private crdbGatewayParams: any = new GatewayInterface(paymentGateways['CRDB']);
  private crdbTransactionConstant: any = CrdbTransactionConstant;

  async processCrdbTransactionFunction(CrdbTransactionMsg: any) {
    try {
      let data: any,
        merchantError: any,
        merchantDetails: any,
        callGatewayOptions: any,
        CrdbTransactionError: any,
        CrdbTransactionDetails: any;
      data = JSON.parse(CrdbTransactionMsg);
      const { makePaymentObj }: any = data;
      log.info('---processCrdbTransactionFunction_DATA---');
      log.info(data);

      if (makePaymentObj) {
        log.info('---makePaymentObj---');
        await this.paymentVendorController
          .payUserForConnectedApp(makePaymentObj)
          .then((res: any) => {
            if (data['createTransactionInstance']) {
              data['createTransactionInstance'].Status = STATUS.COMPLETED;
              data['createTransactionInstance'].Operations.push({
                operation: 'payForConnectedApp',
                Status: data['createTransactionInstance'].Status,
                requestBody: res.requestBody,
                responseBody: res.responseBody,
              });
            }
            if (data['updateTransactionInstance']) {
              data['updateTransactionInstance'].Status = STATUS.COMPLETED;
              data['updateTransactionInstance'].Operations.push({
                operation: 'payForConnectedApp',
                Status: data['updateTransactionInstance'].Status,
                requestBody: res.requestBody,
                responseBody: res.responseBody,
              });
            }
          })
          .catch((err: any) => {
            if (data['createTransactionInstance']) {
              data['createTransactionInstance'].Status = STATUS.FAILURE;
              data['createTransactionInstance'].Operations.push({
                operation: 'payForConnectedApp',
                Status: data['createTransactionInstance'].Status,
                requestBody: err.requestBody,
                responseBody: err.responseBody,
              });
            }
            if (data['updateTransactionInstance']) {
              data['updateTransactionInstance'].Status = STATUS.FAILURE;
              data['updateTransactionInstance'].Operations.push({
                operation: 'payForConnectedApp',
                Status: data['updateTransactionInstance'].Status,
                requestBody: err.requestBody,
                responseBody: err.responseBody,
              });
            }
          });
      }
      if (data['createMerchantInstance']) {
        [merchantError, merchantDetails] = await Utils.executePromise(
          this.bankMerchantsRepository.create(data['createMerchantInstance']),
        );
      } else if (data['updateMerchantInstance']) {
        const updateObj: any = { ...data['updateMerchantInstance'] };
        delete updateObj.BankMerchantID;
        [merchantError, merchantDetails] = await Utils.executePromise(
          this.bankMerchantsRepository.updateById(
            data['updateMerchantInstance'].BankMerchantID,
            updateObj,
          ),
        );
      }
      if (data['createTransactionInstance']) {
        delete data['createTransactionInstance'].CrdbTransactionID;
        data['createTransactionInstance'].BankMerchantID =
          data['createTransactionInstance']?.BankMerchantID ||
          data['updateMerchantInstance']?.BankMerchantID ||
          merchantDetails?.BankMerchantID;
        callGatewayOptions = {
          apiName: 'addTransaction',
          body: { ...data['createTransactionInstance'] },
        };
        [CrdbTransactionError, CrdbTransactionDetails] = await Utils.executePromise(
          this.crdbGatewayParams.callGateway(callGatewayOptions),
        );
      } else if (data['updateTransactionInstance']) {
        callGatewayOptions = {
          apiName: 'updateTransaction',
          body: {
            UpdateFilter: {
              CrdbTransactionID: data['updateTransactionInstance'].CrdbTransactionID,
            },
            UpdateAttributes: {
              ...data['updateTransactionInstance'],
            },
          },
        };
        [CrdbTransactionError, CrdbTransactionDetails] = await Utils.executePromise(
          this.crdbGatewayParams.callGateway(callGatewayOptions),
        );
      }
      if (merchantError || CrdbTransactionError) {
        log.info('---merchantError---');
        console.dir(merchantError);
        log.info('---CrdbTransactionError---');
        console.dir(CrdbTransactionError);
        return {
          success: false,
          statusCode: merchantError?.statusCode || CrdbTransactionError?.statusCode || 500,
          msg: merchantError?.message || CrdbTransactionError?.message || 'Something went wrong',
          data: merchantError?.data || CrdbTransactionError?.message || {},
        };
      }
      log.info('---merchantDetails---');
      log.info('---CrdbTransactionDetails---');
      return {
        success: true,
        statusCode: 200,
        msg: 'Crdb transaction queue successfully executed',
        data: {
          merchantDetails,
          CrdbTransactionDetails,
        },
      };
    } catch (error) {
      log.error('---processCrdbTransactionFunction_CATCH_ERROR---');
      log.error(error);
      throw {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        data: error.data || {},
      };
    }
  }

  async recieveRabbitMessages(routingKey: any, exchangeName: any): Promise<any> {
    try {
      return await crdbRabbitMq
        .recieveRabbitMessages(routingKey, exchangeName)
        .then((boundQueue: any) => {
          boundQueue.channelRes.consume(boundQueue.channelQRes.queue, async (msg: any) => {
            log.info('---recieveRabbitMessages---');
            if (exchangeName.toUpperCase() === 'GATEWAY') {
              if (msg?.fields?.routingKey === this.crdbTransactionConstant['queueRoutingKey']) {
                // business logics should go here
                await this.processCrdbTransactionFunction(msg.content.toString());
              }
            } else {
              log.info('---exchange_is_not_GATEWAY---');
            }
            await boundQueue.channelRes.ack(msg);
            return msg?.content?.toString();
          });
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
