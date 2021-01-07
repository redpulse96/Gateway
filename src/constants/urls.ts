import { ENV } from './interface-list';

const NODE_ENV = process.env.NODE_ENV;
const { DEV, PROD, TEST } = ENV;

export class Urls {
  static baseUrl: string;
  static UserRegistrationUrl: string;
  static ForgotPasswordUrl: string;
  static UserConfirmRegistrationUrl: string;
  static UserApprovalRegistrationUrl: string;
  constructor() {
    switch (NODE_ENV) {
      case PROD:
        Urls.baseUrl = 'http://localhost:8080';
        Urls.UserRegistrationUrl = 'https://pgportal.azampay.com/pages/authentication/resgiration/';
        Urls.ForgotPasswordUrl = 'http://localhost:4200/auth/reset-password/';
        Urls.UserConfirmRegistrationUrl = 'http://localhost:4200/auth/reset-password/';
        Urls.UserApprovalRegistrationUrl = 'http://localhost:4200/auth/reset-password/';
        break;

      case DEV:
        Urls.baseUrl = 'http://localhost:8080';
        Urls.UserRegistrationUrl = 'https://pgportal.azampay.com/pages/authentication/resgiration/';
        Urls.ForgotPasswordUrl = 'https://pgportal.azampay.com/auth/reset-password/';
        Urls.UserConfirmRegistrationUrl = 'https://pgportal.azampay.com/auth/reset-password/';
        Urls.UserApprovalRegistrationUrl = 'https://pgportal.azampay.com/auth/reset-password/';
        break;

      case TEST:
        Urls.baseUrl = 'http://localhost:8080';
        Urls.UserRegistrationUrl = 'https://pgportal.azampay.com/pages/authentication/resgiration';
        break;

      default:
        Urls.baseUrl = 'http://localhost:8080';
        Urls.UserRegistrationUrl = 'https://pgportal.azampay.com/pages/authentication/resgiration/';
        Urls.ForgotPasswordUrl = 'https://pgportal.azampay.com/auth/reset-password/';
        break;
    }
  }
}
