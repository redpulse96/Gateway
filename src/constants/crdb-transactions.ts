import { Utils } from '../common';
import { HASH_SCHEME } from './interface-list';
import { ResponseMappings } from './response-mapping';

export namespace CrdbTransactionConstant {
  export const queueRoutingKey: string = 'crdb-transaction-request';
  export const Source: string = 'crdb';
  export const Operations: any = {
    merchantVerification: {
      Operation: 'merchantVerification',
      Code: 'RQTOKEN',
      Token: '1443822643219c882fc83cac45c00017477d35d2b997a0dfd1',
    },
    initiateTransaction: {
      Operation: 'initiateTransaction',
      Code: 'POSTPMT',
      PaymentType: '90',
      PaymentDesc: 'Product purchase',
      Token: '1443822643219c882fc83cac45c00017477d35d2b997a0dfd1',
      // Token: '20939579327f651f5ad08fd27393d385004c4ab78eb242c41f'
    },
  };

  export function generateRequestObject(request: any): object {
    switch (request.Operation) {
      case CrdbTransactionConstant.Operations['merchantVerification'].Operation:
        return {
          code: CrdbTransactionConstant.Operations['merchantVerification'].Code,
          customerName: request.MerchantName,
          customerAccount: request.MerchantAccountNumber,
          customerMobile: request.MerchantMobileNumber,
          otp: request.Otp,
          merchantID: request.CollectionAccountNumber,
          token: request.Token,
          checksum: Utils.hashBasedEncryption(
            HASH_SCHEME.SHA1,
            request.Token,
            Utils.hashBasedEncryption(HASH_SCHEME.MD5, request.MerchantMobileNumber),
            request.MerchantAccountNumber,
          ),
        };

      case CrdbTransactionConstant.Operations['initiateTransaction'].Operation:
        return {
          code: CrdbTransactionConstant.Operations['initiateTransaction'].Code,
          paymentType: CrdbTransactionConstant.Operations['initiateTransaction'].PaymentType,
          paymentDesc: CrdbTransactionConstant.Operations['initiateTransaction'].PaymentDesc,
          merchantID: request.CollectionAccountNumber,
          customerToken: request.ExternalMerchantReferenceID,
          amount: request.Amount,
          currency: request.CurrencyCode,
          paymentReference: request.PaymentReferenceID,
          token: request.Token,
          checksum: Utils.hashBasedEncryption(
            HASH_SCHEME.SHA1,
            request.Token,
            Utils.hashBasedEncryption(HASH_SCHEME.MD5, request.ExternalMerchantReferenceID),
            request.PaymentReferenceID,
          ),
        };
      default:
        return {};
    }
  }
  export function processResponseBody(response: any, operationDetails: any): object {
    switch (parseInt(response.code)) {
      case 200:
        if (
          operationDetails.Operation ==
          CrdbTransactionConstant.Operations['merchantVerification'].Operation
        ) {
          return {
            success: true,
            messageCode: ResponseMappings['SUCCESS'],
            message: response.data?.message || response.statusDesc,
            data: {
              ExternalMerchantReferenceID: response?.data?.customerToken,
              ExternalReferenceID: response?.data?.reference,
            },
          };
        } else {
          return {
            success: true,
            messageCode: ResponseMappings['SUCCESS'],
            message: response.data?.message || response.statusDesc,
            data: {
              ExternalReferenceID: response?.data?.receipt,
            },
          };
        }

      case 207:
        if (
          operationDetails.Operation ==
          CrdbTransactionConstant.Operations['merchantVerification'].Operation
        ) {
          return {
            success: true,
            messageCode: ResponseMappings['SUCCESS'],
            message: response.data?.message || response.statusDesc,
            data: {
              ExternalMerchantReferenceID: response?.data?.customerToken,
              ExternalReferenceID: response?.data?.reference,
            },
          };
        } else {
          return {
            success: true,
            messageCode: ResponseMappings['SUCCESS'],
            message: response.data?.message || response.statusDesc,
            data: {
              ExternalReferenceID: response?.data?.receipt,
            },
          };
        }

      case 204:
        if (
          operationDetails.Operation ==
          CrdbTransactionConstant.Operations['merchantVerification'].Operation
        ) {
          return {
            success: false,
            messageCode: ResponseMappings['SUCCESS'],
            message: response.data?.message || response.statusDesc,
            data: {},
          };
        } else {
          return {
            success: false,
            messageCode: ResponseMappings['SUCCESS'],
            message: response.data?.message || response.statusDesc,
            data: {},
          };
        }

      default:
        return {
          success: false,
          messageCode: ResponseMappings['SUCCESS'],
          message: response.data?.message || response.statusDesc,
          data: response.data || {},
        };
    }
  }
}
