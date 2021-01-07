export const authorizeMerchant = {
  'post': {
    'x-operation-name': 'authorizeMerchantFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/authorizeMerchant'
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
              '$ref': '#/components/schemas/authorizeMerchant'
            }
          }
        }
      }
    }
  }
};
