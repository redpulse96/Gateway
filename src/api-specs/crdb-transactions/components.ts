export const components = {
  schemas: {
    verifyMerchant: {
      'MerchantDetails': {
        'type': 'object',
        'properties': {
          'CountryCode': {
            'type': 'string',
            'required': false
          },
          'MerchantAccountNumber': {
            'type': 'string',
            'required': false
          },
          'MerchantReferenceID': {
            'type': 'string',
            'required': false
          },
          'MerchantMobileNumber': {
            'type': 'string',
            'required': false
          },
          'MerchaneName': {
            'type': 'string',
            'required': false
          },
          'Otp': {
            'type': 'string',
            'required': false
          }
        }
      }
    },
    initiateTransaction: {
      'TransactionDetails': {
        'type': 'object',
        'additionalProperties': true,
        'properties': {
          'MerchantReferenceID': {
            'type': 'string',
            'required': true
          },
          'CountryCode': {
            'type': 'string',
            'required': false
          },
          'CurrencyCode': {
            'type': 'string',
            'required': false
          },
          'Amount': {
            'type': 'string',
            'required': true
          }
        }
      }
    }
  }
}
