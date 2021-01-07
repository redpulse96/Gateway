import {
  billerCallbackApi,
  fetchTigoTransactions,
  fetchTransactionsCount,
  initiateTransactionApi,
  processTigoSyncApi,
  querysubscriber,
  queryTransactionApi,
  ValidateTokenApi,
} from './api';
import { components } from './components';

export const tigoDef = {
  components,
  basePath: '',
  paths: {
    '/azam/tigo/ussdnormal': processTigoSyncApi,
    '/tigo/ussdnormal': processTigoSyncApi,
    '/azam/tigo/ussd/normalC2B': processTigoSyncApi,
    '/tigo/ussd/normalC2B': processTigoSyncApi,

    '/azam/tigo/ussd/querysubscriber': querysubscriber,
    '/tigo/ussd/querysubscriber': querysubscriber,
    '/azam/tigo/ussd/querySubscriber/normalC2B': querysubscriber,
    '/tigo/ussd/querySubscriber/normalC2B': querysubscriber,

    '/azam/tigo/validatetoken': ValidateTokenApi,
    '/tigo/validatetoken': ValidateTokenApi,

    '/azam/tigo/initiatetransaction': initiateTransactionApi,
    '/tigo/initiatetransaction': initiateTransactionApi,

    '/azam/tigo/ussdpush/callback': billerCallbackApi,
    '/tigo/ussdpush/callback': billerCallbackApi,

    '/azam/tigo/querytransaction': queryTransactionApi,
    '/tigo/querytransaction': queryTransactionApi,

    '/azam/tigo/fetchTransactions': fetchTigoTransactions,
    '/tigo/fetchTransactions': fetchTigoTransactions,

    '/azam/tigo/fetchTransactionsCount': fetchTransactionsCount,
    '/tigo/fetchTransactionsCount': fetchTransactionsCount,
  },
};
