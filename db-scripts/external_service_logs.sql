CREATE TABLE `external_service_logs` (
  `external_service_log_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `path` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `request_headers` text,
  `request_body` text,
  `response_code` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `response` text,
  `status` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`external_service_log_id`)
) ENGINE=InnoDB DEFAULT AUTO_INCREMENT=1 CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
