CREATE TABLE `audit_logs` (
  `audit_log_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `mobile_number` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `path` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `method` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `operation` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `module_name` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `access_right_name` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `headers` text,
  `body` text,
  `response` text,
  `status` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_log_id`)
);

ALTER TABLE `audit_logs` ADD COLUMN `action` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL AFTER `path`;
