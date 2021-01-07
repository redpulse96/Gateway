import { loanRepaymentFunction } from "./api/loan-repayment";
import { loanRepaymentCallbackFunction } from "./api/loan-repayment-callback";
import { loanRequestFunction } from "./api/loan-request";
import { loanRequestCallbackFunction } from "./api/loan-request-callback";
import { queryLoanBalanceFunction } from "./api/query-loan-balance";
import { queryLoanLimitFunction } from "./api/query-loan-limit";
import { components } from './components';


export const kcbDef = {
  components,
  'basePath': '/azam',
  'paths': {
    '/initiate/loanRequest': loanRequestFunction,
    '/initiate/loanRequest/callback': loanRequestCallbackFunction,
    '/initiate/loanRepayment': loanRepaymentFunction,
    '/initiate/loanRepayment/callback': loanRepaymentCallbackFunction,
    '/initiate/queryLoanLimit': queryLoanLimitFunction,
    '/initiate/queryLoanBalance': queryLoanBalanceFunction,

  }
};
