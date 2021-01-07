export namespace ApiList {
  export const AIRTEL_NORMAL_USSD: string = '/azam/airtel/ussdnormal';
  export const AIRTEL_CALLBACK: string = 'AirtelCallbackApi';
  export const AIRTEL_USSD_PUSH_API: string = 'AirtelUssdPush';
  export const AIRTEL_ERROR_RESPONSE: string = 'AirtelTransactionErrorResponse';
  export const AIRTEL_SUCCESS_RESPONSE: string = 'AirtelTransactionSuccessResponse';
  export const VALIDATE_DTB_ACCOUNT: string = 'ValidateDtbAccount';
  export const VALIDATE_DTB_AUTH_CODE: string = 'ValidateDtbAuthCode';
  export const POST_DTB_TRANSACTION: string = 'PostDtbTransaction';
  export const INFOBIP_AIP_NAME: string = 'InfobipPath';
  export const CHECK_AZAM_TV_REQUEST: string = 'CheckUserForAzamTVRequest';
  export const PAYMENT_BY_MQ_SERVICE: string = 'PaymentMqService';
  export const VALIDATE_TIGO_TOKEN: string = 'ValidateTigoToken';
  export const VALIDATE_TIGO_TOKEN_INTERNAL: string = 'ValidateTigoTokenInternal';
  export const INITIATE_TIGO_TRANSACTION: string = 'InitiateTigoTransaction';
  export const INITIATE_TIGO_TRANSACTION_INTERNAL: string = 'InitiateTigoTransactionInternal';
  export const QUERY_TIGO_TRANSACTION: string = 'QueryTigoTransaction';
  export const SYNC_TIGO_BILL_PAY: string = 'PayTigoBillInSync';
  export const HALOTEL_PAYMENT_INITIATION: string = 'PayHalotelInstance';
  export const HALOTEL_USSD_PUSH_API: string = 'HalotelUssdPush';
  export const VODACOM_RESPONSE_INTIMATION: string = 'VodacomResponseIntimation';
  export const ZANTEL_USSD_PUSH: string = 'ZantelUssdPushService';
  export const ZANTEL_QUERY_TRANSACTION: string = 'ZantelQueryTransaction';
  export const CRDB_MERCHANT_VERIFICATION: string = 'CrdbMerchantVerification';
  export const CRDB_TRANSACTION_INITIATION: string = 'CrdbTransactionInitiation';
  export const FETCH_AIRTEL_TRANSACTIONS: string = 'FetchAirtelTransactions';
  export const FETCH_HALOTEL_TRANSACTIONS: string = 'FetchHalotelTransactions';
  export const FETCH_TIGO_TRANSACTIONS: string = 'FetchTigoTransactions';
  export const FETCH_VODACOM_TRANSACTIONS: string = 'FetchVodacomTransactions';
  export const FETCH_ZANTEL_TRANSACTIONS: string = 'FetchZantelTransactions';
  export const PAY_TO_SARAFU: string = 'ConfirmConnectedAppPayment';
  export const ConfirmConnectedAppPayment: string = 'ConfirmSarafuPayment';
  export const PAY_TO_AZAM_MEDIA: string = 'PayToAzamMediaPayment';
  export const PayToAzamMediaPayment: string = 'ConfirmAzamMediaPayment';
  export const FETCH_AIRTEL_TRANSACTIONS_COUNT: string = 'FetchAirtelTransactionsCount';
  export const FETCH_HALOTEL_TRANSACTIONS_COUNT: string = 'FetchHalotelTransactionsCount';
  export const FETCH_TIGO_TRANSACTIONS_COUNT: string = 'FetchTigoTransactionsCount';
  export const FETCH_VODACOM_TRANSACTIONS_COUNT: string = 'FetchVodacomTransactionsCount';
  export const FETCH_ZANTEL_TRANSACTIONS_COUNT: string = 'FetchZantelTransactionsCount';
  export const NMB_ACCOUNT_INQUIRY: string = 'NmbAccountInquiry';
  export const NMB_MERCHANT_REGISTRATION: string = 'NmbMerchantRegistration';
  export const NMB_MERCHANT_DEREGISTRATION: string = 'NmbMerchantDeregistration';
  export const NMB_TRANSACTION_INITIATION: string = 'NmbTransactionInitiation';
  export const NMB_MERCHANT_AUTHORIZATION: string = 'NmbMerchantAuthorization';

  // KCB API LIST
  export const LOAN_REQUEST: string = 'LoanRequest';
  export const LOAN_REPAYMENT: string = 'LoanRepayment';
  export const QUERY_LOAN_LIMIT: string = 'QueryLoanLimit';
  export const QUERY_LOAN_BALANCE: string = 'QueryLoanLimit';

  // CRDB INTERNAL API LIST
  export const CRDB_MERCHANT_VERIFICATION_INTERNAL: string = 'CrdbMerchantVerificationInternal';
  export const CRDB_INITIATE_TRANSACTION_INTERNAL: string = 'CrdbTransactionInitiationInternal';

  // NMB INTERNAL API LIST
  export const NMB_MERCHANT_REGISTRATION_INTERNAL: string = 'NmbMerchantRegistrationInternal';
  export const NMB_MERCHANT_AUTH_INTERNAL: string = 'NmbMerchantAuthInternal';
  export const NMB_INITIATE_TRANSACTION_INTERNAL: string = 'NmbInitiateTransactionInternal';
}

