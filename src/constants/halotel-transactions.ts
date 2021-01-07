/* eslint-disable @typescript-eslint/no-explicit-any */
import { moment, sha256 } from '../common';
import { SecretKeys } from './secret-keys';

export namespace HalotelTransactionConstant {
  export const queueRoutingKey: string = 'halotel-transaction-request';
  export const queuePaymentInitiationRoutingKey: string = 'pg-halopesa-request-ussd-push';
  export const queuePaymentUpdationRoutingKey: string = 'pg-halopesa-request-update-payment';
  export const functionCode: string = 'ASYNC_PAYMENT_USSD_PUSH';
  export function generateChecksum(request: any) {
    const encryptString =
      request.requestid +
      request.username +
      request.password +
      moment().format('YYYYMMDDHHmmss') +
      request.amount +
      request.senderMsisdn +
      request.beneficiary_accountid +
      request.referenceid +
      SecretKeys.HalotelSecretKey;
    console.log('--------generateChecksum.encryptString--------');
    console.log(encryptString);
    return sha256(encryptString).toString();
  }
  export const HALOPESA_AZAMTV_CONSTANT_SPID: string[] = [
    '25565174441',
    '266633',
    '780901008',
    '780900310',
  ];
}
