import { commonUssdPush, commonUssdPushForBank, validateGatewayRequest } from './api';
import { components } from './components';

export const commonApiDef = {
  components,
  basePath: '/azam',
  paths: {
    '/v1/token': validateGatewayRequest,
    '/v1/checkout': commonUssdPush,
    '/v1/bank/checkout': commonUssdPushForBank,
  },
};