export const AccessRightsApiMapping: any = {
  users_login: 'login',
  users_read: 'fetchUsers',
  users_logout: 'logout',
  users_approveRegistration: 'approveRegistration',
  users_rejectRegistration: 'rejectRegistration',
  users_register: 'register',
  users_updateuser: 'updateuser',
  users_attachrole: 'attachrole',
  users_completeregistration: 'completeregistration',
  users_forgotpassword: 'forgotpassword',
  users_confirmpassword: 'confirmpassword',
  users_updateuserstatus: 'updateuserstatus',
  roles_fetchparentroles: 'fetchparentroles',
  roles_fetchchildroles: 'fetchchildroles',
  transactions_fetchTransactions: 'fetchTransactions',
};

export const ApiAccess: any = {
  users_register: {
    Module: 'users',
    Action: 'register',
    AccessRight: 'register',
  },
  users_login: {
    Module: 'users',
    Action: 'login',
    AccessRight: 'login',
  },
  users_logout: {
    Module: 'users',
    Action: 'logout',
    AccessRight: 'logout',
  },
  users_approveRegistration: {
    Module: 'users',
    Action: 'approveRegistration',
    AccessRight: 'approveRegistration',
  },
  users_rejectRegistration: {
    Module: 'users',
    Action: 'rejectRegistration',
    AccessRight: 'rejectRegistration',
  },
  users_fetchUsers: {
    Module: 'users',
    Action: 'fetchUsers',
    AccessRight: 'read',
  },
  users_updateuser: {
    Module: 'users',
    Action: 'updateuser',
    AccessRight: 'update',
  },
  users_attachrole: {
    Module: 'users',
    Action: 'attachrole',
    AccessRight: 'attachrole',
  },
  users_completeregistration: {
    Module: 'users',
    Action: 'completeregistration',
    AccessRight: 'completeregistration',
  },
  users_forgotpassword: {
    Module: 'users',
    Action: 'forgotpassword',
    AccessRight: 'forgotpassword',
  },
  users_confirmpassword: {
    Module: 'users',
    Action: 'confirmpassword',
    AccessRight: 'confirmpassword',
  },
  users_updateuserstatus: {
    Module: 'users',
    Action: 'updateuserstatus',
    AccessRight: 'updateuserstatus',
  },
  roles_fetchchildroles: {
    Module: 'roles',
    Action: 'fetchchildroles',
    AccessRight: 'fetchchildroles',
  },
  roles_fetchparentroles: {
    Module: 'roles',
    Action: 'fetchparentroles',
    AccessRight: 'fetchparentroles',
  },
  transactions_fetchTransactions: {
    Module: 'transactions',
    Action: 'fetchTransactions',
    AccessRight: 'fetchTransactions',
  },
};
