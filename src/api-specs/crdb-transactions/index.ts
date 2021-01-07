import { initiateTransactionDetails, merchantVerificationDetails } from './api';
import { components } from './components';

export const crdbDef = {
  components,
  'basePath': '/azam/crdb',
  'paths': {
    '/verifymerchant': merchantVerificationDetails,
    '/initiatetransaction': initiateTransactionDetails
  }
};
