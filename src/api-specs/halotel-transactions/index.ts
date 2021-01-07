import {
  fetchHalotelTransactions,
  fetchTransactionsCount,
  initiatePaymentRequest,
  updatePaymentRequest,
  validatePaymentRequestSync,
} from './api';
import { components } from './components';

export const halotelDef = {
  components,
  basePath: '',
  paths: {
    '/azam/halotel/ussdpush/initiatepayment': initiatePaymentRequest,
    '/halotel/ussdpush/initiatepayment': initiatePaymentRequest,

    '/azam/halotel/ussdpush/callback': updatePaymentRequest,
    '/halotel/ussdpush/callback': updatePaymentRequest,

    '/azam/halotel/ext/halopesa/gp/callback': updatePaymentRequest,
    '/halotel/ext/halopesa/gp/callback': updatePaymentRequest,

    '/azam/halotel/normal/ussd/C2B': validatePaymentRequestSync,
    '/halotel/normal/ussd/C2B': validatePaymentRequestSync,
    '/halotel/ussd/validatePayment': validatePaymentRequestSync,

    '/azam/halotel/fetchTransactions': fetchHalotelTransactions,
    '/azam/halotel/fetchTransactionsCount': fetchTransactionsCount,
  },
};
