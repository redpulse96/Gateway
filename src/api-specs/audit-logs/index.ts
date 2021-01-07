import { fetchAuditLogs } from './api';
import { components } from './components';

export const auditLogDef: any = {
  components,
  'basePath': '/azam/auditlogs',
  'paths': {
    '/fetchlogs': fetchAuditLogs
  }
};
