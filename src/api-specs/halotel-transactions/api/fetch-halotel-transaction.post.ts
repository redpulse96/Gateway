export const fetchHalotelTransactions = {
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
        'description': 'halotel-transactions successfully executed',
        'content': {
          'application/json': {
            'success': true,
            'msg': 'halotel-transactions successfully executed',
            'data': {
              '$ref': '#/components/schemas/fetchMultipleTransactions'
            }
          }
        }
      }
    }
  }
};
