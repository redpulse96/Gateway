export const queryLoanLimitFunction = {
  'post': {
    'x-operation-name': 'queryLoanLimitFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/loanLimitQueryRequest'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'Successfully got Loan Limit query',
        'content': {
          'application/json': {
            'schema': {
              '$ref': '#/components/schemas/loanLimitQueryResponse'
            }
          }
        }
      }
    }
  }
}
