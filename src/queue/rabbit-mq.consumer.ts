/* eslint-disable @typescript-eslint/no-explicit-any */
import { amqp, Utils } from '../common';
import { RABBIT_MQ_URL } from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';

const log = new LoggingInterceptor('rabbit_mq.Consumer');

export class RabbitMqConsumer {
  constructor (
  ) { }

  async recieveRabbitMessages(routingKey: any, exchangeName: any): Promise<any> {
    try {
      const exchange = exchangeName;
      const [amqpConnectErr, amqpConnectRes] = await (Utils.executePromise(amqp.connect(RABBIT_MQ_URL)));
      if (amqpConnectErr) {
        log.info('---amqpConnectErr---');
        log.info(amqpConnectErr);
        throw amqpConnectErr;
      }

      const [channelErr, channelRes] = await (Utils.executePromise(amqpConnectRes.createChannel()));
      if (channelErr) {
        log.info('---channelErr---');
        log.info(channelErr);
        throw channelErr;
      }
      channelRes.assertExchange(exchange, 'topic', {
        constdurable: false,
      });

      const [channelQErr, channelQRes] = await (Utils.executePromise(channelRes.assertQueue('', { exclusive: true })));
      if (channelQErr) {
        log.info('---channelQErr---');
        log.info(channelQErr);
        throw channelQErr;
      }

      channelRes.bindQueue(channelQRes.queue, exchange, routingKey);
      channelRes.consume(channelQRes.queue, (msg: any) => {
        // let PROCESS_TYPE = {
        //   VODACOM: 'voadcom-request',
        //   AIRTEL_TRANSACTION: 'airtel-transaction-request',
        //   ZANTEL_TRANSACTION: 'zantel-transaction-request'
        // };
        // log.info('Atharv is in consumer for vodacom');
        log.info(msg.fields.routingKey);
        log.info(msg.content.toString());
        // if (msg.fields.routingKey === 'infobip') {

        // }
        return true;
      }, { noAck: true });
    } catch (error) {
      log.error('---recieveRabbitMessages_CATCH_ERROR---');
      log.error(error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        data: error.data || {}
      };
    }
  }
}
