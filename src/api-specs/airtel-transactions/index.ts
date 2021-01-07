import { airtelTransactionUssdNormal } from './api/airtel-transaction-normal';
import { airtelTransactionUssdPush } from './api/airtel-transaction-push.post';
import { airtelTransactionsPushCallback } from './api/airtel-transactions-push-callback.post';
import { fetchAirtelTransactions } from './api/fetch-airtel-transaction.post';
import { fetchTransactionsCount } from './api/fetch-transactions-count';
import { components } from './components';

export const airtelDef = {
  components,
  basePath: '',
  paths: {
    '/azam/airtel/ussdpush': airtelTransactionUssdPush,
    '/airtel/ussdpush': airtelTransactionUssdPush,

    '/azam/airtel/ussdpush/callback': airtelTransactionsPushCallback,
    '/airtel/ussdpush/callback': airtelTransactionsPushCallback,
    '/airtelTransactions/UssdPush/Callback': airtelTransactionsPushCallback,

    '/airtelTransactionsNormalUssd': airtelTransactionUssdNormal,
    '/azam/airtel/ussdnormal': airtelTransactionUssdNormal,
    '/airtel/ussdnormal': airtelTransactionUssdNormal,

    '/airtel/fetchTransactions': fetchAirtelTransactions,
    '/azam/airtel/fetchTransactions': fetchAirtelTransactions,

    '/airtel/fetchTransactionsCount': fetchTransactionsCount,
    '/azam/airtel/fetchTransactionsCount': fetchTransactionsCount,
  },
};
