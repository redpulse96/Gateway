export const components = {
  schemas: {
    validateGatewayRequest: {
      'type': 'object',
      'parameters': [ {
        name: 'authorization',
        in: 'header',
        schema: {
          type: 'string'
        }
      }, {
        name: 'VendorCode',
        in: 'body',
        schema: {
          type: 'string'
        }
      }, {
        name: 'PartnerCode',
        in: 'body',
        schema: {
          type: 'string'
        }
      } ],
    },
    attachVendorToPartnerDetails: {
      'type': 'object',
      'parameters': [ {
        name: 'PaymentVendorID',
        in: 'body',
        schema: {
          type: 'number'
        }
      }, {
        name: 'PaymentPartnerID',
        in: 'body',
        schema: {
          type: 'number'
        }
      } ],
    },
  }
}
