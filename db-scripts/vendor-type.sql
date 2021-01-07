CREATE TABLE `vendor_type` (
 `vendor_type_id` bigint unsigned NOT NULL AUTO_INCREMENT,
 `vendor_type_code` varchar(100) NOT NULL,
 `vendor_type` varchar(100) NOT NULL,
 `name` varchar(50) NOT NULL,
 `description` varchar(100) NOT NULL,
 `status` varchar(10) NOT NULL,
 `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY (`vendor_type_id`)
) ENGINE=InnoDB DEFAULT AUTO_INCREMENT=1 CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO vendor_type (vendor_type_code, vendor_type, name, description, status) VALUES
('USSD_NORMAL', 'USSD-NORMAL', 'USSD_NORMAL', 'ONLY USSD', 'active'),
('USSD_PUSH', 'USSD-PUSH', 'USSD_PUSH', 'ONLY USSD PUSH', 'active'),
('USSD_NORMAL, USSD_PUSH', 'USSD-NORMAL-PUSH', 'USSD_NORMAL_PUSH', 'BOTH USSD PUSH AND NORMAL', 'active');
