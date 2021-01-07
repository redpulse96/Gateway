export const validatePaymentRequestSync = {
  'post': {
    'x-operation-name': 'validatePaymentRequestSyncFunction',
    'requestBody': {
      'content': {
        'text/xml': {
          'schema': {
            '$ref': '#/components/schemas/validatePaymentRequestSync'
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
              '$ref': '#/components/schemas/validatePaymentRequestSync'
            }
          }
        }
      }
    }
  }
};
