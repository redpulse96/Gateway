import { createReport, fetchMismatchReports, fetchOriginatorMapping } from './api';
import { components } from './components';

export const mismatchReportingDef = {
  components,
  'basePath': '/azam/users',
  'paths': {
    '/createreport': createReport,
    '/fetchmismatchreports': fetchMismatchReports,
    '/fetchoriginatormapping': fetchOriginatorMapping
  }
};
