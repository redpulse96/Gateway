CREATE TABLE `originator_format_mapping` (
  `originator_format_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `external_refernce_id` varchar(255) DEFAULT NULL, -- REFERNCEID, REFID
  `transaction_id` varchar(255) DEFAULT NULL,
  `from_msisdn`  varchar(255) DEFAULT NULL,
  `refrence_msisdn`  varchar(255) DEFAULT NULL,
  `amount`  varchar(255) DEFAULT NULL,
  `company_name`  varchar(255) DEFAULT NULL,
  `company_code`  varchar(255) DEFAULT NULL, -- (Vendor codes)
  `payment_status`  varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `partner_code`  varchar(255) DEFAULT NULL, -- (MNO), (Banks) = TIGO
  `status` enum('active','inactive','deleted') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`originator_format_id`)
);

ALTER TABLE `originator_format_mapping` ADD COLUMN `payment_vendor_id` bigint(20) unsigned DEFAULT NULL AFTER `company_code`;
