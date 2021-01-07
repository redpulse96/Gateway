/* eslint-disable @typescript-eslint/no-explicit-any */
import { GatewayInterface, inject, repository, Utils } from '../common';
import { NmbTransactionConstant, paymentGateways, STATUS } from '../constants';
import { nmbRabbitMq, PaymentPartnerController, PaymentVendorController } from '../controllers';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { BankMerchantsRepository, NotificationTransactionsRepository } from '../repositories';
const log = new LoggingInterceptor('nmb-transactions.Consumer');

export class NmbMqConsumer {
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
  private nmbGatewayParams: GatewayInterface = new GatewayInterface(paymentGateways['NMB']);
  private nmbTransactionConstant: any = NmbTransactionConstant;

  async processNmbTransactionMessage(nmbTransactionMsg: any) {
    try {
      let merchantError: any,
        merchantDetails: any,
        callGatewayOptions: any,
        nmbTransactionError: any,
        nmbTransactionDetails: any;
      const data = JSON.parse(nmbTransactionMsg);
      const { makePaymentObj }: any = data;
      log.info('---processNmbTransactionFunction_DATA---');
      log.info(data);

      log.info('---makePaymentObj---');
      log.info(makePaymentObj);
      if (makePaymentObj) {
        await this.paymentVendorController
          .payUserForConnectedApp(makePaymentObj)
          .then((res: any) => {
            if (data['createTransactionInstanceObj']) {
              data['createTransactionInstanceObj'].Status = STATUS.COMPLETED;
              data['createTransactionInstanceObj'].Operations.push({
                operation: 'payForConnectedApp',
                Status: data['createTransactionInstanceObj'].Status,
                requestBody: res.requestBody,
                responseBody: res.responseBody,
              });
            }
            if (data['updateTransactionInstanceObj']) {
              data['updateTransactionInstanceObj'].Status = STATUS.FAILURE;
              data['updateTransactionInstanceObj'].Operations.push({
                operation: 'payForConnectedApp',
                Status: data['updateTransactionInstanceObj'].Status,
                requestBody: res.requestBody,
                responseBody: res.responseBody,
              });
            }
          })
          .catch((err: any) => {
            if (data['createTransactionInstanceObj']) {
              data['createTransactionInstanceObj'].Status = STATUS.FAILURE;
              data['createTransactionInstanceObj'].Operations.push({
                operation: 'payForConnectedApp',
                Status: data['createTransactionInstanceObj'].Status,
                requestBody: err.requestBody,
                responseBody: err.responseBody,
              });
            }
            if (data['updateTransactionInstanceObj']) {
              data['updateTransactionInstanceObj'].Status = STATUS.FAILURE;
              data['updateTransactionInstanceObj'].Operations.push({
                operation: 'payForConnectedApp',
                Status: data['updateTransactionInstanceObj'].Status,
                requestBody: err.requestBody,
                responseBody: err.responseBody,
              });
            }
          });
      }
      if (data['createMerchantInstanceObj']) {
        [merchantError, merchantDetails] = await Utils.executePromise(
          this.bankMerchantsRepository.create(data['createMerchantInstanceObj']),
        );
      } else if (data['updateMerchantInstanceObj']) {
        [merchantError, merchantDetails] = await Utils.executePromise(
          this.bankMerchantsRepository.updateById(
            data['updateMerchantInstanceObj'].BankMerchantID,
            data['updateMerchantInstanceObj'],
          ),
        );
      }
      if (data['createTransactionInstanceObj']) {
        data['createTransactionInstanceObj'].BankMerchantID =
          data['createTransactionInstanceObj'].BankMerchantID || merchantDetails.BankMerchantID;
        callGatewayOptions = {
          apiName: 'addTransaction',
          body: { ...data['createTransactionInstanceObj'] },
        };
        [nmbTransactionError, nmbTransactionDetails] = await Utils.executePromise(
          this.nmbGatewayParams.callGateway(callGatewayOptions),
        );
      } else if (data['updateTransactionInstanceObj']) {
        callGatewayOptions = {
          apiName: 'updateTransaction',
          body: {
            UpdateFilter: {
              NmbTransactionID: data['updateTransactionInstanceObj'].NmbTransactionID,
            },
            UpdateAttributes: {
              ...data['updateTransactionInstanceObj'],
            },
          },
        };
        [nmbTransactionError, nmbTransactionDetails] = await Utils.executePromise(
          this.nmbGatewayParams.callGateway(callGatewayOptions),
        );
      }
      if (merchantError || nmbTransactionError) {
        log.info('---merchantError---');
        log.info(merchantError);
        log.info('---nmbTransactionError---');
        log.info(nmbTransactionError);
        return {
          success: false,
          msg: merchantError?.message || nmbTransactionError?.message || 'Something went wrong',
          data: merchantError?.data || nmbTransactionError?.message || {},
        };
      }
      log.info('---merchantDetails---');
      log.info(merchantDetails);
      log.info('---nmbTransactionDetails---');
      log.info(nmbTransactionDetails);
      return {
        success: true,
        msg: 'Nmb transaction queue successfully executed',
        data: {
          merchantDetails,
          nmbTransactionDetails,
        },
      };
    } catch (error) {
      log.error('---processNmbTransactionFunction_CATCH_ERROR---');
      console.error(error);
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
      return await nmbRabbitMq
        .recieveRabbitMessages(routingKey, exchangeName)
        .then((boundQueue: any) => {
          boundQueue.channelRes.consume(boundQueue.channelQRes.queue, async (msg: any) => {
            log.info('---recieveRabbitMessages---');
            if (exchangeName.toUpperCase() === 'GATEWAY') {
              if (msg?.fields?.routingKey === this.nmbTransactionConstant['queueRoutingKey']) {
                await this.processNmbTransactionMessage(msg.content.toString());
              }
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
