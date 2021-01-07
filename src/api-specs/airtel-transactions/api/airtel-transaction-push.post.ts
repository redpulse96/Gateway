export const airtelTransactionUssdPush = {
  'post': {
    'x-operation-name': 'incomingApplicationFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/postAirtelTransaction'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'airtel-transactions successfully executed',
        'content': {
          'application/json': {
            'success': true,
            'msg': 'airtel-transactions successfully executed',
            'data': {
              '$ref': '#/components/schemas/postAirtelTransaction'
            }
          }
        }
      }
    }
  }
};
