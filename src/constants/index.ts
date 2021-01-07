import { InterfaceList } from './interface-list';

export * from './airtel-transactions';
export * from './api-list';
export * from './common-ussd-push';
export * from './crdb-transactions';
export * from './dtb-transactions';
export * from './halotel-transactions';
export * from './infobip';
export * from './interface-list';
export * from './nmb-transactions';
export * from './notifications-transactions';
export * from './payment-vendor';
export * from './queue-constants';
export * from './response-mapping';
export * from './role-mappings';
export * from './secret-keys';
export * from './tigo-transactions';
export * from './urls';
export * from './vodacom-transactions';
export * from './zantel-transactions';
export const API_HOSTNAME: string = '';
export const API_PORT: string = '8080';
export const JWT_STRATEGY_NAME: string = 'jwt';
export const SALT_ROUNDS: number = 10;
export const POST_METHOD: string = 'POST';
export const NODE_ENV = process.env.NODE_ENV;
export const paymentGateways = {
  AIRTEL: 'airtel',
  HALOTEL: 'halotel',
  DTB: 'dtb',
  NMB: 'nmb',
  CRDB: 'crdb',
  ZANTEL: 'zantel',
  TIGO: 'tigo',
  VODACOM: 'vodacom',
  KCB: 'kcb',
};
export const STATUS: any = {
  PENDING: 'pending',
  OTP_VALIDATED: 'otp-validated',
  TOKEN_VALIDATE: 'token-validate',
  TRANSACTION_INITIATED: 'transactions-initiated',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  INCOMING: 'incoming',
  OUTGOING: 'outgoing',
  SUCCESS: 'success',
  FAILURE: 'failure',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  REJECT: 'reject',
  LOAN_REQUEST: 'loan_requested',
  LOAN_REQUEST_CALLBACK: 'loan_requested_ack',
  LOAN_PAYMENT_INITIATED: 'loan_repayment_initiated',
  LOAN_PAYMENT_CALLBACK: 'loan_repayment_callback',
  QUERY_LOAN_LIMIT: 'query_loan_limit',
  QUERY_LOAN_BALANCE: 'query_loan_balance',
};
export const RESPONSE_TYPE: any = {
  ERROR: 'error_response',
  SUCCESS: 'success_response',
};
export const SERVICE_TYPE: any = {
  USSD_NORMAL: 'ussd-normal',
  USSD_PUSH: 'ussd-push',
  PUSH_NORMAL: {},
};
export const AZAMTV_CONSTANT_SPID: any = ['266633', '780901008', '780900310', 'AZAM'];
export const RoleTypes: any = {
  Normal: 'normal',
  Superadmin: 'superadmin',
  VendorSuperadmin: 'vendor-superadmin',
};
export const DefaultTransactionReports: InterfaceList.TransactionReportsResponse | any = {
  TotalTransactions: {
    Amount: 0,
    AverageAmount: 0,
    CompletedCount: 0,
    PendingCount: 0,
    FailedCount: 0,
    TransactionCount: 0,
  },
  AirtelTransaction: {
    Amount: 0,
    AverageAmount: 0,
    CompletedCount: 0,
    PendingCount: 0,
    FailedCount: 0,
    TransactionCount: 0,
  },
  TigoTransaction: {
    Amount: 0,
    AverageAmount: 0,
    CompletedCount: 0,
    PendingCount: 0,
    FailedCount: 0,
    TransactionCount: 0,
  },
  HalotelTransaction: {
    Amount: 0,
    AverageAmount: 0,
    CompletedCount: 0,
    PendingCount: 0,
    FailedCount: 0,
    TransactionCount: 0,
  },
  ZantelTransaction: {
    Amount: 0,
    AverageAmount: 0,
    CompletedCount: 0,
    PendingCount: 0,
    FailedCount: 0,
    TransactionCount: 0,
  },
  VodacomTransaction: {
    Amount: 0,
    AverageAmount: 0,
    CompletedCount: 0,
    PendingCount: 0,
    FailedCount: 0,
    TransactionCount: 0,
  },
};
export const SupervisorEmails: any = ['smredhan02@gmail.com'];
