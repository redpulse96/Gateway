export const components = {
  schemas: {
    postAirtelTransaction: {
      'type': 'object',
      'properties': {
        'Command': {
          'type': 'object',
          'properties': {
            'TYPE': {
              'type': 'string',
              'enum': [ 'PUSHAPI', 'KWESIPUSH' ],
              'default': 'KWESIPUSH'
            },
            'MSISDN': {
              'type': 'string',
              'default': 'red_test'
            },
            'MSISDN2': {
              'type': 'string',
              'default': 'red_test'
            },
            'PROVIDER': {
              'type': 'string',
              'default': '101'
            },
            'AMOUNT': {
              'type': 'string',
              'default': '100.00'
            },
            'INTERFACEID': {
              'type': 'string',
              'default': 'ONLINEPAY_test'
            }
          }
        }
      }
    },
    airtelTransactionsPushCallback: {
      'COMMAND': {
        'type': 'object',
        'properties': {
          'TYPE': {
            'type': 'string'
          },
          'serviceType': {
            'type': 'string'
          },
          'TXNSTATUS': {
            'type': 'string'
          },
          'TXNID': {
            'type': 'string'
          },
          'MESSAGE': {
            'type': 'string'
          },
          'INTERFACEID': {
            'type': 'string'
          },
          'REFERENCE_NO': {
            'type': 'string'
          },
          'EXT_TRID': {
            'type': 'string'
          }
        }
      }
    },
    airtelTransactionUssdPush: {
      'RequestToken': {
        'type': 'object',
        'properties': {
          'APIUser': {
            'type': 'string'
          },
          'APIPassword': {
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
          'ReferenceField': {
            'type': 'string'
          },
          'Msisdn': {
            'type': 'string'
          }
        }
      }
    },
    fetchMultipleTransactions: {},
    fetchTransactionsCount: {}
  }
}
