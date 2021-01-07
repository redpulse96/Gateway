CREATE TABLE `mistmacth_reporting` (
  `mistmacth_reporting_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `refernce_id_match` text DEFAULT NULL, -- REFERNCEID, REFID {from:'525' , ihouse:'525' ismathc: true},
  `transaction_id_match` text DEFAULT NULL,
  `from_msisdn_match`  text DEFAULT NULL,
  `refrence_msisdn_macth`  text DEFAULT NULL,
  `amount_match`  text DEFAULT NULL,
  `company_name_match`  text DEFAULT NULL,
  `company_code_match`  text DEFAULT NULL, -- (Vendor codes)
  `payment_status_match`  text DEFAULT NULL,
  `type_match`  text DEFAULT NULL,
  `partner_code_match`  text DEFAULT NULL, -- //(MNO), (Banks) = TIGO
  `additional_info` text, -- [{from: '2323423' inhouse: null keyId: DESTBALANCE, isAvailable: false }]
  `status` enum('active','inactive','deleted') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`mistmacth_reporting_id`)
);
