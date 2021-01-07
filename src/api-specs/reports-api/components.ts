export const components = {
  schemas: {
    checkForOriginatorMatchMissing: {
      type: 'object',
      parameters: [{
        name: 'StartDate',
        schema: {
          type: 'string',
        },
        in: 'body'
      }, {
        name: 'EndDate',
        schema: {
          type: 'string',
        },
        in: 'body'
      }, {
        name: 'transactions',
        schema: {
          type: 'string',
        },
        in: 'query'
      }]
    },
  },
};
