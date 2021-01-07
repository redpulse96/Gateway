export const INFOBIP = {
  URI: 'https://lzr9mr.api.infobip.com/sms/1/text/single',
  AUTH_TOKEN: 'App 56af2742aeb18da1b59361efcfc45554-5bcfc389-2b69-472d-a7dc-497fbfbc5876',
  METHOD: 'POST',
  CONTENT_TYPE: 'application/json',
  SUCCESSFUL: 'SUCCESSFUL',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
};

export namespace NotificationCodeMapping {
  export const USER_REGISTERATION: string = 'N_001';
  export const FORGOT_PASSWORD: string = 'N_002';
  export const USER_ACTIVATE: string = 'N_003';
  export const USER_DEACTIVATE: string = 'N_004';
  export const USER_APPROVAL: string = 'N_005';
}
