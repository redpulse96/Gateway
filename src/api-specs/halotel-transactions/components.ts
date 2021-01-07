export const components = {
  schemas: {
    postHalotelTransaction: {},
    postDataToPaymentGatewayFromPartner: {
      'type': 'object',
      'title': 'NotificationResponse',
      'properties': {
        'success': { type: 'boolean' },
        'message': { type: 'string' },
        'data': { type: 'object' }
      }
    },
    paymentInitiationFunction: {

    },
    updatePaymentRequest: {},
    validatePaymentRequestSync: {},
    fetchMultipleTransactions: {},
    fetchTransactionsCount: {}
  }
}
