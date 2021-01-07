export const billerCallbackApi = {
  'post': {
    'x-operation-name': 'billerCallbackFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/billerCallbackApi'
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
              '$ref': '#/components/schemas/billerCallbackApi'
            }
          }
        }
      }
    }
  }
}
