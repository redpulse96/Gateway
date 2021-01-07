export const components = {
  schemas: {
    registerUser: {
      type: 'object',
      properties: {
        'Email': {
          type: 'string'
        },
        'Password': {
          type: 'string'
        },
        'Name': {
          type: 'string'
        },
        'Address': {
          type: 'string'
        },
        'MobileNumber': {
          type: 'string'
        },
        'roles': {
          type: 'array'
        },
      },
    },
    loginUserDetails: {},
    logoutUserDetails: {},
    fetchUsersDetails: {
      parameters: [{
        name: 'StartDate',
        schema: {
          type: 'string'
        },
        in: 'query'
      }, {
        name: 'EndDate',
        schema: {
          type: 'string'
        },
        in: 'query'
      }]
    },
    approveRegistrationDetails: {},
    rejectRegistrationDetails: {},
    fetchTransactionsForVendor: {
      parameters: [{
        name: 'StartDate',
        schema: {
          type: 'string'
        },
        in: 'query'
      }, {
        name: 'EndDate',
        schema: {
          type: 'string'
        },
        in: 'query'
      }, {
        name: 'AirtelTransaction',
        schema: {
          type: 'string'
        },
        in: 'query'
      }, {
        name: 'HalotelTransaction',
        schema: {
          type: 'string'
        },
        in: 'query'
      }, {
        name: 'TigoTransaction',
        schema: {
          type: 'string'
        },
        in: 'query'
      }, {
        name: 'VodacomTransaction',
        schema: {
          type: 'string'
        },
        in: 'query'
      }, {
        name: 'ZantelTransaction',
        schema: {
          type: 'string'
        },
        in: 'query'
      }, {
        name: 'Skip',
        schema: {
          type: 'string'
        },
        in: 'query'
      }, {
        name: 'Limit',
        schema: {
          type: 'string'
        },
        in: 'query'
      }, {
        name: 'ReferenceID',
        schema: {
          type: 'string'
        },
        in: 'query'
      }, {
        name: 'ExternalReferenceID',
        schema: {
          type: 'string'
        },
        in: 'query'
      }, {
        name: 'IncomingRequestType',
        schema: {
          type: 'string'
        },
        in: 'query'
      }]
    },
    updateUserDetails: {
      type: 'object',
      parameters: [{
        name: 'UpdateUserObj',
        schema: {
          type: 'object'
        },
        in: 'body'
      }, {
        name: 'Email',
        schema: {
          type: 'string'
        },
        in: 'body'
      }, {
        name: 'OldPassword',
        schema: {
          type: 'string'
        },
        in: 'body'
      }]
    },
    completeRegistrationDetails: {
      type: 'object',
      parameters: [{
        name: 'UserDetails',
        schema: {
          type: 'object'
        },
        in: 'body'
      }, {
        name: 'PaymentVendroDetails',
        schema: {
          type: 'object'
        },
        in: 'body'
      }]
    },
    attachRolesToUser: {
      type: 'object',
      parameters: [{
        name: 'UserID',
        schema: {
          type: 'number'
        },
        in: 'body'
      }, {
        name: 'RoleID',
        schema: {
          type: 'number'
        },
        in: 'body'
      }]
    },
    fetchUserDetails: {
      type: 'object',
      parameters: [{
        name: 'UserID',
        schema: {
          type: 'number'
        },
        in: 'query'
      }]
    },
    forgotPassword: {
      type: 'object',
      parameters: [{
        name: 'Email',
        schema: {
          type: 'string'
        },
        in: 'body'
      }]
    }
  },
};
