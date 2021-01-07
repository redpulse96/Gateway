export const initiatePaymentRequest = {
  'post': {
    'x-operation-name': 'paymentInitiationFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/paymentInitiationFunction'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'halotel-transactions successfully executed',
        'content': {
          'application/json': {
            'success': true,
            'msg': 'halotel-transactions successfully executed',
            'data': {
              '$ref': '#/components/schemas/paymentInitiationFunction'
            }
          }
        }
      }
    }
  }
};
