export const fetchReportsForLabel = {
  'get': {
    'x-operation-name': 'fetchReportsForLabel',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/fetchReportsForLabel'
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
