export const components = {
  schemas: {
    fetchTransactionsFilter: {},
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
    fetchTransactionReports: {
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
        name: 'skip',
        schema: {
          type: 'string'
        },
        in: 'query'
      }, {
        name: 'limit',
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
    fetchFilterBasedReport: {
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
        name: 'skip',
        schema: {
          type: 'string'
        },
        in: 'query'
      }, {
        name: 'limit',
        schema: {
          type: 'string'
        },
        in: 'query'
      }]
    },
    fetchReportsForLabel: {
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
  },
};
