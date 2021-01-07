/* eslint-disable no-invalid-this */
export * from './airtel-mq.consumer';
export * from './crdb-mq.consumer';
export * from './dtb-mq.consumer';
export * from './halotel-mq.consumer';
export * from './kcb-mq.consumer';
export * from './nmb-mq.consumer';
export * from './rabbit-mq.consumer';
export * from './rabbit-mq.producer';
export * from './tigo-mq-consumer';
export * from './zantel-mq.consumer';

import {
  AirtelMqConsumer,
  CrdbMqConsumer,
  DtbMqConsumer,
  HalotelConsumer,
  NmbMqConsumer,
  TigoMqConsumer,
  ZantelMqConsumer,
} from '.';
import { inject, repository } from '../common';
import {
  AirtelTransactionsConstants,
  CrdbTransactionConstant,
  DtbTransactionConstant,
  HalotelTransactionConstant,
  NmbTransactionConstant,
  RABBIT_MQ_GATEWAY,
  TigoTransactionsConstants,
  VodacomTransactionsConstants,
  ZantelTransactionConstant,
} from '../constants';
import { KcbTransactionConstant } from '../constants/kcb-transactions';
import { PaymentPartnerController, PaymentVendorController } from '../controllers';
import {
  BankMerchantsRepository,
  MnoMerchantsRepository,
  NotificationTransactionsRepository,
} from '../repositories';
import { KCBConsumer } from './kcb-mq.consumer';
import { VodacomMqConsumer } from './vodacom-mq.consumer';
export class RabbitMq {
  constructor(
    @inject(`controllers.PaymentVendorController`)
    private paymentVendorController: PaymentVendorController,

    @inject(`controllers.PaymentPartnerController`)
    private paymentPartnerController: PaymentPartnerController,

    @repository(BankMerchantsRepository)
    public bankMerchantsRepository: BankMerchantsRepository,

    @repository(NotificationTransactionsRepository)
    public notificationsRepository: NotificationTransactionsRepository,

    @repository(MnoMerchantsRepository)
    private mnoMerchantsRepository: MnoMerchantsRepository,
  ) {}

  private airtelTransactionsConstants = AirtelTransactionsConstants;
  private crdbTransactionConstant = CrdbTransactionConstant;
  private dtbTransactionConstant = DtbTransactionConstant;
  private halotelTransactionConstant = HalotelTransactionConstant;
  private nmbTransactionConstant = NmbTransactionConstant;
  private zantelTransactionConstant = ZantelTransactionConstant;
  private tigoTransactionsConstants = TigoTransactionsConstants;
  private vodacomTransactionsConstants = VodacomTransactionsConstants;
  private kcbTransactionsConstants = KcbTransactionConstant;

  public airtelMqConsumer: AirtelMqConsumer = new AirtelMqConsumer(
    this.paymentVendorController,
    this.paymentPartnerController,
    this.notificationsRepository,
  );
  public crdbMqConsumer: CrdbMqConsumer = new CrdbMqConsumer(
    this.paymentVendorController,
    this.paymentPartnerController,
    this.notificationsRepository,
    this.bankMerchantsRepository,
  );
  public dtbMqConsumer: DtbMqConsumer = new DtbMqConsumer(
    this.paymentVendorController,
    this.paymentPartnerController,
    this.notificationsRepository,
  );
  public halotelConsumer: HalotelConsumer = new HalotelConsumer(
    this.paymentVendorController,
    this.paymentPartnerController,
    this.notificationsRepository,
  );
  public nmbMqConsumer: NmbMqConsumer = new NmbMqConsumer(
    this.paymentVendorController,
    this.paymentPartnerController,
    this.notificationsRepository,
    this.bankMerchantsRepository,
  );
  public zantelMqConsumer: ZantelMqConsumer = new ZantelMqConsumer(
    this.paymentVendorController,
    this.paymentPartnerController,
    this.notificationsRepository,
  );
  public tigoMqConsumer: TigoMqConsumer = new TigoMqConsumer(
    this.paymentVendorController,
    this.paymentPartnerController,
    this.mnoMerchantsRepository,
  );
  public vodacomMqConsumer: VodacomMqConsumer = new VodacomMqConsumer(
    this.paymentVendorController,
    this.paymentPartnerController,
  );

  public kcbConsumer: KCBConsumer = new KCBConsumer(this.paymentVendorController);

  public async receiveMessages() {
    await this.airtelMqConsumer.recieveRabbitMessages(
      this.airtelTransactionsConstants['queueRoutingKey'],
      RABBIT_MQ_GATEWAY,
    );
    await this.tigoMqConsumer.recieveRabbitMessages(
      this.tigoTransactionsConstants['queueRoutingKey'],
      RABBIT_MQ_GATEWAY,
    );
    await this.halotelConsumer.recieveRabbitMessages(
      this.halotelTransactionConstant['queueRoutingKey'],
      RABBIT_MQ_GATEWAY,
    );
    await this.vodacomMqConsumer.recieveRabbitMessages(
      this.vodacomTransactionsConstants['queueRoutingKey'],
      RABBIT_MQ_GATEWAY,
    );
    await this.halotelConsumer.recieveRabbitMessages(
      this.halotelTransactionConstant['queuePaymentInitiationRoutingKey'],
      RABBIT_MQ_GATEWAY,
    );
    await this.halotelConsumer.recieveRabbitMessages(
      this.halotelTransactionConstant['queuePaymentUpdationRoutingKey'],
      RABBIT_MQ_GATEWAY,
    );
    await this.crdbMqConsumer.recieveRabbitMessages(
      this.crdbTransactionConstant['queueRoutingKey'],
      RABBIT_MQ_GATEWAY,
    );
    await this.dtbMqConsumer.recieveRabbitMessages(
      this.dtbTransactionConstant['queueRoutingKey'],
      RABBIT_MQ_GATEWAY,
    );
    await this.nmbMqConsumer.recieveRabbitMessages(
      this.nmbTransactionConstant['queueRoutingKey'],
      RABBIT_MQ_GATEWAY,
    );
    await this.zantelMqConsumer.recieveRabbitMessages(
      this.zantelTransactionConstant['queueRoutingKey'],
      RABBIT_MQ_GATEWAY,
    );
    await this.zantelMqConsumer.recieveRabbitMessages(
      this.zantelTransactionConstant['ussdPushCallbackQueueRoutingKey'],
      RABBIT_MQ_GATEWAY,
    );
    await this.kcbConsumer.recieveRabbitMessages(
      this.kcbTransactionsConstants['loanRequestKey'],
      RABBIT_MQ_GATEWAY,
    );
    await this.kcbConsumer.recieveRabbitMessages(
      this.kcbTransactionsConstants['loanRequestCallbackKey'],
      RABBIT_MQ_GATEWAY,
    );
    await this.kcbConsumer.recieveRabbitMessages(
      this.kcbTransactionsConstants['loanRepaymentKey'],
      RABBIT_MQ_GATEWAY,
    );
    await this.kcbConsumer.recieveRabbitMessages(
      this.kcbTransactionsConstants['loanRepaymentCallbackKey'],
      RABBIT_MQ_GATEWAY,
    );
    await this.kcbConsumer.recieveRabbitMessages(
      this.kcbTransactionsConstants['queryLoanLimit'],
      RABBIT_MQ_GATEWAY,
    );
    await this.kcbConsumer.recieveRabbitMessages(
      this.kcbTransactionsConstants['queryLoanBalance'],
      RABBIT_MQ_GATEWAY,
    );
  }
}
