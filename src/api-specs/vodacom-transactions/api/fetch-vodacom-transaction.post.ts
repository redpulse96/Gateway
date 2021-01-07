export const fetchVodacomTransactions = {
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
        'description': 'vodacom-transactions successfully executed',
        'content': {
          'application/json': {
            'success': true,
            'msg': 'vodacom-transactions successfully executed',
            'data': {
              '$ref': '#/components/schemas/fetchMultipleTransactions'
            }
          }
        }
      }
    }
  }
};
