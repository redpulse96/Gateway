export const confirmPayment = {
  post: {
    'x-operation-name': 'confirmPaymentFunction',
    requestBody: {
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/confirmPaymentRequest',
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
              $ref: '#/components/schemas/confirmPaymentResponse',
            },
          },
        },
      },
    },
  },
}
