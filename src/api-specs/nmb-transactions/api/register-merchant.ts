export const registerMerchantDetails = {
  'post': {
    'x-operation-name': 'merchantRegistrationFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/merchantRegistration'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'nmb-transactions successfully executed',
        'content': {
          'application/json': {
            'success': true,
            'msg': 'nmb-transactions successfully executed',
            'data': {
              '$ref': '#/components/schemas/merchantRegistration'
            }
          }
        }
      }
    }
  }
};
