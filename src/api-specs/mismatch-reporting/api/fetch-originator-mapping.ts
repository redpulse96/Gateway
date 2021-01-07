export const fetchOriginatorMapping = {
  'get': {
    'x-operation-name': 'fetchOriginatorMapping',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/fetchOriginatorMapping'
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
              '$ref': '#/components/schemas/fetchOriginatorMapping'
            }
          }
        }
      }
    }
  }
};
