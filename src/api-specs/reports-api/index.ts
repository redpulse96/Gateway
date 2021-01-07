import { checkForOriginatorMatchMissing } from './api';
import { components } from './components';

export const reportApi = {
  components,
  'basePath': '/azam/reports',
  'paths': {
    '/approveRegistration': checkForOriginatorMatchMissing,
  }
};
