export const airtelTransactionsPushCallback = {
  'post': {
    'x-operation-name': 'airtelUssdPushCallbackFunction',
    'requestBody': {
      'content': {
        'text/xml': {
          'schema': {
            '$ref': '#/components/schemas/airtelTransactionsPushCallback'
          }
        },
        'application/xml': {
          'schema': {
            '$ref': '#/components/schemas/airtelTransactionsPushCallback'
          }
        },
        'text/plain': {
          'schema': {
            '$ref': '#/components/schemas/airtelTransactionsPushCallback'
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
              '$ref': '#/components/schemas/airtelTransactionsPushCallback'
            }
          }
        }
      }
    }
  }
};
