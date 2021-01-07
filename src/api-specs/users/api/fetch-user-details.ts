export const fetchUserDetails = {
  'get': {
    'x-operation-name': 'fetchUserDetails',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/fetchUserDetails'
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
}
