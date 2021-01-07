export const fetchUsersDetails = {
  'get': {
    'x-operation-name': 'fetchUsersByFilterFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/fetchUsersDetails'
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
