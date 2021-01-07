export const fetchMismatchReports = {
  'get': {
    'x-operation-name': 'fetchMismatchReports',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/fetchMismatchReports'
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
              '$ref': '#/components/schemas/fetchMismatchReports'
            }
          }
        }
      }
    }
  }
};
