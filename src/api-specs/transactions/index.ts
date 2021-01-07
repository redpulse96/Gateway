import { fetchFilterBasedReport, fetchReportsForLabel, fetchTransactionsForVendor, fetchTransactionsFilterForVendor, fetchTransactionReportsForVendor } from './api';
import { components } from './components';

export const transactionsDef = {
  components,
  'basePath': '/azam/transactions',
  'paths': {
    '/fetchTransactions': fetchTransactionsForVendor,
    '/fetchFilter': fetchTransactionsFilterForVendor,
    '/fetchTransactionReports': fetchTransactionReportsForVendor,
    '/fetchtimestampbasedreports': fetchFilterBasedReport,
    '/fetchreportscount': fetchReportsForLabel
  }
};
