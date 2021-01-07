CREATE TABLE `question_answers` (
  `question_answer_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `question_code` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `question` text,
  `answer_code` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `answer`text,
  `status` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`question_answer_id`)
) ENGINE=InnoDB DEFAULT AUTO_INCREMENT=1 CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
