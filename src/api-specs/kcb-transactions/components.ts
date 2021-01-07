export const components = {
  schemas: {

    // COMMON RESPONSE
    commonResponse: {
      'type': 'object',
      'properties': {
        success: {
          type: 'boolean'
        },
        message: {
          type: 'string'
        },
        data: {
          type: 'object',
          properties: {

          }
        }
      }
    },



    // Loan Request initiation request and response async
    loanRequestInitiate: {
      'type': 'object',
      'properties': {
        'LOANREQUEST': {
          'type': 'object',
          'properties': {
            'Username': {
              'type': 'string',
            },
            'Password': {
              'type': 'string',
            },
            'MerchantID': {
              'type': 'string',
            },
            'TransactionType': {
              'type': 'string',
            },
            'MSISDN': {
              'type': 'string',
            },
            'Amount': {
              'type': 'string',
            },
            'TransactionID': {
              'type': 'string',
            },
            'MessageID': {
              'type': 'string',
            },
            'TransTime': {
              'type': 'string',
            }
          }
        }
      }
    },
    loanRequestInitiateResponse: {
      'type': 'object',
      'properties': {
        'StatusCode': {
          'type': 'string'
        },
        'StatusDescription': {
          'type': 'string'
        },
        'TransactionID': {
          'type': 'string'
        },
        'ConversationID': {
          'type': 'string'
        },
        'TransTime': {
          'type': 'string'
        }
      }
    },

    // Loan Request callback response async
    loanRequestCallback: {
      'type': 'object',
      'properties': {
        'StatusCode': {
          'type': 'string'
        },
        'StatusDescription': {
          'type': 'string'
        },
        'MSISDN': {
          'type': 'string'
        },
        'TransactionType': {
          'type': 'string'
        },
        'TransactionID': {
          'type': 'string'
        },
        'LoanAmount': {
          'type': 'string'
        },
        'LoanAccountNo': {
          'type': 'string'
        },
        'LoanType': {
          'type': 'string'
        },
        'LoanStartDate': {
          'type': 'string'
        },
        'PrincipalAmount': {
          'type': 'string'
        },
        'LoanStatus': {
          'type': 'string'
        },
        'LoanBalance': {
          'type': 'string'
        },
        'InterestRate': {
          'type': 'string'
        },
        'InterestAmount': {
          'type': 'string'
        },
        'RepaymentDate': {
          'type': 'string'
        },
        'ConversationID': {
          'type': 'string'
        },
        'TransTime': {
          'type': 'string'
        },
      }
    },



    //LOAN REPAYMENT REQUEST AND RESPONSE ASYNC
    loanRepaymentInitiate: {
      'type': 'object',
      'properties': {
        'LOANREPAYMENT': {
          'type': 'object',
          'properties': {
            'Username': {
              'type': 'string',
            },
            'Password': {
              'type': 'string',
            },
            'MerchantID': {
              'type': 'string',
            },
            'TransactionType': {
              'type': 'string',
            },
            'MSISDN': {
              'type': 'string',
            },
            'Amount': {
              'type': 'string',
            },
            'TransactionID': {
              'type': 'string',
            },
            'MessageID': {
              'type': 'string',
            },
            'TransTime': {
              'type': 'string',
            }
          }
        }
      }
    },
    loanRepaymentInitiateResponse: {
      'type': 'object',
      'properties': {
        'StatusCode': {
          'type': 'string'
        },
        'StatusDescription': {
          'type': 'string'
        },
        'TransactionID': {
          'type': 'string'
        },
        'ConversationID': {
          'type': 'string'
        },
        'TransTime': {
          'type': 'string'
        }
      }
    },

    // Loan Repayment callback response async
    loanRepaymentCallback: {
      'type': 'object',
      'properties': {
        'StatusCode': {
          'type': 'string'
        },
        'StatusDescription': {
          'type': 'string'
        },
        'MSISDN': {
          'type': 'string'
        },
        'TransactionType': {
          'type': 'string'
        },
        'TransactionID': {
          'type': 'string'
        },
        'LoanAmount': {
          'type': 'string'
        },
        'LoanAccountNo': {
          'type': 'string'
        },
        'LoanBalance': {
          'type': 'string'
        },
        'LoanPaidAmount': {
          'type': 'string'
        },
        'LoanDueDate': {
          'type': 'string'
        },
        'ConversationID': {
          'type': 'string'
        },
        'TransTime': {
          'type': 'string'
        },
      }
    },



    //LOAN LIMIT QUERY REQUEST AND RESPONSE SYNC
    loanLimitQueryRequest: {
      'type': 'object',
      'properties': {
        'LOANLIMIT': {
          'type': 'object',
          'properties': {
            'Username': {
              'type': 'string',
            },
            'Password': {
              'type': 'string',
            },
            'MerchantID': {
              'type': 'string',
            },
            'TransactionType': {
              'type': 'string',
            },
            'MSISDN': {
              'type': 'string',
            },
            'TransactionID': {
              'type': 'string',
            },
            'MessageID': {
              'type': 'string',
            },
            'TransTime': {
              'type': 'string',
            },
          }
        }
      }
    },
    loanLimitQueryResponse: {
      'type': 'object',
      'properties': {
        'StatusCode': {
          'type': 'string'
        },
        'StatusDescription': {
          'type': 'string'
        },
        'MerchantID': {
          'type': 'string'
        },
        'TransactionType': {
          'type': 'string'
        },
        'TransactionID': {
          'type': 'string'
        },
        'LoanLimit': {
          'type': 'string'
        },
        'ConversationID': {
          'type': 'string'
        },
        'TransTime': {
          'type': 'string'
        }
      }
    },



    //LOAN BALANCE QUERY REQUEST AND RESPONSE SYNC
    loanBalanceQueryRequest: {
      'type': 'object',
      'properties': {
        'LOANBALANCE': {
          'type': 'object',
          'properties': {
            'Username': {
              'type': 'string',
            },
            'Password': {
              'type': 'string',
            },
            'MerchantID': {
              'type': 'string',
            },
            'TransactionType': {
              'type': 'string',
            },
            'MSISDN': {
              'type': 'string',
            },
            'TransactionID': {
              'type': 'string',
            },
            'MessageID': {
              'type': 'string',
            },
            'TransTime': {
              'type': 'string',
            },
          }
        }
      }
    },
    loanBalanceQueryResponse: {
      'type': 'object',
      'properties': {
        'StatusCode': {
          'type': 'string'
        },
        'StatusDescription': {
          'type': 'string'
        },
        'MerchantID': {
          'type': 'string'
        },
        'TransactionType': {
          'type': 'string'
        },
        'TransactionID': {
          'type': 'string'
        },
        'LoanBalance': {
          'type': 'string'
        },
        'ConversationID': {
          'type': 'string'
        },
        'TransTime': {
          'type': 'string'
        }
      }
    }



  }
}
