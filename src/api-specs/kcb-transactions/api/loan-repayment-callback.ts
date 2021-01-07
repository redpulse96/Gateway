export const loanRepaymentCallbackFunction = {
  'post': {
    'x-operation-name': 'loanRepaymentCallbackFunction',
    'requestBody': {
      'content': {
        'application/json': {
          'schema': {
            '$ref': '#/components/schemas/loanRepaymentCallback'
          }
        }
      }
    },
    'responses': {
      '200': {
        'description': 'Successfully got callback for  Loan Repayment',
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
