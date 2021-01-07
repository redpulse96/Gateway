export const commonUssdPushForBank = {
  post: {
    'x-operation-name': 'callCommonApiForBank',
    requestBody: {
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/commonUssdPushForBank',
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'airtel-transactions successfully executed',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/commonUssdPushIntimationResponse',
            },
          },
        },
      },
    },
  },
};
