export const confirmRegistration: any = {
  post: {
    'x-operation-name': 'confirmRegistrationFunction',
    requestBody: {
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/approveRegistrationDetails',
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Users successfully executed',
        content: {
          'application/json': {
            success: true,
            msg: 'Users successfully executed',
            data: {
              $ref: '#/components/schemas/approveRegistrationDetails',
            },
          },
        },
      },
    },
  },
};
