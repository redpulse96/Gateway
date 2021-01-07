export const initiateTransactionApi = {
  'post': {
    'x-operation-name': 'initiateTransactionFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/initiateTransactionApi'
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
              '$ref': '#/components/schemas/initiateTransactionApi'
            }
          }
        }
      }
    }
  }
};
