export const InitiateVodacomTransactionApi = {
  post: {
    'x-operation-name': 'initiateTransactionFunction',
    requestBody: {
      content: {
        'text/xml': {
          schema: {
            $ref: '#/components/schemas/initiateTransactionDetails',
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'airtel-transactions successfully executed',
        content: {
          'application/xml': {
            success: true,
            msg: 'airtel-transactions successfully executed',
            data: {
              $ref: '#/components/schemas/initiateTransactionDetails',
            },
          },
        },
      },
    },
  },
};
