
export const airtelTransactionUssdNormal = {
  'post': {
    'x-operation-name': 'airtelTransactionUssdPushFunction',
    'requestBody': {
      'content': {
        'text/xml': {
          'schema': {
            '$ref': '#/components/schemas/airtelTransactionUssdPush'
          }
        },
        'text/plain': {
          'schema': {
            '$ref': '#/components/schemas/airtelTransactionUssdPush'
          }
        },
        'application/xml': {
          'schema': {
            '$ref': '#/components/schemas/airtelTransactionUssdPush'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'airtel-transactions successfully executed',
        'content': {
          'application/json': {
            'success': true,
            'msg': 'airtel-transactions successfully executed',
            'data': {
              '$ref': '#/components/schemas/airtelTransactionUssdPush'
            }
          }
        }
      }
    }
  }
};
