export const loanRequestFunction = {
  'post': {
    'x-operation-name': 'loanRequestFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/loanRequestInitiate'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'Successfully initiated Loan Request',
        'content': {
          'application/json': {
            'schema': {
              '$ref': '#/components/schemas/loanRequestInitiateResponse'
            }
          }
        }
      }
    }
  }
}
