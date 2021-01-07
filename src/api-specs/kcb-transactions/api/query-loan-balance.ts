export const queryLoanBalanceFunction = {
  'post': {
    'x-operation-name': 'queryLoanBalanceFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/loanBalanceQueryRequest'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'Successfully Queried Loan balance',
        'content': {
          'application/json': {
            'schema': {
              '$ref': '#/components/schemas/loanBalanceQueryResponse'
            }
          }
        }
      }
    }
  }
}
