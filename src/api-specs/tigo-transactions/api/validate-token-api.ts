export const ValidateTokenApi = {
  'post': {
    'x-operation-name': 'validateTokenFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            'additionalProperties': {
              '$ref': '#/components/schemas/ValidateTokenApi'
            }
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'airtel-transactions successfully executed',
        'content': {
          'application/json': {
            'success': true,
            'msg': 'airtel-transactions successfully executed',
            'data': {
              '$ref': '#/components/schemas/ValidateTokenApi'
            }
          }
        }
      }
    }
  }
}
