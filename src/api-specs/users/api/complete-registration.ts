export const completeRegistration = {
  'post': {
    'x-operation-name': 'completeRegistrationFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/completeRegistrationDetails'
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
