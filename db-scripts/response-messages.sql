CREATE TABLE `response_messages` (
  `response_message_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `message_code` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `success` boolean,
  `message` text,
  `status_code` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `response_code` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `response_data` text,
  `status` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`response_message_id`)
) ENGINE=InnoDB DEFAULT AUTO_INCREMENT=1 CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO response_messages (`message_code`, `success`, `message`, `status_code`, `response_code`, `response_data`, `status`, `created_at`, `updated_at`) VALUES
  ('success', 1, 'This is a successfull transaction', '200', '200', '{ "ReferenceID": "" }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('user_registered', 1, 'User successfully registered', '200', '200', '{  }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('user_logged_in', 1, 'User successfully logged in', '200', '200', '{ "Authorization": "" }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('update_success', 1, 'This transaction is updated successfull', '200', '200', '{ "ReferenceID": "" }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('failure', 0, 'Internal server error', '500', '201', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Invalid_credentials', 0, 'Invalid credentials provided', '500', '201', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('bad_request', 0, 'Invalid request', '400', '202', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('successful_fetch', 1, 'Transaction details fetched successfully', '200', '200', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('service_unavailable', 0, 'The current service is unavailable', '503', '203', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('internal_service_unavailable', 0, 'The service is temporarily unavailable, please try again after some time', '503', '204', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('airtel_callback_error', 0, 'The service is currently unreachable, please try again after some time', '503', '205', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('halotel_transaction_fail', 0, 'The service is currently unreachable, please try again after some time', '503', '301', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('token_generation_success', 1, 'token generated successfully', '200', '100', '{ "AccessToken": "", "TokenType": "", "ExpiresIn": "" }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('token_generation_fail', 0, 'The token could not be generated', '503', '101', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('invalid_token', 0, 'The token provided is invalid, please provide a valid token', '400', '203', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('token_generation_timeout', 0, 'The token generation was taking too long, please try again after some time', '503', '102', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('transaction_initiation_fail', 0, 'The transaction could not be initiated, please try again after some time', '503', '103', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('zantel_transaction_fail', 0, 'The transaction could not be initiated, please try again after some time', '503', '601', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('invalid_partner_response', 0, 'Internal server error, please try again after some time', '503', '1001', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('invalid_partner', 0, 'Invalid partner, please enter valid details', '503', '203', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('invalid_vendor', 0, 'Invalid vendor, please enter valid details', '503', '203', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('crdb_transaction_initiation_fail', 0, 'The transaction could not be initiated, please try again after some time', '503', '701', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('crdb_transaction_validation_fail', 0, 'Invalid merchant details, please prceed by providing valid merchant details', '503', '702', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('user_logged_out', 1, 'User successfully logged out', '200', '200', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('unauthoried_action', 1, 'You are unauthoried to perform this action', '401', '203', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('unique_username', 1, 'The username already exists,\nKindly use a different username', '400', '203', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('users_registration_completed', 1, 'The Users registration has been completed', '200', '200', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('empty_response', 1, 'No desired records found', '200', '200', '{ }', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


INSERT INTO response_messages (`message_code`, `success`, `message`, `status_code`, `response_code`, `response_data`, `status`, `created_at`, `updated_at`) VALUES
  ('successful_instance_creation', 1, 'Instance created successfully', '200', '200', NULL, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
