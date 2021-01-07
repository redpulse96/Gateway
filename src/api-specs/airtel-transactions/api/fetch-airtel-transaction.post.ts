export const fetchAirtelTransactions = {
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
        'description': 'airtel-transactions successfully executed',
        'content': {
          'application/json': {
            'success': true,
            'msg': 'airtel-transactions successfully executed',
            'data': {
              '$ref': '#/components/schemas/fetchMultipleTransactions'
            }
          }
        }
      }
    }
  }
};
