/* eslint-disable @typescript-eslint/no-explicit-any */
import { amqp, Utils } from '../common';
import { RABBIT_MQ_URL } from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
const log = new LoggingInterceptor('rabbit_mq.Producer');

export class RabbitMqProducer {
  constructor(exchange: string) {
    this.init(exchange);
  }

  private init(exchange: string) {
    this.exchange = exchange;
    this.buildConnectionTorabbitMq()
      .then((conn: any) => {
        return this.createChannelTorabbitMq(conn);
      })
      .then((channelRes: any) => {
        this.channel = channelRes;
      })
      .catch((connErr: any) => {
        log.error('---connErr---', connErr);
      });
  }

  private _exchange: string;
  public get exchange(): string {
    return this._exchange;
  }
  public set exchange(value: string) {
    this._exchange = value;
  }

  private _channel: any;
  public get channel(): any {
    return this._channel;
  }
  public set channel(value: any) {
    this._channel = value;
  }

  private async buildConnectionTorabbitMq(): Promise<any> {
    return amqp
      .connect(RABBIT_MQ_URL)
      .then((connection: any) => {
        log.info('---connection---');
        return connection;
      })
      .catch((connectionError: any) => {
        log.error('---connectionError---', connectionError);
        return false;
      });
  }

  private async createChannelTorabbitMq(connection: any): Promise<any> {
    return connection
      .createChannel()
      .then((channel: any) => {
        log.info('---channel---');
        return channel;
      })
      .catch((channelError: any) => {
        log.error('---channelError---', channelError);
        return false;
      });
  }

  sendToQueue(messages: any, routingKey: any): any {
    const exchange = this.exchange;
    const key = routingKey || 'anonymous.info';
    const msg = messages || 'No messages recieved';

    this.channel.assertExchange(exchange, 'topic', {
      durable: false,
    });
    this.channel.publish(exchange, key, Buffer.from(msg));
    log.info('---channel.publish---');
    return true;
  }

  async recieveRabbitMessages(routingKey: any, exchangeName: any): Promise<any> {
    try {
      const exchange = exchangeName;
      this.channel.assertExchange(exchange, 'topic', {
        durable: false,
      });

      const [channelQErr, channelQRes] = await Utils.executePromise(
        this.channel.assertQueue('', { exclusive: true }),
      );
      if (channelQErr) {
        log.error('---channelQErr---', channelQErr);
        throw channelQErr;
      }
      log.info('---channelQRes---');
      this.channel.prefetch(200);
      this.channel.bindQueue(channelQRes.queue, exchange, routingKey);
      return {
        channelQRes,
        channelRes: this.channel,
      };
    } catch (error) {
      log.error('---recieveRabbitMessages_CATCH_ERROR---', error);
      return false;
    }
  }
}
