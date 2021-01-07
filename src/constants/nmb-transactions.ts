import { Utils } from '../common';
import { ResponseMappings } from './response-mapping';

export namespace NmbTransactionConstant {
  export const queueRoutingKey: string = 'nmb-transaction-request';
  export const Source: string = 'nmb';
  export const Operations: any = {
    queryAccountInquiry: {
      Operation: 'queryAccountInquiry',
      Code: '1',
    },
    merchantRegistration: {
      Operation: 'merchantRegistration',
      Code: '2',
    },
    merchantDeregistration: {
      Operation: 'merchantDeregistration',
      Code: '3',
    },
    initiateTransaction: {
      Operation: 'initiateTransaction',
      Code: '4',
    },
    authorizeMerchant: {
      Operation: 'authorizeMerchant',
      Code: '5',
    },
  };

  export function generateRequestObj(requestObj: any): object {
    const { integrationPartner, request } = requestObj;
    switch (requestObj.operation) {
      case 'queryAccountInquiry':
        return {
          username: integrationPartner.Username,
          password: integrationPartner.Password,
          request: {
            operation: NmbTransactionConstant.Operations[requestObj.operation].Code,
            accountnumber: request.AccountNumber,
            azamtransactionref: request.AzamTransactionRef,
          },
        };

      case 'merchantRegistration':
        return {
          username: integrationPartner.Username,
          password: integrationPartner.Password,
          request: {
            operation: NmbTransactionConstant.Operations[requestObj.operation].Code,
            accountnumber: request.MerchantAccountNumber,
            mechantname: request.MerchantName,
            azamtime: Utils.fetchCurrentTimestamp(),
          },
        };

      case 'merchantDeregistration':
        return {
          username: integrationPartner.Username,
          password: integrationPartner.Password,
          request: {
            operation: NmbTransactionConstant.Operations[requestObj.operation].Code,
            drtoken: request.MerchantToken,
            azamtime: Utils.fetchCurrentTimestamp(),
          },
        };

      case 'initiateTransaction':
        return {
          username: integrationPartner.Username,
          password: integrationPartner.Password,
          request: {
            operation: NmbTransactionConstant.Operations[requestObj.operation].Code,
            merchantmobile: request.MerchantMobileNumber,
            drtoken: request.MerchantToken,
            amount: request.Amount,
            businesscode: integrationPartner.CollectionAccountNumber,
            azamtransactionref: request.ReferenceID,
          },
        };

      case 'authorizeMerchant':
        return {
          username: integrationPartner.Username,
          password: integrationPartner.Password,
          request: {
            operation: NmbTransactionConstant.Operations[requestObj.operation].Code,
            drtoken: request.MerchantToken,
            otp: request.Otp,
            azamtransactionref: request.ReferenceID,
          },
        };

      default:
        return {};
    }
  }

  export function processResponseBody(response: any): object {
    let responseBody = { ...response };
    delete responseBody['responsemessage'];
    delete responseBody['responsecode'];
    switch (response.responsecode) {
      case '00':
        return {
          success: true,
          messageCode: ResponseMappings['SUCCESS'],
          message: response.responsemessage,
          data: responseBody,
        };

      case '21':
        return {
          success: false,
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          message: response.responsemessage,
          data: responseBody || {},
        };

      case '57':
        return {
          success: true,
          messageCode: ResponseMappings['SUCCESS'],
          message: response.responsemessage,
          data: responseBody || {},
        };

      default:
        return {
          success: false,
          messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'],
          message: response.responsemessage,
          data: {},
        };
    }
  }
}
