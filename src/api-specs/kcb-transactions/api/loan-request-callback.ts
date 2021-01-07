export const loanRequestCallbackFunction = {
  'post': {
    'x-operation-name': 'loanRequestCallbackFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/loanRequestCallback'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'Successfully got callback Loan Request',
        'content': {
          'application/json': {
            'schema': {
              '$ref': '#/components/schemas/commonResponse'
            }
          }
        }
      }
    }
  }
}
