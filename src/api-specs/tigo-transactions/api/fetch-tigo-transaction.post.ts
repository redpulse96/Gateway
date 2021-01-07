export const fetchTigoTransactions = {
  'post': {
    'x-operation-name': 'fetchMultipleTransactions',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/fetchMultipleTransactions'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'tigo-transactions successfully executed',
        'content': {
          'application/json': {
            'success': true,
            'msg': 'tigo-transactions successfully executed',
            'data': {
              '$ref': '#/components/schemas/fetchMultipleTransactions'
            }
          }
        }
      }
    }
  }
};
