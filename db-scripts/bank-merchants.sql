CREATE TABLE `bank_merchants` (
  `bank_merchant_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `merchant_account_number` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `is_merchant_registered` tinyint(1) DEFAULT '0',
  `merchant_reference_id` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `source` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `status` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`bank_merchant_id`)
) ENGINE=InnoDB DEFAULT AUTO_INCREMENT=1 CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `bank_merchants` ADD COLUMN `mobile_number` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL AFTER `merchant_account_number`;
ALTER TABLE `bank_merchants` ADD COLUMN `external_merchant_reference_id` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL AFTER `merchant_reference_id`;
