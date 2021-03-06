export const processZantelTransactionRequestDetails = {
  post: {
    'x-operation-name': 'processZantelTransactionRequestFunction',
    requestBody: {
      content: {
        'text/xml': {
          schema: {
            $ref: '#/components/schemas/processZantelTransactionRequestDetails',
          },
        },
        'application/xml': {
          schema: {
            $ref: '#/components/schemas/processZantelTransactionRequestDetails',
          },
        },
      },
    },
    responses: {
      '200': {
        'description': 'zantel-transactions successfully executed',
        'content': {
          'text/xml': {
            'success': true,
            'msg': 'zantel-transactions successfully executed',
            'data': {
              '$ref': '#/components/schemas/processZantelTransactionRequestDetails'
            }
          },
          'application/xml': {
            'success': true,
            'msg': 'zantel-transactions successfully executed',
            'data': {
              '$ref': '#/components/schemas/processZantelTransactionRequestDetails'
            }
          }
        }
      }
    }
  }
}
