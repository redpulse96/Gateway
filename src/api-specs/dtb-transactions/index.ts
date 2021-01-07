import {validateAccountDetails, validateAuthCodeFunction} from './api';
import {components} from './components';

export const dtbDef = {
  components,
  'basePath': '/DtbTransaction',
  'paths': {
    '/validateAccount': validateAccountDetails,
    '/validateAuthCode': validateAuthCodeFunction,
  }
};
