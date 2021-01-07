export namespace ResponseMappings {
  export const INVALID_CREDENTIALS: string = 'Invalid_credentials';
  export const UNIQUE_USERNAME: string = 'unique_username';
  export const USER_REGISTERED: string = 'user_registered';
  export const USER_LOGGED_IN: string = 'user_logged_in';
  export const SUCCESS: string = 'success';
  export const FAILURE: string = 'failure';
  export const SUCCESSFUL_FETCH: string = 'successful_fetch';
  export const UPDATE_SUCCESS: string = 'update_success';
  export const BAD_REQUEST: string = 'bad_request';
  export const SOMETHING_WENT_WRONG: string =
    'Something went wrong while calling KCB. Please try again later';
  export const MISSING_REQUIRED_PARAM = 'Missing one or more than one required parameter';
  export const INVALID_VENDOR: string = 'invalid_vendor';
  export const SERVICE_UNAVAILABLE: string = 'service_unavailable';
  export const INTERNAL_SERVICE_UNAVAILABLE: string = 'internal_service_unavailable';
  export const AIRTEL_CALLBACK_ERROR: string = 'airtel_callback_error';
  export const HALOTEL_TRANSACTION_FAIL: string = 'halotel_transaction_fail';
  export const TOKEN_GENERATION_SUCCESS: string = 'token_generation_success';
  export const TOKEN_GENERATION_FAIL: string = 'token_generation_fail';
  export const INVALID_TOKEN: string = 'invalid_token';
  export const TRANSACTION_INITIATION_FAIL: string = 'transaction_initiation_fail';
  export const ZANTEL_TRANSACTION_FAIL: string = 'zantel_transaction_fail';
  export const INVALID_PARTNER_RESPONSE: string = 'invalid_partner_response';
  export const INVALID_PARTNER: string = 'invalid_partner';
  export const CRDB_TRANSACTION_VALIDATION_FAIL: string = 'crdb_transaction_validation_fail';
  export const CRDB_TRANSACTION_INITIATION_FAIL: string = 'crdb_transaction_initiation_fail';
  export const USER_LOGGED_OUT: string = 'user_logged_out';
  export const UNAUTHORIZED_ACTION: string = 'unauthoried_action';
  export const USERS_REGISTRATION_COMPLETED: string = 'users_registration_completed';
  export const EMPTY_RESPONSE: string = 'empty_response';
  export const INSTANCE_CREATION_SUCCESS: string = 'successful_instance_creation';
  export const INVALID_FILE: string = 'Invalid CSV file. Expected parameters ${replace} not found';
}
