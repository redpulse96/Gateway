CREATE TABLE `role_access_rights_mapping` (
  `role_access_rights_mapping_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `role_id` bigint(20) unsigned NOT NULL,
  `access_right_id` bigint(20) unsigned NOT NULL,
  `status` enum('active','inactive','deleted') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_access_rights_mapping_id`),
  KEY `role_access_rights_mapping_FK` (`role_id`),
  KEY `role_access_rights_mapping_FK_1` (`access_right_id`),
  CONSTRAINT `role_access_rights_mapping_FK` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`),
  CONSTRAINT `role_access_rights_mapping_FK_1` FOREIGN KEY (`access_right_id`) REFERENCES `access_rights` (`access_right_id`)
) ENGINE=InnoDB DEFAULT AUTO_INCREMENT=1 CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO role_access_rights_mapping (role_id, access_right_id, status, created_at, updated_at) VALUES
(2, 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 3, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 4, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO role_access_rights_mapping (role_id, access_right_id, status, created_at, updated_at) VALUES
(2, 5, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 6, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 7, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 8, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 9, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 10, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 11, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 12, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
