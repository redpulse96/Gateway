export const updatePaymentRequest = {
  'post': {
    'x-operation-name': 'updatePaymentRequestFunction',
    'requestBody': {
      'content': {
        'text/xml': {
          'schema': {
            '$ref': '#/components/schemas/updatePaymentRequest'
          }
        },
        'application/xml': {
          'schema': {
            '$ref': '#/components/schemas/updatePaymentRequest'
          }
        },
        'text/plain': {
          'schema': {
            '$ref': '#/components/schemas/updatePaymentRequest'
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
              '$ref': '#/components/schemas/updatePaymentRequest'
            }
          }
        }
      }
    }
  }
};
