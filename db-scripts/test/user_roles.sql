CREATE TABLE `user_roles` (
  `user_role_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `role_id` bigint(20) unsigned NOT NULL,
  `status` ENUM('active', 'inactive', 'deleted') COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_role_id`)
) ENGINE=InnoDB DEFAULT AUTO_INCREMENT=1 CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `user_roles` CHANGE COLUMN `status` `status` ENUM('pending', 'active', 'inactive', 'deleted') COLLATE utf8mb4_bin DEFAULT NULL;

INSERT INTO user_roles (user_id,role_id,status,created_at,updated_at) VALUES
(1,2,'active',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
(3,1,'active',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
