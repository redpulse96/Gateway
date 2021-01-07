export const components = {
  schemas: {
    queryAccountInquiry: {
      'QueryDetails': {
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
          }
        }
      }
    },
    merchantRegistration: {
      'merchantDetails': {
        'type': 'object',
        'properties': {
          'CountryCode': {
            'type': 'string',
            'required': false
          },
          'MerchantAccountNumber': {
            'type': 'string',
            'required': true
          },
          'MerchantName': {
            'type': 'string',
            'required': true
          }
        }
      }
    },
    deRegisterMerchant: {
      'merchantDetails': {
        'type': 'object',
        'additionalProperties': true,
        'properties': {
          'CountryCode': {
            'type': 'string',
            'required': false
          },
          'MerchantReferenceID': {
            'type': 'string',
            'required': true
          }
        }
      }
    },
    initiateTransaction: {
      'transactionDetails': {
        'type': 'object',
        'additionalProperties': true,
        'properties': {
          'CountryCode': {
            'type': 'string',
            'required': false
          },
          'MerchantReferenceID': {
            'type': 'string',
            'required': true
          },
          'MobileNumber': {
            'type': 'string',
            'required': true
          },
          'Amount': {
            'type': 'string',
            'required': true
          }
        }
      }
    },
    authorizeMerchant: {
      'transactionDetails': {
        'type': 'object',
        'additionalProperties': true,
        'properties': {
          'MerchantReferenceID': {
            'type': 'string',
            'required': true
          },
          'PartnerCode': {
            'type': 'string',
            'required': true
          },
          'Otp': {
            'type': 'string',
            'required': true
          }
        }
      }
    }
  }
};
