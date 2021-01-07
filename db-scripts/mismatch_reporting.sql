CREATE TABLE `mistmacth_reporting` (
  `mistmacth_reporting_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `external_refernce_id` text DEFAULT NULL, -- REFERNCEID, REFID {from:'525' , ihouse:'525' ismathc: true},
  `sender_msisdn`  text DEFAULT NULL,
  `reference_msisdn`  text DEFAULT NULL,
  `amount`  text DEFAULT NULL,
  `company_code`  varchar(255) DEFAULT NULL, -- (Vendor codes)
  `type` varchar(255) DEFAULT NULL,
  `is_matched`  text DEFAULT NULL,
  `reason`  text DEFAULT NULL, -- //(MNO), (Banks) = TIGO
  `payment_status`  text DEFAULT NULL
  `status` enum('active','inactive','deleted') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`mistmacth_reporting_id`)
);
