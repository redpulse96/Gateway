import {
  fetchTransactionsCount,
  fetchVodacomTransactions,
  InitiateVodacomTransactionApi,
} from './api';
import { components } from './components';

export const vodacomDef = {
  components,
  basePath: '',
  paths: {
    '/azam/vodacom/ussd/paymentIntimation': InitiateVodacomTransactionApi,
    '/vodacom/ussd/paymentIntimation': InitiateVodacomTransactionApi,
    '/azam/vodacom/fetchTransactions': fetchVodacomTransactions,
    '/azam/vodacom/fetchTransactionsCount': fetchTransactionsCount,
  },
};
