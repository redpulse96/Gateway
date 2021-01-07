export const commonUssdPush = {
  post: {
    'x-operation-name': 'callCommonApiForMno',
    requestBody: {
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/commonUssdPushRequest',
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
