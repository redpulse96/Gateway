CREATE TABLE `payment_partner` (
 `payment_partner_id` bigint unsigned NOT NULL AUTO_INCREMENT,
 `partner_code` varchar(100) NOT NULL,
 `code_scheme` varchar(100) DEFAULT NULL, -- = md5(name+...)
 `name` varchar(50) NOT NULL,
 `description` varchar(100) DEFAULT NULL,
 `auth_scheme` varchar(500) DEFAULT NULL,
 `secret_code` varchar(500) NOT NULL,
 `collection_account_number` varchar(500) DEFAULT NULL,
 `collection_account_password` varchar(500) DEFAULT NULL,
 `service_type` varchar(500) COLLATE utf8mb4_bin,  -- 1 for USSD 2 for USSD Push
 `payment_vendor_id` bigint(20) unsigned DEFAULT NULL,
 `payment_intimation_route` varchar(50) DEFAULT NULL, -- 1
 `payment_acknowledgment_route` varchar(50) DEFAULT NULL, -- 1, 2
 `payment_initiation_route` varchar(50) DEFAULT NULL, -- 2
 `external_endpoint_specs` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
 `allowed_country_code` varchar(50) DEFAULT NULL, --  = ISOCODE2 comma separeted
 `status` varchar(10) NOT NULL,
 `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY (`payment_partner_id`)
) ENGINE=InnoDB DEFAULT AUTO_INCREMENT=1 CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE payment_partner ADD COLUMN `username` varchar(500) DEFAULT NULL AFTER `collection_account_number`;
ALTER TABLE payment_partner ADD COLUMN `password` varchar(500) DEFAULT NULL AFTER `username`;

INSERT INTO payment_partner (partner_code,code_scheme,name,description,auth_scheme,secret_code,collection_account_number,collection_account_password,service_type,payment_vendor_id,payment_intimation_route,payment_acknowledgment_route,payment_initiation_route,external_endpoint_specs,allowed_country_code,status) VALUES
('AirtelTransaction','sha256','AirtelTransaction','AirtelTransaction','testred','test123','780901008','testred','testred',1,'http://mq.azammedia.com/mqsapiws/Service.asmx','http://mq.azammedia.com/mqsapiws/Service.asmx','http://mq.azammedia.com/mqsapiws/Service.asmx','{"airtelTransactionsCallback": {"URL": "http://localhost:4000/airtelTransactionsCallback", "METHOD": "POST", "SOURCE": "CL_AZAM_PAY", "HEADERS": {}}, "airtelTransactionsUssdPush": {"URL": "http://localhost:4000/airtelTransactionsUssdPush", "METHOD": "POST", "SOURCE": "CL_AZAM_PAY", "HEADERS": {}}, "airtelTransactionUssdNormal": {"URL": "http://localhost:4000/airtelTransactionUssdNormal", "METHOD": "POST", "SOURCE": "CL_AZAM_PAY", "HEADERS": {}}}','TZ','active'),
('AirtelTransaction','sha256','AirtelTransaction','AirtelTransaction','testred','test123','780900310','testred','testred',1,'http://mq.azammedia.com/mqsapiws/Service.asmx','http://mq.azammedia.com/mqsapiws/Service.asmx','http://mq.azammedia.com/mqsapiws/Service.asmx','{"airtelTransactionsCallback": {"URL": "http://localhost:4000/airtelTransactionsCallback", "METHOD": "POST", "SOURCE": "CL_AZAM_PAY", "HEADERS": {}}, "airtelTransactionsUssdPush": {"URL": "http://localhost:4000/airtelTransactionsUssdPush", "METHOD": "POST", "SOURCE": "CL_AZAM_PAY", "HEADERS": {}}, "airtelTransactionUssdNormal": {"URL": "http://localhost:4000/airtelTransactionUssdNormal", "METHOD": "POST", "SOURCE": "CL_AZAM_PAY", "HEADERS": {}}}','TZ','active');

INSERT INTO payment_partner (`partner_code`, `code_scheme`, `name`, `description`, `auth_scheme`, `secret_code`, `collection_account_number`, `collection_account_password`, `service_type`, `payment_vendor_id`, `payment_intimation_route`, `payment_acknowledgment_route`, `payment_initiation_route`, `external_endpoint_specs`, `allowed_country_code`, `status`) VALUES
('AirtelTransactionPush', 'sha256', 'AirtelTransaction', 'AirtelTransaction', 'testred', 'testred', '780900310', 'AZAM', 'testred', 1, 'http://mq.azammedia.com/mqsapiws/Service.asmx', 'http://mq.azammedia.com/mqsapiws/Service.asmx', 'http://mq.azammedia.com/mqsapiws/Service.asmx', '{"airtelTransactionsCallback": {"URL": "http://localhost:4000/airtelTransactionsCallback", "METHOD": "POST", "SOURCE": "CL_AZAM_PAY", "HEADERS": {}}, "airtelTransactionsUssdPush": {"URL": "http://localhost:4000/airtelTransactionsUssdPush", "METHOD": "POST", "SOURCE": "CL_AZAM_PAY", "HEADERS": {}}, "airtelTransactionUssdNormal": {"URL": "http://localhost:4000/airtelTransactionUssdNormal", "METHOD": "POST", "SOURCE": "CL_AZAM_PAY", "HEADERS": {}}}', 'TZS', 'active');

INSERT INTO payment_partner (`partner_code`, `code_scheme`, `name`, `description`, `auth_scheme`, `secret_code`, `collection_account_number`, `collection_account_password`, `service_type`, `payment_vendor_id`, `payment_intimation_route`, `payment_acknowledgment_route`, `payment_initiation_route`, `external_endpoint_specs`, `allowed_country_code`, `status`) VALUES
('TigoTransaction', 'test', 'TigoTransaction', 'SAR', 'testred', 'testred', '25565144445', 'SARAFU_APP', 'testred', 1, 'http://mq.azammedia.com/mqsapiws/Service.asmx', 'http://mq.azammedia.com/mqsapiws/Service.asmx', 'http://mq.azammedia.com/mqsapiws/Service.asmx', NULL, 'TZS', 'active'),
('TigoTransactionAzam', 'test', 'TigoTransaction', 'AZM', 'testred', 'testred', '25565174441', 'SARAFU_APP', 'testred', 1, 'http://mq.azammedia.com/mqsapiws/Service.asmx', 'http://mq.azammedia.com/mqsapiws/Service.asmx', 'http://mq.azammedia.com/mqsapiws/Service.asmx', NULL, 'TZS', 'active');

INSERT INTO payment_partner (partner_code,code_scheme,name,description,auth_scheme,secret_code,collection_account_number,collection_account_password,service_type,payment_vendor_id,payment_intimation_route,payment_acknowledgment_route,payment_initiation_route,external_endpoint_specs,allowed_country_code,status) VALUES
('VodacomTransaction','sha256','VodacomTransaction','t#xJRCn4xGKe','vodacom','test123','273344','MDA3NWU5ZGM3MGRjMmNiNzkyYTEyMWE5YjA5N2IyMDRmODczZTY5MjdiMjlhZGFmZDk4NGI2OTllYzk1ZGZmNg==','testred',1,'http://mq.azammedia.com/mqsapiws/Service.asmx','http://mq.azammedia.com/mqsapiws/Service.asmx','http://mq.azammedia.com/mqsapiws/Service.asmx', NULL,'TZ','active');

INSERT INTO payment_partner (partner_code, username, password,code_scheme,name,description,auth_scheme,secret_code,collection_account_number,collection_account_password,service_type,payment_vendor_id,payment_intimation_route,payment_acknowledgment_route,payment_initiation_route,external_endpoint_specs,allowed_country_code,status) VALUES
('HalotelTransactionPush', 'azam', '123456aA@','sha256','HalotelTransaction','HalotelTransaction','halotel','test123','100007','174433','testred',1,'http://mq.azammedia.com/mqsapiws/Service.asmx','http://mq.azammedia.com/mqsapiws/Service.asmx','http://mq.azammedia.com/mqsapiws/Service.asmx', NULL,'TZ','active');

INSERT INTO payment_partner (partner_code, username, password,code_scheme,name,description,auth_scheme,secret_code,collection_account_number,collection_account_password,service_type,payment_vendor_id,payment_intimation_route,payment_acknowledgment_route,payment_initiation_route,external_endpoint_specs,allowed_country_code,status) VALUES
('ZANTEL-AZAMTV', 'azam', 'ZANTEL-AZAMTV','sha256','ZANTEL-AZAMTV','HalotelTransaction','halotel','test123','ZANTEL-AZAMTV','174433','testred',1,'http://mq.azammedia.com/mqsapiws/Service.asmx','http://mq.azammedia.com/mqsapiws/Service.asmx','http://mq.azammedia.com/mqsapiws/Service.asmx', NULL,'TZ','active');

INSERT INTO payment_partner (partner_code, username, password,code_scheme,name,description,auth_scheme,secret_code,collection_account_number,collection_account_password,service_type,payment_vendor_id,payment_intimation_route,payment_acknowledgment_route,payment_initiation_route,external_endpoint_specs,allowed_country_code,status) VALUES
('CrdbTransactions', null, null,'sha256','CrdbTransactions','CrdbTransactions','Crdb','test123','MI864691506416994','MI864691506416994','testred',1,'http://mq.azammedia.com/mqsapiws/Service.asmx','http://mq.azammedia.com/mqsapiws/Service.asmx','http://mq.azammedia.com/mqsapiws/Service.asmx', '{ "merchantVerification": { "OPERATION": "merchantVerification", "TOKEN": "20939579327f651f5ad08fd27393d385004c4ab78eb242c41f" }, "initiateTransaction": { "OPERATION": "initiateTransaction", "TOKEN": "20939579327f651f5ad08fd27393d385004c4ab78eb242c41f" } }','TZ','active');

INSERT INTO payment_partner (`partner_code`, `code_scheme`, `name`, `description`, `auth_scheme`, `secret_code`, `collection_account_number`, `collection_account_password`, `service_type`, `payment_vendor_id`, `payment_intimation_route`, `payment_acknowledgment_route`, `payment_initiation_route`, `external_endpoint_specs`, `allowed_country_code`, `status`) VALUES
('AirtelTransactionPushSarafu', 'sha256', 'AirtelTransaction', 'AirtelTransaction', 'testred', 'testred', '780900944', 'AZAM', 'testred', 1, 'http://mq.azammedia.com/mqsapiws/Service.asmx', 'http://mq.azammedia.com/mqsapiws/Service.asmx', 'http://mq.azammedia.com/mqsapiws/Service.asmx', '{"airtelTransactionsCallback": {"URL": "http://localhost:4000/airtelTransactionsCallback", "METHOD": "POST", "SOURCE": "CL_AZAM_PAY", "HEADERS": {}}, "airtelTransactionsUssdPush": {"URL": "http://localhost:4000/airtelTransactionsUssdPush", "METHOD": "POST", "SOURCE": "CL_AZAM_PAY", "HEADERS": {}}, "airtelTransactionUssdNormal": {"URL": "http://localhost:4000/airtelTransactionUssdNormal", "METHOD": "POST", "SOURCE": "CL_AZAM_PAY", "HEADERS": {}}}', 'TZS', 'active');

INSERT INTO payment_partner (partner_code, username, password,code_scheme,name,description,auth_scheme,secret_code,collection_account_number,collection_account_password,service_type,payment_vendor_id,payment_intimation_route,payment_acknowledgment_route,payment_initiation_route,external_endpoint_specs,allowed_country_code,status) VALUES
('PUSH-AZAMTVMAX', 'AZAMPAY', 'AZAMPAYTEST@2020','sha256','ZANTEL-AZAMTV-USSD-PUSH','ZantelTransaction','zantel','test123','25565174441','AZAMPAYTEST@2020','testred',1,'http://mq.azammedia.com/mqsapiws/Service.asmx','http://mq.azammedia.com/mqsapiws/Service.asmx','http://mq.azammedia.com/mqsapiws/Service.asmx', NULL,'TZ','active');

INSERT INTO payment_partner (partner_code, username, password,code_scheme,name,description,auth_scheme,secret_code,collection_account_number,collection_account_password,service_type,payment_vendor_id,payment_intimation_route,payment_acknowledgment_route,payment_initiation_route,external_endpoint_specs,allowed_country_code,status) VALUES
('SARAFU', 'AZAMPAY', 'AZAMPAYTEST@2020','sha256','ZANTEL-SARAFU-USSD-PUSH','ZantelTransaction','zantel','test123','SARAFU','AZAMPAYTEST@2020','testred',1,'http://mq.azammedia.com/mqsapiws/Service.asmx','http://mq.azammedia.com/mqsapiws/Service.asmx','http://mq.azammedia.com/mqsapiws/Service.asmx', NULL,'TZ','active');

INSERT INTO payment_partner (partner_code, username, password,code_scheme,name,description,auth_scheme,secret_code,collection_account_number,collection_account_password,service_type,payment_vendor_id,payment_intimation_route,payment_acknowledgment_route,payment_initiation_route,external_endpoint_specs,allowed_country_code,status) VALUES
('HalotelTransactionPushAzamMedia', 'azam', '123456aA@','sha256','HalotelTransaction','HalotelTransaction','halotel','test123','100007','174433','testred',2,'http://mq.azammedia.com/mqsapiws/Service.asmx','http://mq.azammedia.com/mqsapiws/Service.asmx','http://mq.azammedia.com/mqsapiws/Service.asmx', NULL,'TZ','active');

INSERT INTO `payment_partner`(`partner_code`, `code_scheme`, `name`, `description`, `auth_scheme`, `secret_code`, `collection_account_number`, `username`, `password`, `collection_account_password`, `service_type`, `payment_vendor_id`, `payment_intimation_route`, `payment_acknowledgment_route`, `payment_initiation_route`, `external_endpoint_specs`, `allowed_country_code`, `status`, `created_at`, `updated_at`) VALUES
('NmbTransaction', 'sha256', 'NmbTransaction', 'NmbTransaction', 'nmb', 'test123', 'AZAMMILL', 'AzamWSUserDEV', 'AzamWSPass123', 'AzamWSPass123', 'ussd-push', 1, 'http://mq.azammedia.com/mqsapiws/Service.asmx', 'http://mq.azammedia.com/mqsapiws/Service.asmx', 'http://mq.azammedia.com/mqsapiws/Service.asmx', NULL, 'TZ', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

<<---------------PRODUCTION---------------->>

HALOTEL:
INSERT INTO payment_partner (partner_code, username, password,code_scheme,name,description,auth_scheme,secret_code,collection_account_number,collection_account_password,service_type,payment_vendor_id,payment_intimation_route,payment_acknowledgment_route,payment_initiation_route,external_endpoint_specs,allowed_country_code,status) VALUES
('HalotelTransactionPush', 'azam', 'Azam@2019','sha256','HalotelTransaction','HalotelTransaction','halotel','HalotelTransactionSarafu','131839','174455_','HalotelTransactionSarafu',3,'http://3.120.252.221:4000/confirmPayment','http://3.120.252.221:4000/confirmPayment','http://3.120.252.221:4000/confirmPayment', NULL,'TZ','active');

TIGO:
INSERT INTO payment_partner (`partner_code`, `code_scheme`, `name`, `description`, `auth_scheme`, `secret_code`, `collection_account_number`, `collection_account_password`, `service_type`, `payment_vendor_id`, `payment_intimation_route`, `payment_acknowledgment_route`, `payment_initiation_route`, `external_endpoint_specs`, `allowed_country_code`, `status`) VALUES
('TigoTransactionSarafu', 'sha256', 'TigoTransaction', 'TigoTransaction', 'TigoTransaction', 'TigoTransaction', '25565144445', 'SARAFU_APP', 'TigoTransactionSarafu', 4, 'http://3.120.252.221:4000/confirmPayment', 'http://3.120.252.221:4000/confirmPayment', 'http://3.120.252.221:4000/confirmPayment', NULL, 'TZS', 'active');

AIRTEL:
INSERT INTO payment_partner (`partner_code`, `code_scheme`, `name`, `description`, `auth_scheme`, `secret_code`, `collection_account_number`, `collection_account_password`, `service_type`, `payment_vendor_id`, `payment_intimation_route`, `payment_acknowledgment_route`, `payment_initiation_route`, `external_endpoint_specs`, `allowed_country_code`, `status`) VALUES
('AirtelTransactionPushSarafu', 'sha256', 'AirtelTransaction', 'AirtelTransaction', 'AirtelTransaction', 'AirtelTransaction', '780900944', 'AZAM', 'AirtelTransaction', 5, 'http://3.120.252.221:4000/confirmPayment', 'http://3.120.252.221:4000/confirmPayment', 'http://3.120.252.221:4000/confirmPayment', '{"airtelTransactionsCallback": {"URL": "https://localhost:4000/airtelTransactionsCallback", "METHOD": "POST", "SOURCE": "CL_AZAM_PAY", "HEADERS": {}}, "airtelTransactionsUssdPush": {"URL": "http://localhost:4000/airtelTransactionsUssdPush", "METHOD": "POST", "SOURCE": "CL_AZAM_PAY", "HEADERS": {}}, "airtelTransactionUssdNormal": {"URL": "http://localhost:4000/airtelTransactionUssdNormal", "METHOD": "POST", "SOURCE": "CL_AZAM_PAY", "HEADERS": {}}}', 'TZS', 'active');

ZANTEL:
INSERT INTO `payment_partner` (`partner_code`, `code_scheme`, `name`, `description`, `auth_scheme`, `secret_code`, `collection_account_number`, `username`, `password`, `collection_account_password`, `service_type`, `payment_vendor_id`, `payment_intimation_route`, `payment_acknowledgment_route`, `payment_initiation_route`, `external_endpoint_specs`, `allowed_country_code`, `status`, `created_at`, `updated_at`)
VALUES
('ZANTEL-AZAMTV', 'sha256', 'ZANTEL-AZAMTV', 'ZantelTransaction', 'zantel', 'test123', 'ZANTEL-AZAMTV', 'AZAMPAY', 'AZAMPAY@2020', '174433', X'74657374726564', 6, 'http://mq.azammedia.com/mqsapiws/Service.asmx', 'http://mq.azammedia.com/mqsapiws/Service.asmx', 'http://mq.azammedia.com/mqsapiws/Service.asmx', NULL, 'TZS', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
