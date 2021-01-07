export const components = {
  schemas: {
    commonUssdPushRequest: {
      type: 'object',
      properties: {
        SenderMsisdn: {
          type: 'string',
        },
        ReferenceMsisdn: {
          type: 'stirng',
        },
        Amount: {
          type: 'string',
        },
      },
    },
    commonUssdPushIntimationResponse: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
        msg: {
          type: 'string',
        },
        data: {
          type: 'object',
          properties: {
            ReferenceID: {
              type: 'string',
            },
          },
        },
      },
    },
    commonUssdPushConfimationResponse: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
        msg: {
          type: 'string',
        },
        data: {
          type: 'object',
          properties: {
            Operator: {
              type: 'string',
            },
            ReferenceID: {
              type: 'string',
            },
            UtilityReference: {
              type: 'string',
            },
            Amount: {
              type: 'string',
            },
            TansactionID: {
              type: 'string',
            },
            Msisdn: {
              type: 'string',
            },
          },
        },
      },
    },
    confirmPaymentRequest: {
      type: 'object',
      properties: {
        operator: {
          type: 'string',
        },
        reference: {
          type: 'string',
        },
        utilityref: {
          type: 'string',
        },
        amount: {
          type: 'string',
        },
        transid: {
          type: 'string',
        },
        msisdn: {
          type: 'string',
        },
      },
    },
    confirmPaymentResponse: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
        message: {
          type: 'string',
        },
        data: {},
      },
    },
    commonUssdPushForBank: {
      type: 'object',
      properties: {
        MerchantAccountNumber: { type: 'string' },
        MerchantName: { type: 'string' },
        MerchantMobileNumber: { type: 'string' },
        Otp: { type: 'string' },
        CurrencyCode: { type: 'string' },
        Amount: { type: 'string' },
        headers: {
          type: 'object',
          properties: {
            'Content-Type': { type: 'string' },
            authorization: { type: 'string' },
          },
          additionalProperties: true,
        },
      },
    },
  },
};
