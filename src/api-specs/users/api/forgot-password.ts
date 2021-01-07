export const forgotUserPassword: any = {
  'post': {
    'x-operation-name': 'forgotPassword',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/forgotPassword'
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
              '$ref': '#/components/schemas/forgotPassword'
            }
          }
        }
      }
    }
  }
};
