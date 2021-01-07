export const postDataToPaymentGatewayFromPartner = {
  'post': {
    'x-operation-name': 'postDataToPaymentGatewayFromPartnerFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/postDataToPaymentGatewayFromPartner'
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
              '$ref': '#/components/schemas/postDataToPaymentGatewayFromPartner'
            }
          }
        }
      }
    }
  }
};
