CREATE TABLE `notification_transactions` (
 `notification_transaction_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
 `source` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
 `destination` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
 `message` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
 `reference_id` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
 `status` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
 `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
 `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY (`notification_transaction_id`)
) ENGINE=InnoDB DEFAULT AUTO_INCREMENT=1 CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `notification_transactions` CHANGE `message` `message` text;
