export const checkForOriginatorMatchMissing: any = {
  'post': {
    'x-operation-name': 'checkForOriginatorMatchMissingFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/checkForOriginatorMatchMissing'
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
              '$ref': '#/components/schemas/checkForOriginatorMatchMissing'
            }
          }
        }
      }
    }
  }
}
