export const fetchTransactionsFilterForVendor = {
  'get': {
    'x-operation-name': 'fetchTransactionsFilterForVendor',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/fetchTransactionsFilter'
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
              '$ref': '#/components/schemas/fetchTransactionsFilter'
            }
          }
        }
      }
    }
  }
}
