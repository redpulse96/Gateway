import { DateTimeFormats, InterfaceList } from '.';
import { Utils } from '../common';
import { ResponseMappings } from './response-mapping';
const { KcbTimeFormat } = DateTimeFormats;

export namespace KcbTransactionConstant {
  export const loanRequestKey: string = 'kcb-loan-request';
  export const loanRequestCallbackKey: string = 'kcb-loan-request-callback';
  export const loanRepaymentKey: string = 'kcb-loan-repayment';
  export const loanRepaymentCallbackKey: string = 'kcb-loan-repayment-callback';
  export const queryLoanLimit: string = 'kcb-query-loan-limit';
  export const queryLoanBalance: string = 'kcb-query-loan-balance';
  export const Source: string = 'kcb';
  export const Operations: any = {
    loanRequest: {
      Operation: 'LOANREQUEST',
      Username: 'AZAM-APP',
      Password: 'w_R17CrUb',
      SecretKey: 'TEST',
      TransactionType: '1003',
    },
    loanPayment: {
      Operation: 'LOANREPAYMENT',
      Username: 'AZAM-APP',
      Password: 'w_R17CrUb',
      SecretKey: 'TEST',
      TransactionType: '1005',
    },
    loanLimit: {
      Operation: 'LOANLIMIT',
      Username: 'AZAM-APP',
      Password: 'w_R17CrUb',
      SecretKey: 'TEST',
      TransactionType: '1007',
    },
    loanBalance: {
      Operation: 'LOANBALANCE',
      Username: 'AZAM-APP',
      Password: 'w_R17CrUb',
      SecretKey: 'TEST',
      TransactionType: '1009',
    },
  };

  export const generateKCBPassword = async function (
    originalString: InterfaceList.CryptoEncryption,
  ) {
    // TO GENEATE AND HANDEL ALL SCENARIO RELATED TO PASSWORD GENEREATION
    return await Utils.encryptData(originalString);
  };

  export const getKCBHashingMessage = async function (message: InterfaceList.HasingMessages) {
    // TO GENEATE AND HANDEL ALL SCENARIO RELATED TO HASHED MESSAGE GENEREATION
    const hashedMessages = await Utils.hashMessages(message);
  };

  export function generateRequestObject(request: any): object {
    switch (request.Operation) {
      case KcbTransactionConstant.Operations['loanRequest'].Operation:
        return {
          LOANREQUEST: {
            Username: KcbTransactionConstant.Operations['loanRequest'].Username,
            Password: generateKCBPassword({
              EncyrptionString: KcbTransactionConstant.Operations['loanRequest'].Password,
              SecretKey: KcbTransactionConstant.Operations['loanRequest'].SecretKey,
            }),
            TransactionType: KcbTransactionConstant.Operations['loanRequest'].TransactionType,
            MerchantID: request.VendorCode,
            MSISDN: request.Msisdn,
            Amount: request.Amount,
            TransactionID: Utils.generateReferenceID(request.Msisdn, request.Amount),
            MessageID: getKCBHashingMessage(request.Message || 'Loan request submitted'),
            TransTime: Utils.fetchFormattedTimestamp({
              timestamp: undefined,
              format: KcbTimeFormat,
            }),
          },
        };

      case KcbTransactionConstant.Operations['loanPayment'].Operation:
        return {
          LOANREPAYMENT: {
            Username: KcbTransactionConstant.Operations['loanPayment'].Username,
            Password: generateKCBPassword({
              EncyrptionString: KcbTransactionConstant.Operations['loanPayment'].Password,
              SecretKey: KcbTransactionConstant.Operations['loanPayment'].SecretKey,
            }),
            TransactionType: KcbTransactionConstant.Operations['loanPayment'].TransactionType,
            MerchantID: request.VendorCode,
            MSISDN: request.Msisdn,
            Amount: request.Amount,
            TransactionID: Utils.generateReferenceID(request.Msisdn, request.Amount),
            MessageID: getKCBHashingMessage(request.Message),
            TransTime: Utils.fetchFormattedTimestamp({
              timestamp: undefined,
              format: KcbTimeFormat,
            }),
          },
        };

      case KcbTransactionConstant.Operations['loanLimit'].Operation:
        return {
          LOANLIMIT: {
            Username: KcbTransactionConstant.Operations['loanLimit'].Username,
            Password: generateKCBPassword({
              EncyrptionString: KcbTransactionConstant.Operations['loanLimit'].Password,
              SecretKey: KcbTransactionConstant.Operations['loanLimit'].SecretKey,
            }),
            TransactionType: KcbTransactionConstant.Operations['loanLimit'].TransactionType,
            MerchantID: request.VendorCode,
            MSISDN: request.ReferenceMsisdn,
            Amount: request.Amount,
            TransactionID: request.ReferenceID,
            MessageID: getKCBHashingMessage(request.Message || 'Loan limit request'),
            TransTime: Utils.fetchFormattedTimestamp({
              timestamp: undefined,
              format: KcbTimeFormat,
            }),
          },
        };

      case KcbTransactionConstant.Operations['loanBalance'].Operation:
        return {
          LOANBALANCE: {
            Username: KcbTransactionConstant.Operations['loanBalance'].Username,
            Password: generateKCBPassword({
              EncyrptionString: KcbTransactionConstant.Operations['loanBalance'].Password,
              SecretKey: KcbTransactionConstant.Operations['loanBalance'].SecretKey,
            }),
            TransactionType: KcbTransactionConstant.Operations['loanBalance'].TransactionType,
            MerchantID: request.VendorCode,
            MSISDN: request.ReferenceMsisdn,
            Amount: request.Amount,
            TransactionID: request.ReferenceID,
            MessageID: getKCBHashingMessage(request.Message || 'Loan balance request'),
            TransTime: Utils.fetchFormattedTimestamp({
              timestamp: undefined,
              format: KcbTimeFormat,
            }),
          },
        };
      default:
        return {};
    }
  }

  export function processResponseBody(response: any, operationDetails: any): object {
    switch (response.code.toString()) {
      case '0':
        if (
          operationDetails.Operation == KcbTransactionConstant.Operations['loanRequest'].Operation
        ) {
          return {
            messageCode: ResponseMappings['SUCCESS'],
            message: response.StatusDescription,
            data: {
              ReferenceID: response?.TransactionID,
              ExternalReferenceID: response?.ConversationID,
              LoanLimit: response?.LoanLimit ? response.LoanLimit : undefined,
              LoanBalance: response?.LoanBalance ? response.LoanBalance : undefined,
            },
          };
        } else {
          return {
            messageCode: ResponseMappings['SUCCESS'],
            message: response.StatusDescription,
            data: {
              ReferenceID: response?.TransactionID,
              ExternalReferenceID: response?.ConversationID,
              LoanLimit: response?.LoanLimit ? response.LoanLimit : undefined,
              LoanBalance: response?.LoanBalance ? response.LoanBalance : undefined,
            },
          };
        }

      default:
        return {
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          message: response.StatusDescription,
          data: response || {},
        };
    }
  }
}
