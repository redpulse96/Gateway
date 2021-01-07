CREATE TABLE `payment_vendor` (
  `payment_vendor_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `vendor_code` varchar(100) NOT NULL,
  `code_scheme` varchar(100) NOT NULL,
  `secret_code` varchar(100) NOT NULL,
  `vendor_type_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `service_type` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `incoming_request_type` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `vendor_processing_route` varchar(50) DEFAULT NULL,
  `allowed_country_code` varchar(50) DEFAULT NULL,
  `status` varchar(10) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_vendor_id`),
  KEY `payment_vendor_FK` (`vendor_type_id`),
  CONSTRAINT `payment_vendor_FK` FOREIGN KEY (`vendor_type_id`) REFERENCES `vendor_type` (`vendor_type_id`)
) ENGINE=InnoDB DEFAULT AUTO_INCREMENT=1 CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE payment_vendor ADD `pay_mq` tinyint(4) not null DEFAULT '0' AFTER `description`;

ALTER TABLE payment_vendor ADD COLUMN `username` varchar(500) DEFAULT NULL AFTER `description`;
ALTER TABLE payment_vendor ADD COLUMN `password` varchar(500) DEFAULT NULL AFTER `username`;
ALTER TABLE payment_vendor ADD COLUMN `vendor_intimation_route` varchar(50) DEFAULT NULL AFTER `vendor_processing_route`;

ALTER TABLE payment_vendor ADD COLUMN `business_tin` varchar(50) DEFAULT NULL AFTER `vendor_intimation_route`;
ALTER TABLE payment_vendor ADD COLUMN `average_customer` varchar(50) DEFAULT NULL AFTER `business_tin`;
ALTER TABLE payment_vendor ADD COLUMN `tax_certificate_url` varchar(50) DEFAULT NULL AFTER `average_customer`;
ALTER TABLE payment_vendor CHANGE `allowed_country_code` `country_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL;

INSERT INTO payment_vendor ( vendor_code, code_scheme, secret_code, vendor_type_id, name, description, service_type, vendor_processing_route, allowed_country_code, status, created_at, updated_at) VALUES
('SARAFU', 'test', 'test', 1, 'test', 'test', 'test', 'PAY_TO_SARAFU', 'TZS', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO payment_vendor ( vendor_code, code_scheme, secret_code, vendor_type_id, name, description, service_type, vendor_processing_route, allowed_country_code, status, created_at, updated_at) VALUES
('AZAM_MEDIA', 'test', 'test', 1, 'test', 'test', 'test', 'PAY_TO_AZAM_MEDIA', 'TZS', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

<<----------------PRODUCTION--------------->>

HALOTEL:
INSERT INTO payment_vendor ( vendor_code, code_scheme, secret_code, vendor_type_id, name, description, service_type, vendor_processing_route, allowed_country_code, status, created_at, updated_at) VALUES
('SARAFU', 'SARAFU', 'SARAFU', 1, 'SARAFU', 'SARAFU', 'SARAFU', 'https://172.18.5.7:4000/confirmPayment', 'TZS', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

TIGO:
INSERT INTO payment_vendor ( vendor_code, code_scheme, secret_code, vendor_type_id, name, description, service_type, vendor_processing_route, allowed_country_code, status, created_at, updated_at) VALUES
('SARAFU_TIGO', 'SARAFU_TIGO', 'SARAFU_TIGO', 3, 'SARAFU_TIGO', 'SARAFU_TIGO', 'ASA', 'https://172.18.5.7:4000/confirmPayment', 'TZS', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

AIRTEL:
INSERT INTO payment_vendor ( vendor_code, code_scheme, secret_code, vendor_type_id, name, description, service_type, vendor_processing_route, allowed_country_code, status, created_at, updated_at) VALUES
('SARAFU_AIRTEL', 'SARAFU_AIRTEL', 'SARAFU_AIRTEL', 3, 'SARAFU', 'SARAFU', 'SARAFU_AIRTEL', 'https://172.18.5.7:4000/confirmPayment', 'TZS', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

AZAM-TV:
INSERT INTO payment_vendor ( vendor_code, code_scheme, secret_code, vendor_type_id, name, description, service_type, vendor_processing_route, vendor_intimation_route, allowed_country_code, status, created_at, updated_at) VALUES
('AZAM_TV', 'AZAM_TV', 'AZAM_TV', 1, 'AZAM_TV', 'AZAM_TV', 'AZAM_TV', 'http://mq.azammedia.com/mqsapiws/Service.asmx', 'http://mq.azammedia.com/mqsapiws/Service.asmx', 'TZS', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
