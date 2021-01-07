export const attachRolesToUser = {
  'post': {
    'x-operation-name': 'attachRolesToUserFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/attachRolesToUser'
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
              '$ref': '#/components/schemas/attachRolesToUser'
            }
          }
        }
      }
    }
  }
}
