export const ussdZantelPushDetails = {
  'post': {
    'x-operation-name': 'ussdZantelPushFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/ussdPushDetails'
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
              '$ref': '#/components/schemas/ussdPushDetails'
            }
          }
        }
      }
    }
  }
};
