export const merchantVerificationDetails = {
  'post': {
    'x-operation-name': 'merchantVerificationFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/verifyMerchant'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'crdb-transactions successfully executed',
        'content': {
          'application/json': {
            'success': true,
            'msg': 'crdb-transactions successfully executed',
            'data': {
              '$ref': '#/components/schemas/verifyMerchant'
            }
          }
        }
      }
    }
  }
};
