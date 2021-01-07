export const components = {
  schemas: {
    validateAccountDetails: {
      'userDetails': {
        'type': 'object',
        'properties': {
          'accountNumber': {
            'type': 'string'
          },
          'name': {
            'type': 'string',
            'default': 'red_test'
          }
        }
      }
    },
    validateAuthCode: {
      'authCodeDetails': {
        'type': 'object',
        'properties': {
          'sessionToken': {
            'type': 'string',
            'required': true
          },
          'otp': {
            'type': 'string',
            'default': 'red_test'
          }
        }
      }
    }
  }
};
