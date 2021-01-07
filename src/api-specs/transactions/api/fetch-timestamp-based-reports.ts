export const fetchFilterBasedReport = {
  'get': {
    'x-operation-name': 'fetchFilterBasedReport',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/fetchFilterBasedReport'
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
              '$ref': '#/components/schemas/fetchFilterBasedReport'
            }
          }
        }
      }
    }
  }
}
