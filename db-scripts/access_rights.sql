CREATE TABLE `access_rights` (
  `access_right_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `access_right_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `description` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `status` enum('active','inactive','deleted') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`access_right_id`)
) ENGINE=InnoDB DEFAULT AUTO_INCREMENT=1 CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `access_rights` add column `type` enum('users','transactions','superadmin', 'roles') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL AFTER `access_right_code`;

INSERT INTO access_rights (access_right_code, name, type, description, status, created_at, updated_at) VALUES
('SAR_001', 'CREATE-USER', 'users', 'this is a test role CREATE-USER', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('SAR_002', 'VIEW-USER', 'users', 'this is a test role VIEW-USER', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('SAR_003', 'DELETE-USER', 'users', 'this is a test role DELETE-USER', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('SAR_004', 'UPDATE-USER', 'users', 'this is a test role UPDATE-USER', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO access_rights (access_right_code, name, type, description, status, created_at, updated_at) VALUES
('R_GEN_USER_001', 'CREATE-GENERAL-USER', 'transactions', 'this is a test role CREATE-USER', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('R_GEN_USER_002', 'FETCH-USERS-BY-STATUS', 'transactions', 'this is a test role VIEW-USER', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('R_AIRTEL_GET_MULTIPLE', 'FETCH-AIRTEL-TRANSACTIONS-BY-FILTER', 'transactions', 'this is a test role DELETE-USER', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('R_HALOTEL_GET_MULTIPLE', 'FETCH-HALOTEL-TRANSACTIONS-BY-FILTER', 'transactions', 'this is a test role UPDATE-USER', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('R_TIGO_GET_MULTIPLE', 'FETCH-TIGO-TRANSACTIONS-BY-FILTER', 'transactions', 'this is a test role CREATE-USER', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('R_VODACOM_GET_MULTIPLE', 'FETCH-VODACOM-TRANSACTIONS-BY-FILTER', 'transactions', 'this is a test role VIEW-USER', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('R_ZANTEL_GET_MULTIPLE', 'FETCH-ZANTEL-TRANSACTIONS-BY-FILTER', 'transactions', 'this is a test role DELETE-USER', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('R_GEN_INCOMING_REQUEST_001', 'FETCH-INCOMING-TRANSACTIONS', 'transactions', 'this is a test role UPDATE-USER', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
