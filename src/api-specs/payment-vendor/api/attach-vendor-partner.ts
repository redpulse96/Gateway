export const attachVendorToPartner = {
  'post': {
    'x-operation-name': 'updatePaymentVendorFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/attachVendorToPartnerDetails'
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
              '$ref': '#/components/schemas/attachVendorToPartnerDetails'
            }
          }
        }
      }
    }
  }
};
