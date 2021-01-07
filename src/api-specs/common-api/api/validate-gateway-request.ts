
export const validateGatewayRequest = {
  'post': {
    'x-operation-name': 'validateApplicationRequestFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/validateGatewayRequest'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'payment-vendor-transactions successfully executed',
        'content': {
          'application/json': {
            'success': true,
            'msg': 'payment-vendor-transactions successfully executed',
            'data': {
              '$ref': '#/components/schemas/validateGatewayRequest'
            }
          }
        }
      }
    }
  }
};
