CREATE TABLE `roles` (
  `role_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `role_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `description` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `status` enum('active','inactive','deleted') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT AUTO_INCREMENT=1 CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `roles` ADD COLUMN `role_type` enum('normal','superadmin', 'vendor-superadmin') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL AFTER `role_code`;
ALTER TABLE `roles` ADD COLUMN `supervisor_role_id` bigint(20) unsigned DEFAULT NULL AFTER `description`;
ALTER TABLE `roles` ADD CONSTRAINT `roles_FK` FOREIGN KEY (`supervisor_role_id`) REFERENCES `roles` (`role_id`)

INSERT INTO roles (role_code, name, role_type, description, supervisor_role_id, status, created_at, updated_at) VALUES
('SUPERADMIN', 'SUPERADMIN', 'superadmin', 'superadmin', NULL, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO roles (role_code,name,role_type,description,supervisor_role_id,status,created_at,updated_at) VALUES
('SARAFU','Sarafu test role', 'normal','this is a test role',NULL,'active',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
