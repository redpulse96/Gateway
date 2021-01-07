export const initiateTransactionDetails = {
  'post': {
    'x-operation-name': 'initiateTransactionFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/initiateTransaction'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'crdb-transactions successfully executed',
        'content': {
          'application/json': {
            'success': true,
            'msg': 'crdb-transactions successfully executed',
            'data': {
              '$ref': '#/components/schemas/initiateTransaction'
            }
          }
        }
      }
    }
  }
};
