export const queryAccountDetails = {
  'post': {
    'x-operation-name': 'queryAccountInquiryFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/queryAccountInquiry'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'nmb-transactions successfully executed',
        'content': {
          'application/json': {
            'success': true,
            'msg': 'nmb-transactions successfully executed',
            'data': {
              '$ref': '#/components/schemas/queryAccountInquiry'
            }
          }
        }
      }
    }
  }
};
