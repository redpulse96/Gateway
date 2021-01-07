export const querysubscriber = {
  post: {
    'x-operation-name': 'querysubscriberFunction',
    requestBody: {
      content: {
        'application/xml': {
          schema: {
            $ref: '#/components/schemas/processTigoSyncApi',
          },
        },
        'text/xml': {
          schema: {
            $ref: '#/components/schemas/processTigoSyncApi',
          },
        },
        'text/plain': {
          schema: {
            $ref: '#/components/schemas/processTigoSyncApi',
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'airtel-transactions successfully executed',
        content: {
          'application/json': {
            success: true,
            msg: 'airtel-transactions successfully executed',
            data: {
              $ref: '#/components/schemas/processTigoSyncApi',
            },
          },
        },
      },
    },
  },
};
