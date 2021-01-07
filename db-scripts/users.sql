CREATE TABLE `users` (
  `user_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `password` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `address` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `mobile_no` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `type` ENUM('internal', 'external') COLLATE utf8mb4_bin DEFAULT NULL,
  `country_code` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'deleted') COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT AUTO_INCREMENT=1 CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `users` ADD COLUMN `payment_vendor_id` bigint(20) unsigned DEFAULT NULL AFTER `mobile_number`;
ALTER TABLE `users` CHANGE `username` `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL;
ALTER TABLE `users` CHANGE `status` `status` ENUM('pending', 'active', 'inactive', 'deleted') COLLATE utf8mb4_bin DEFAULT NULL;
ALTER TABLE `users` CHANGE `mobile_no` `mobile_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL;

ALTER TABLE `users` ADD COLUMN `remarks` text NULL AFTER `country_code`;
ALTER TABLE `users` ADD COLUMN `username`  varchar(100) COLLATE utf8mb4_bin DEFAULT NULL AFTER `name`;
