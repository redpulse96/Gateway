CREATE TABLE `notification_services` (
 `notification_service_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
 `notification_code` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
 `subject` text,
 `message` text,
 `status` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
 `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
 `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY (`notification_service_id`)
) ENGINE=InnoDB DEFAULT AUTO_INCREMENT=1 CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO notification_services (notification_code, subject, message, status, created_at, updated_at) VALUES
('N_001', 'Azam User Registration', '`<p>The user has been registered successfully,<br/>Kinldy click on the below link to complete the registration process<br/> <a href="${options.URL}"><em>${options.URL}</em></a></p>`', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO notification_services (notification_code, subject, message, status, created_at, updated_at) VALUES
('N_002', 'Azam Forgot User', '`<p>The password recovery procedure has been initiated successsfully,<br/>Kinldy click on the below link to reset your password<br/> <a href="${options.URL}"><em>${options.URL}</em></a></p>`', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO notification_services (notification_code, subject, message, status, created_at, updated_at) VALUES
('N_003', 'Azam User Activation', '`<p>Dear User,<br/>Kindly note that your user is active and can continue operating</p>`', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('N_004', 'Azam User Deactivation', '`<p>Dear User,<br/>Kinldy note that your user has been deactivated,<br/> You may contact the customer support for further queries</p>`', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
