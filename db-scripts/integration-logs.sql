CREATE TABLE `integration_logs` (
  `integration_log_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `api_hash` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `payment_partner_id` bigint unsigned DEFAULT NULL,
  `payment_vendor_id` bigint unsigned DEFAULT NULL,
  `vendor_type_id` bigint unsigned DEFAULT NULL,
  `service_type` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `redirect_from` varchar(100) DEFAULT NULL,
  `headers` text,
  `body` text,
  `response` text,
  `response_code`  varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `status` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`integration_log_id`),
  KEY `integration_logs_vt_id` (`vendor_type_id`),
  CONSTRAINT `integration_logs_FK` FOREIGN KEY (`vendor_type_id`) REFERENCES `vendor_type` (`vendor_type_id`),
  KEY `integration_logs_pv_id` (`payment_vendor_id`),
  CONSTRAINT `integration_logs_pv_id` FOREIGN KEY (`payment_vendor_id`) REFERENCES `payment_vendor` (`payment_vendor_id`),
  KEY `integration_logs_pp_id` (`payment_partner_id`),
  CONSTRAINT `integration_logs_pp_id` FOREIGN KEY (`payment_partner_id`) REFERENCES `payment_partner` (`payment_partner_id`)
) ENGINE=InnoDB DEFAULT AUTO_INCREMENT=1 CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;