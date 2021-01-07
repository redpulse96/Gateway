export const validateAccountDetails = {
  'post': {
    'x-operation-name': 'validateAccountFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/validateAccountDetails'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'dtb-transactions successfully executed',
        'content': {
          'application/json': {
            'success': true,
            'msg': 'dtb-transactions successfully executed',
            'data': {
              '$ref': '#/components/schemas/validateAccountDetails'
            }
          }
        }
      }
    }
  }
};

