import {
  fetchTransactionsCount,
  fetchZantelTransactions,
  processZantelTransactionRequestDetails,
  queryZantelTransactionDetails,
  ussdZantelPushCallback,
  ussdZantelPushDetails,
} from './api';
import { components } from './components';

export const zantelDef = {
  components,
  basePath: '',
  paths: {
    '/azam/zantel/ussdPush': ussdZantelPushDetails,
    '/zantel/ussdPush': ussdZantelPushDetails,

    '/azam/zantel/ussdPush/callback': ussdZantelPushCallback,
    '/zantel/ussdPush/callback': ussdZantelPushCallback,

    '/azam/zantel/ussd/normalTransaction': processZantelTransactionRequestDetails,
    '/zantel/ussd/normalTransaction': processZantelTransactionRequestDetails,

    '/azam/zantel/ussd/normal/C2B': processZantelTransactionRequestDetails,
    '/zantel/ussd/normal/C2B': processZantelTransactionRequestDetails,

    '/azam/zantel/queryZantelTransaction': queryZantelTransactionDetails,
    '/azam/zantel/fetchTransactions': fetchZantelTransactions,
    '/azam/zantel/fetchTransactionsCount': fetchTransactionsCount,
  },
};
