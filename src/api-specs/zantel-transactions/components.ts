export const components = {
  schemas: {
    ussdPushDetails: {
      'RequestToken': {
        'type': 'object',
        'properties': {
          'CountryCode': {
            'type': 'string'
          },
          'utilitycode': {
            'type': 'string'
          },
          'TransID': {
            'type': 'string'
          },
          'Amount': {
            'type': 'string'
          },
          'ReferenceField1': {
            'type': 'string'
          },
          'ReferenceField2': {
            'type': 'string'
          },
          'Msisdn': {
            'type': 'string'
          }
        }
      }
    },
    processZantelTransactionRequestDetails: {
      'REQUEST': {
        'type': 'object',
        'properties': {
          'CountryCode': {
            'type': 'string'
          },
          'USERNAME': {
            'type': 'string'
          },
          'PASSWORD': {
            'type': 'string'
          },
          'TYPE': {
            'type': 'string'
          },
          'REQUESTTIME': {
            'type': 'string'
          },
          'PAYMENTCODE': {
            'type': 'string'
          },
          'CUSTNAME': {
            'type': 'string'
          },
          'REQUESTID': {
            'type': 'string'
          },
          'SENDER': {
            'type': 'string'
          },
          'AMOUNT': {
            'type': 'string'
          },
          'ADDDATA': {
            'type': 'string'
          },
          'CHECKSUM': {
            'type': 'string'
          }
        }
      }
    },
    queryZantelTransactionDetails: {
      'RequestToken': {
        'type': 'object',
        'properties': {
          'CountryCode': {
            'type': 'string'
          },
          'ReferenceID': {
            'type': 'string'
          }
        }
      }
    },
    fetchMultipleTransactions: {},
    fetchTransactionsCount: {}
  }
}
