export const fetchAuditLogs = {
  'get': {
    'x-operation-name': 'find',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/fetchAuditLogs'
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
              '$ref': '#/components/schemas/fetchAuditLogs'
            }
          }
        }
      }
    }
  }
};
