export const deRegisterMerchantDetails = {
  'post': {
    'x-operation-name': 'merchantDeregistrationFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/deRegisterMerchant'
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
              '$ref': '#/components/schemas/deRegisterMerchant'
            }
          }
        }
      }
    }
  }
};
