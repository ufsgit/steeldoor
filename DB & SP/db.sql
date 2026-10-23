-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: steeldoor_db_v1
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '209751e0-37b8-11f1-bfed-40c2ba987f8c:1-52762,
35f1f18e-371f-11f1-80d5-5cb47e3771c9:1-1565';

--
-- Table structure for table `areas`
--

DROP TABLE IF EXISTS `areas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `areas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `district_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_areas_district` (`district_id`),
  CONSTRAINT `fk_areas_district` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `areas`
--

LOCK TABLES `areas` WRITE;
/*!40000 ALTER TABLE `areas` DISABLE KEYS */;
INSERT INTO `areas` VALUES (1,1,'Edapally','682024','2026-10-20 11:56:10'),(2,1,'Kakkanad','682030','2026-10-20 11:56:10'),(3,1,'Aluva','683101','2026-10-20 11:56:10'),(4,1,'Palarivattom','682025','2026-10-20 11:56:10'),(5,1,'Fort Kochi','682001','2026-10-20 11:56:10'),(6,1,'Vyttila','682019','2026-10-20 11:56:10'),(7,1,'Kaloor','682017','2026-10-20 11:56:10'),(8,1,'Tripunithura','682301','2026-10-20 11:56:10'),(9,2,'Kowdiar','695003','2026-10-20 11:56:10'),(10,2,'Technopark','695581','2026-10-20 11:56:10'),(11,2,'Kazhakkoottam','695582','2026-10-20 11:56:10'),(12,2,'Pattom','695004','2026-10-20 11:56:10'),(13,2,'Vellayambalam','695010','2026-10-20 11:56:10'),(14,2,'Thampanoor','695001','2026-10-20 11:56:10'),(15,3,'Mavoor Road','673004','2026-10-20 11:56:10'),(16,3,'Palayam','673001','2026-10-20 11:56:10'),(17,3,'Mananchira','673001','2026-10-20 11:56:10'),(18,3,'Chevayur','673017','2026-10-20 11:56:10'),(19,3,'Medical College','673008','2026-10-20 11:56:10'),(20,4,'Round North','680001','2026-10-20 11:56:10'),(21,4,'Punkunnam','680002','2026-10-20 11:56:10'),(22,4,'Ayyanthole','680003','2026-10-20 11:56:10'),(23,4,'Ollur','680306','2026-10-20 11:56:10'),(24,4,'Chalakudy','680307','2026-10-20 11:56:10'),(25,5,'Thana','670012','2026-10-20 11:56:10'),(26,5,'Payyambalam','670001','2026-10-20 11:56:10'),(27,5,'South Bazar','670002','2026-10-20 11:56:10'),(28,5,'Talap','670002','2026-10-20 11:56:10'),(29,5,'Payyanur','670307','2026-10-20 11:56:10'),(30,1,'Kadavanthra','682020','2026-10-22 08:54:22'),(31,1,'Panampilly Nagar','682036','2026-10-22 08:54:22'),(32,1,'Marine Drive','682031','2026-10-22 08:54:22'),(33,1,'Ravipuram','682016','2026-10-22 08:54:22'),(34,1,'Thrikkakara','682021','2026-10-22 08:54:22'),(35,1,'Kalamassery','683104','2026-10-22 08:54:22'),(36,1,'Angamaly','683572','2026-10-22 08:54:22'),(37,1,'Perumbavoor','683542','2026-10-22 08:54:22'),(38,1,'Muvattupuzha','686661','2026-10-22 08:54:22'),(39,1,'Kothamangalam','686691','2026-10-22 08:54:22'),(40,1,'North Paravur','683513','2026-10-22 08:54:22'),(41,1,'Mattancherry','682002','2026-10-22 08:54:22'),(42,1,'Thevara','682013','2026-10-22 08:54:22'),(43,1,'Maradu','682304','2026-10-22 08:54:22'),(44,1,'Cherai','683514','2026-10-22 08:54:22'),(45,1,'Piravom','686664','2026-10-22 08:54:22'),(46,1,'Kolenchery','682311','2026-10-22 08:54:22');
/*!40000 ALTER TABLE `areas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `mobile` varchar(25) NOT NULL,
  `address` text NOT NULL,
  `notes` text,
  `status` varchar(50) NOT NULL DEFAULT 'NEW',
  `login_role_id` int DEFAULT NULL,
  `login_id` int DEFAULT NULL,
  `login_name` varchar(150) DEFAULT NULL,
  `state_id` int DEFAULT NULL,
  `state_name` varchar(100) DEFAULT NULL,
  `district_id` int DEFAULT NULL,
  `district_name` varchar(100) DEFAULT NULL,
  `area_id` int DEFAULT NULL,
  `area_name` varchar(100) DEFAULT NULL,
  `documents` json DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bookings_status` (`status`),
  KEY `idx_bookings_mobile` (`mobile`),
  KEY `idx_bookings_login_id` (`login_id`),
  KEY `idx_bookings_district_id` (`district_id`),
  KEY `idx_bookings_state_id` (`state_id`),
  KEY `idx_bookings_area_id` (`area_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'Anand Varma','+91 98470 11223','Flat 4B, SkyLine Apts, Palarivattom','Urgent fitting required','NEW',2,2,'Elena Vance',1,'Kerala',1,'Ernakulam Hub',4,'Palarivattom','[\"/uploads/site_plan.pdf\"]',1,'2026-10-21 07:14:20','2026-10-21 10:57:37'),(2,'Rahul Krishnan','+91 94471 22334','House 12, MG Road, Ernakulam','Double door fitting required','NEW',2,2,'Elena Vance',1,'Kerala',1,'Ernakulam Hub',1,'Edapally','[\"/uploads/site_plan.pdf\"]',0,'2026-10-21 10:38:24','2026-10-21 10:38:24'),(3,'Rahul Krishnan','+91 94471 22334','House 12, MG Road, Ernakulam','Double door fitting required','NEW',2,2,'Elena Vance',1,'Kerala',1,'Ernakulam Hub',1,'Edapally','[\"/uploads/site_plan.pdf\"]',0,'2026-10-22 05:22:47','2026-10-22 05:22:47'),(4,'Test Lead','9876543210','Kochi Road','Testing API','NEW',NULL,NULL,NULL,1,'Kerala',NULL,NULL,1,'Edapally','[]',0,'2026-10-22 06:39:47','2026-10-22 06:39:47'),(5,'Test','6897638','ALUVA','SRG','NEW',3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam Hub',3,'Aluva','[]',0,'2026-10-22 06:48:54','2026-10-22 06:48:54'),(6,'testing','79809878098','test','','NEW',3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam Hub',5,'Fort Kochi','[]',1,'2026-10-22 06:50:38','2026-10-22 08:48:27'),(7,'hlo chalakudy','789098970','44, Chalakudy, Ernakulam Hub, Kerala, Chalakudy, Ernakulam Hub, Kerala','hjj','NEW',3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam Hub',24,'Chalakudy','[]',0,'2026-10-22 07:06:10','2026-10-22 09:53:51'),(8,'gsd','7980978098','o','','NEW',3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam Hub',NULL,'','[]',1,'2026-10-22 08:48:53','2026-10-22 08:48:59'),(9,'googke','7980987098','oiuyoipj','','NEW',3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam',3,'Aluva','[\"/uploads/googleLogo.png\"]',0,'2026-10-22 10:20:43','2026-10-22 10:20:43'),(10,'doc test','7869879809','bn','mn','NEW',3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam',3,'Aluva','[\"/uploads/googleLogo.png\"]',0,'2026-10-22 11:03:29','2026-10-22 11:03:29'),(11,'doc test','78769870423','sad','aef','NEW',3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam',NULL,'','[\"/uploads/profile_icon.png\"]',0,'2026-10-22 11:54:33','2026-10-22 11:54:33'),(12,'awef','23452345','we','asef','NEW',3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam',NULL,'','[\"/uploads/schoolbus.png\"]',1,'2026-10-22 11:55:00','2026-10-22 11:57:22'),(13,'AWFDW','76868990','ADW','','NEW',3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam',36,'Angamaly','[\"/uploads/profile_.jpeg\"]',0,'2026-10-22 11:56:40','2026-10-22 11:56:40');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client_status_logs`
--

DROP TABLE IF EXISTS `client_status_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_status_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `client_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Scheduled','Completed','Cancelled') COLLATE utf8mb4_unicode_ci NOT NULL,
  `schedule_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_by_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_status_logs`
--

LOCK TABLES `client_status_logs` WRITE;
/*!40000 ALTER TABLE `client_status_logs` DISABLE KEYS */;
INSERT INTO `client_status_logs` VALUES (6,1,'Abhijith','Scheduled','2024-10-24','Fitting scheduled for tomorrow morning.',NULL,NULL,'2026-10-23 04:41:35','2026-10-23 04:41:35'),(7,3,'Arun','Cancelled',NULL,'Client requested cancellation.',NULL,NULL,'2026-10-23 04:42:35','2026-10-23 04:42:35');
/*!40000 ALTER TABLE `client_status_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `districts`
--

DROP TABLE IF EXISTS `districts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `districts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `state_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_districts_state` (`state_id`),
  CONSTRAINT `fk_districts_state` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `districts`
--

LOCK TABLES `districts` WRITE;
/*!40000 ALTER TABLE `districts` DISABLE KEYS */;
INSERT INTO `districts` VALUES (1,1,'Ernakulam','dist-ekm','2026-10-20 11:56:10'),(2,1,'Trivandrum','dist-tvm','2026-10-20 11:56:10'),(3,1,'Kozhikode','dist-clt','2026-10-20 11:56:10'),(4,1,'Thrissur','dist-tsr','2026-10-20 11:56:10'),(5,1,'Kannur','dist-knr','2026-10-20 11:56:10');
/*!40000 ALTER TABLE `districts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `states`
--

DROP TABLE IF EXISTS `states`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `states` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(10) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `states`
--

LOCK TABLES `states` WRITE;
/*!40000 ALTER TABLE `states` DISABLE KEYS */;
INSERT INTO `states` VALUES (1,'Kerala','KL','2026-10-20 11:56:10');
/*!40000 ALTER TABLE `states` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (3,'branch_head'),(1,'company'),(2,'coordinator'),(5,'customer'),(4,'dealer');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_types`
--

DROP TABLE IF EXISTS `user_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_types`
--

LOCK TABLES `user_types` WRITE;
/*!40000 ALTER TABLE `user_types` DISABLE KEYS */;
INSERT INTO `user_types` VALUES (1,'admin'),(2,'staff');
/*!40000 ALTER TABLE `user_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int DEFAULT NULL,
  `role` varchar(50) NOT NULL,
  `user_type_id` int DEFAULT NULL,
  `user_type` varchar(50) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(25) DEFAULT NULL,
  `state_id` int DEFAULT NULL,
  `state_name` varchar(100) DEFAULT NULL,
  `district_id` int DEFAULT NULL,
  `district_name` varchar(100) DEFAULT NULL,
  `address` text,
  `is_active` tinyint(1) DEFAULT '1',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `fk_users_district` (`district_id`),
  KEY `idx_users_username` (`username`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_user_type` (`user_type`),
  KEY `idx_users_state` (`state_id`),
  KEY `fk_users_user_type` (`user_type_id`),
  KEY `fk_users_role` (`role_id`),
  CONSTRAINT `fk_users_district` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `user_roles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_state` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_user_type` FOREIGN KEY (`user_type_id`) REFERENCES `user_types` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'company_admin','123',1,'company',1,'admin','SteelGuard Executive Board','corporate@steeldoor.com','+91 98000 11223',1,'Kerala',NULL,NULL,NULL,1,0,NULL,'2026-10-20 11:56:10','2026-10-22 04:37:14'),(2,'admin','123',2,'coordinator',1,'admin','Elena Vance (Operations Coordinator)','admin@steeldoor.com','+91 98000 11224',1,'Kerala',NULL,NULL,NULL,1,0,'2026-10-21 06:20:59','2026-10-20 11:56:11','2026-10-22 04:37:14'),(3,'coordinator','123',2,'coordinator',2,'staff','Alex George (Field Coordinator)','coordinator@steeldoor.com','+91 98000 11225',1,'Kerala',NULL,NULL,NULL,1,0,'2026-10-23 04:22:13','2026-10-20 11:56:11','2026-10-23 04:22:13'),(4,'branch_ekm','123',3,'branch_head',2,'staff','Rajesh Menon','rajesh.menon@steeldoor.com','+91 98470 12345',1,'Kerala',1,'Ernakulam Hub',NULL,1,0,'2026-10-23 04:55:08','2026-10-20 11:56:11','2026-10-23 04:55:08'),(5,'branch_tvm','123',3,'branch_head',2,'staff','Suresh Kumar','suresh.kumar@steeldoor.com','+91 94471 23456',1,'Kerala',2,'Trivandrum Hub',NULL,1,0,'2026-10-22 08:30:50','2026-10-20 11:56:11','2026-10-22 08:30:50'),(6,'branch_clt','123',3,'branch_head',2,'staff','Anas Kabeer','anas.kabeer@steeldoor.com','+91 97452 34567',1,'Kerala',3,'Kozhikode Hub',NULL,1,0,NULL,'2026-10-20 11:56:11','2026-10-22 04:37:14'),(7,'branch_tsr','123',3,'branch_head',2,'staff','Mohan Das','mohan.das@steeldoor.com','+91 98463 45678',1,'Kerala',4,'Thrissur Hub',NULL,1,0,NULL,'2026-10-20 11:56:11','2026-10-22 04:37:14'),(8,'branch_knr','123',3,'branch_head',2,'staff','K. V. Pavithran','pavithran.kv@steeldoor.com','+91 94954 56789',1,'Kerala',5,'Kannur Hub',NULL,1,0,NULL,'2026-10-20 11:56:11','2026-10-22 04:37:14'),(9,'user','123',5,'customer',NULL,NULL,'John Mathew','john.mathew@gmail.com','+91 94470 55443',1,'Kerala',NULL,NULL,'42 Orchid Residency, Stadium Link Rd, Kaloor',1,0,NULL,'2026-10-20 11:56:11','2026-10-22 04:37:14'),(10,'apex_dealer','123',4,'dealer',NULL,NULL,'Apex Doors Kochi','sales@apexdoors.com','+91 98952 33441',1,'Kerala',NULL,NULL,'Door No 8/120, Bypass Junction, Edapally',1,0,NULL,'2026-10-20 11:56:11','2026-10-22 04:37:14'),(11,'metro_builders','123',4,'dealer',NULL,NULL,'Metro Infra Ltd','contact@metroinfra.in','+91 98471 88990',1,'Kerala',NULL,NULL,'Plot 12, SmartCity Campus, Kakkanad',1,0,NULL,'2026-10-20 11:56:11','2026-10-22 04:37:14');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-23 10:35:57
