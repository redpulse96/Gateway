export const logoutUserDetails: any = {
  'post': {
    'x-operation-name': 'logOutFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/logoutUserDetails'
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
              '$ref': '#/components/schemas/logoutUserDetails'
            }
          }
        }
      }
    }
  }
}
