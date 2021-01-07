export const registerUserDetails: any = {
  'post': {
    'x-operation-name': 'registerUserFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/registerUser'
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
              '$ref': '#/components/schemas/registerUser'
            }
          }
        }
      }
    }
  }
}
