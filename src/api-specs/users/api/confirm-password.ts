export const confirmPassword: any = {
  'post': {
    'x-operation-name': 'completeForgotPasswordFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/updateUserDetails'
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
              '$ref': '#/components/schemas/updateUserDetails'
            }
          }
        }
      }
    }
  }
};
