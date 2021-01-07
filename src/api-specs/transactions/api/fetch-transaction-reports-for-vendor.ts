export const fetchTransactionReportsForVendor = {
  'get': {
    'x-operation-name': 'fetchTransactionReports',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/fetchTransactionReports'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'Transactions report successfully executed',
        'content': {
          'application/json': {
            'success': true,
            'msg': 'Transactions report successfully executed',
            'data': {
              '$ref': '#/components/schemas/fetchTransactionReports'
            }
          }
        }
      }
    }
  }
}
