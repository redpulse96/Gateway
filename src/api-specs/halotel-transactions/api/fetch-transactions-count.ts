export const fetchTransactionsCount = {
  'post': {
    'x-operation-name': 'fetchTransactionsCount',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/fetchTransactionsCount'
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
              '$ref': '#/components/schemas/fetchTransactionsCount'
            }
          }
        }
      }
    }
  }
};

