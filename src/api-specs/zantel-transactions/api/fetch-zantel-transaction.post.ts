export const fetchZantelTransactions = {
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
        'description': 'zantel-transactions successfully executed',
        'content': {
          'application/json': {
            'success': true,
            'msg': 'zantel-transactions successfully executed',
            'data': {
              '$ref': '#/components/schemas/fetchMultipleTransactions'
            }
          }
        }
      }
    }
  }
};
