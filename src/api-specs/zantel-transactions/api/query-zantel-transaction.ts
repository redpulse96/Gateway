export const queryZantelTransactionDetails = {
  'post': {
    'x-operation-name': 'queryZantelTransactionFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            'additionalProperties': {
              '$ref': '#/components/schemas/queryZantelTransactionDetails'
            }
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
              '$ref': '#/components/schemas/queryZantelTransactionDetails'
            }
          }
        }
      }
    }
  }
}
