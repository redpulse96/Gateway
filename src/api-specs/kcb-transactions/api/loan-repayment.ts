export const loanRepaymentFunction = {
  'post': {
    'x-operation-name': 'loanRepaymentFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/loanRepaymentInitiate'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'Successfully initiated Loan Repayment',
        'content': {
          'application/json': {
            'schema': {
              '$ref': '#/components/schemas/loanRepaymentInitiateResponse'
            }
          }
        }
      }
    }
  }
}
