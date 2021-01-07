export const validateAuthCodeFunction = {
  'post': {
    'x-operation-name': 'validateAuthCodeFunction',
    'requestBody': {
      'content': {
        'text/json': {
          'schema': {
            '$ref': '#/components/schemas/validateAuthCode'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'Validate auth token for the request',
        'content': {
          'application/json': {
            'success': true,
            'msg': 'dtb-transaction auth token successfully validated',
            'data': {
              '$ref': '#/components/schemas/validateAuthCode'
            }
          }
        }
      }
    }
  }
};
