import { authorizeMerchant, deRegisterMerchantDetails, initiateTransactionDetails, queryAccountDetails, registerMerchantDetails } from './api';
import { components } from './components';

export const nmbDef = {
  components,
  'basePath': '/azam/nmb',
  'paths': {
    '/queryaccount': queryAccountDetails,
    '/registermerchant': registerMerchantDetails,
    '/deregisterMerchant': deRegisterMerchantDetails,
    '/initiatetransaction': initiateTransactionDetails,
    '/authorizemerchant': authorizeMerchant
  }
};
