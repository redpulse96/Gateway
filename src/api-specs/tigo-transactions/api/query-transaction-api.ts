export const queryTransactionApi = {
  'post': {
    'x-operation-name': 'queryTransactionFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/queryTransactionApi'
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
              '$ref': '#/components/schemas/queryTransactionApi'
            }
          }
        }
      }
    }
  }
}

