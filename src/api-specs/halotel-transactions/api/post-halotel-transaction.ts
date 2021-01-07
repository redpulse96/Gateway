
export const postHalotelTransaction = {
  'post': {
    'x-operation-name': 'postHalotelTransactionFunction',
    'requestBody': {
      'content': {
        'text/xml': {
          'schema': {
            '$ref': '#/components/schemas/postHalotelTransaction'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'halotel-transactions successfully executed',
        'content': {
          'application/json': {
            'success': true,
            'msg': 'halotel-transactions successfully executed',
            'data': {
              '$ref': '#/components/schemas/postHalotelTransaction'
            }
          }
        }
      }
    }
  }
};
