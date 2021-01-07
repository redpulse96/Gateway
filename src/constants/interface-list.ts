import { ExternalServiceLogsController } from '../controllers';
import {
  ApiConfigurations,
  ExternalServices,
  NotificationServices,
  ResponseMessages,
} from '../models';
import { SecretKeys } from './secret-keys';

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE: string = SecretKeys.JwtSecret;
  export const TOKEN_EXPIRES_IN_VALUE: string = '60000';
}
export namespace HASH_SCHEME {
  export const MD5: string = 'MD5';
  export const SHA256: string = 'SHA256';
  export const SHA1: string = 'SHA1';
}
export namespace DateTimeFormats {
  export const DateFormat: string = 'YYYY-MM-DD';
  export const TimeFormat: string = 'HH:mm:ssZ';
  export const TimstampFormat: string = 'YYYY-MM-DD HH:mm:ssZ';
  export const MqFormat: string = 'DD/MM/YYYY';
  export const HalotelRequestTime: string = 'YYYYMMDDHHmmss';
  export const KcbTimeFormat: string = 'YYYYMMDDHHmmss';
  export const DayFormat: 'days' = 'days';
  export const MonthFormat: 'months' = 'months';
  export const MinutesFormat: 'minutes' = 'minutes';
  export const HoursFormat: 'hours' = 'hours';
  export const WeekFormat: 'weeks' = 'weeks';
}
export namespace SmtpDetails {
  export const BaseUrl: string = 'http://support@azampay.com:3000';
  export const Name: string = 'gmail';
  export const Username: string = 'support@azampay.com';
  export const Password: string = 'kjxwuujixvbyoftl';
}
export namespace ENV {
  export const DEV: string = 'development';
  export const TEST: string = 'testing';
  export const PROD: string = 'production';
}
export namespace CurrencyCodes {
  export const TanzanianShilling: string = 'TZS';
}
export namespace TransactionReportTypes {
  export const Label: string = 'label';
  export const Market: string = 'market';
}
export namespace InterfaceList {
  export type CheckUserForConnectedAppInterface = {
    request: any;
    routeInfo: any;
  };
  export type ConfirmPayment = {
    message: string;
    apiPath: string;
    transactionstatus: string;
    operator: string;
    reference: string;
    utilityref: string;
    amount: string;
    transid: string;
    msisdn: string;
  };
  export type CryptoEncryption = {
    EncyrptionString: string;
    SecretKey: string;
  };
  export type HasingMessages = {
    message: string;
    salt: string;
    iterations: number;
    keylength: number;
    digest: string;
  };

  export type KcbLoanRequest = {
    message: string;
  };
  export type GlobalDefaultResponse = {
    messageCode: string;
    data?: object | null;
  };
  export type LoadingConfigs = {
    apiConfigs: ApiConfigurations[];
    externalServices: ExternalServices[];
    responseMessages: ResponseMessages[];
    notificationServices: NotificationServices[];
    externalServiceLogsController: ExternalServiceLogsController;
  };
  export type NotificationFunction = {
    NotifCode: string;
    DestinationEmail: string[];
    Body?: object;
  };
  export type NotificationObject = {
    DestinationEmail: ConcatArray<never>;
    NotifiactionSubject: string;
    NotificationBody: string;
  };
  export type NodeMailerOptions = {
    from: string;
    to: string[];
    subject: string;
    html: string;
  };
  export type UserAttachedRole = {
    RoleID: number;
    RoleCode: string;
    ParentRoleID: number | null;
    ParentRoleCode: string | null;
  };
  export type Credentials = {
    Email: string;
    Password: string;
  };
  export type PartnerOperations = {
    requestBody?: any;
    responseBody?: any;
  };
  export type TransactionInstance = {
    SerialNo: number;
    ReferenceID: string;
    ExternalReferenceID: string;
    SenderMsisdn: string | null;
    ReferenceMsisdn: string | null;
    Amount: string;
    IncomingRequestType: string;
    Status: string;
    Date: string;
    Time: string;
    Operations: object;
  };
  export type TransactionResponseInstance = {
    totalCount: number;
    transactions: TransactionInstance[];
  };
  export type TransactionResponse = {
    AirtelTransaction?: any | TransactionResponseInstance;
    TigoTransaction?: any | TransactionResponseInstance;
    HalotelTransaction?: any | TransactionResponseInstance;
    VodacomTransaction?: any | TransactionResponseInstance;
    ZantelTransaction?: any | TransactionResponseInstance;
  };
  export type TransactionReportsInstance = {
    Amount?: number;
    AverageAmount?: number;
    CompletedCount?: number;
    PendingCount?: number;
    FailedCount?: number;
    TransactionCount?: number;
  };
  export type TransactionReportsResponse = {
    TotalTransactions?: any | TransactionReportsInstance;
    AirtelTransaction?: any | TransactionReportsInstance;
    TigoTransaction?: any | TransactionReportsInstance;
    HalotelTransaction?: any | TransactionReportsInstance;
    VodacomTransaction?: any | TransactionReportsInstance;
    ZantelTransaction?: any | TransactionReportsInstance;
  };
  export type GraphResopnseInstance = {
    name: string;
    data: number[];
  };
  export type GraphReportResponse = {
    headers: string[];
    dates: string[];
    transactions?: GraphResopnseInstance[] | any;
  };
  export type FilterBasedLabelReport = {
    DateRange: string[];
    CancelledCount: number[];
    PendingCount: number[];
    SuccessCount: number[];
  };
  export type FilterBasedMarketReport = {
    Marketplace: number;
    LastMonth: number;
    LastWeek: number;
    Today: number;
  };
  export type NmbRequestObject = {
    operation: string;
    integrationPartner: object;
    request: {
      AccountNumber?: string;
      AzamTransactionRef?: string;
    };
  };
  export type OriginatorFormatInstance = {
    RefernceID: string;
    TransactionID: string;
    FromMsisdn?: string;
    RefrenceMsisdn?: string;
    Amount?: string;
    CompanyName?: string;
    CompanyCode?: string;
    PaymentStatus?: string;
    Type?: string;
    PartnerCode?: string;
  };
  export namespace GatewayFormats {
    export type addTransaction = {
      apiName: string;
      body: any;
    };
    export type fetchTransaction = {
      apiName: string;
      body: any;
    };
    export type fetchMultipleTransactions = {
      apiName: string;
      body: any;
    };
    export type fetchTransactionsCount = {
      apiName: string;
      body: any;
    };
    export type updateTransaction = {
      apiName: string;
      body: { UpdateFilter: {}; UpdateAttributes: {} };
    };
  }
}
export default InterfaceList;
