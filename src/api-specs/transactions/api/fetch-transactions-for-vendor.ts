export const fetchTransactionsForVendor = {
  'get': {
    'x-operation-name': 'fetchTransactionsForVendor',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/fetchTransactionsForVendor'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'Users successfully executed',
        'content': {
          'application/json': {
            'success': true,
            'msg': 'Users successfully executed',
            'data': {
              '$ref': '#/components/schemas/loginUserDetails'
            }
          }
        }
      }
    }
  }
};
