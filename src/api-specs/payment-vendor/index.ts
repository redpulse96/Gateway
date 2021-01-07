import { validateGatewayRequest, attachVendorToPartner } from './api';
import { components } from './components';

export const paymentVendorDef = {
  components,
  'basePath': '/azam',
  'paths': {
    '/ValidateGateway': validateGatewayRequest,
    '/attachVendorToPartner': attachVendorToPartner
  }
};
