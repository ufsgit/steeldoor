-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: steeldoor_db_v2
-- ------------------------------------------------------
-- Server version	8.0.45

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
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_district_area` (`district_id`,`name`),
  KEY `idx_areas_district` (`district_id`),
  CONSTRAINT `fk_areas_district` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `areas`
--

LOCK TABLES `areas` WRITE;
/*!40000 ALTER TABLE `areas` DISABLE KEYS */;
INSERT INTO `areas` VALUES (1,1,'Edapally','682024',0,'2026-10-20 11:56:10'),(2,1,'Kakkanad','682030',0,'2026-10-20 11:56:10'),(3,1,'Aluva','683101',0,'2026-10-20 11:56:10'),(4,1,'Palarivattom','682025',0,'2026-10-20 11:56:10'),(5,1,'Fort Kochi','682001',0,'2026-10-20 11:56:10'),(6,1,'Vyttila','682019',0,'2026-10-20 11:56:10'),(7,1,'Kaloor','682017',0,'2026-10-20 11:56:10'),(8,1,'Tripunithura','682301',0,'2026-10-20 11:56:10'),(9,2,'Kowdiar','695003',0,'2026-10-20 11:56:10'),(10,2,'Technopark','695581',0,'2026-10-20 11:56:10'),(11,2,'Kazhakkoottam','695582',0,'2026-10-20 11:56:10'),(12,2,'Pattom','695004',0,'2026-10-20 11:56:10'),(13,2,'Vellayambalam','695010',0,'2026-10-20 11:56:10'),(14,2,'Thampanoor','695001',0,'2026-10-20 11:56:10'),(15,3,'Mavoor Road','673004',0,'2026-10-20 11:56:10'),(16,3,'Palayam','673001',0,'2026-10-20 11:56:10'),(17,3,'Mananchira','673001',0,'2026-10-20 11:56:10'),(18,3,'Chevayur','673017',0,'2026-10-20 11:56:10'),(19,3,'Medical College','673008',0,'2026-10-20 11:56:10'),(20,4,'Round North','680001',0,'2026-10-20 11:56:10'),(21,4,'Punkunnam','680002',0,'2026-10-20 11:56:10'),(22,4,'Ayyanthole','680003',0,'2026-10-20 11:56:10'),(23,4,'Ollur','680306',0,'2026-10-20 11:56:10'),(24,4,'Chalakudy','680307',0,'2026-10-20 11:56:10'),(25,5,'Thana','670012',0,'2026-10-20 11:56:10'),(26,5,'Payyambalam','670001',0,'2026-10-20 11:56:10'),(27,5,'South Bazar','670002',0,'2026-10-20 11:56:10'),(28,5,'Talap','670002',0,'2026-10-20 11:56:10'),(29,5,'Payyanur','670307',0,'2026-10-20 11:56:10'),(30,1,'Kadavanthra','682020',0,'2026-10-22 08:54:22'),(31,1,'Panampilly Nagar','682036',0,'2026-10-22 08:54:22'),(32,1,'Marine Drive','682031',0,'2026-10-22 08:54:22'),(33,1,'Ravipuram','682016',0,'2026-10-22 08:54:22'),(34,1,'Thrikkakara','682021',0,'2026-10-22 08:54:22'),(35,1,'Kalamassery','683104',0,'2026-10-22 08:54:22'),(36,1,'Angamaly','683572',0,'2026-10-22 08:54:22'),(37,1,'Perumbavoor','683542',0,'2026-10-22 08:54:22'),(38,1,'Muvattupuzha','686661',0,'2026-10-22 08:54:22'),(39,1,'Kothamangalam','686691',0,'2026-10-22 08:54:22'),(40,1,'North Paravur','683513',0,'2026-10-22 08:54:22'),(41,1,'Mattancherry','682002',0,'2026-10-22 08:54:22'),(42,1,'Thevara','682013',0,'2026-10-22 08:54:22'),(43,1,'Maradu','682304',0,'2026-10-22 08:54:22'),(44,1,'Cherai','683514',0,'2026-10-22 08:54:22'),(45,1,'Piravom','686664',0,'2026-10-22 08:54:22'),(46,1,'Kolenchery','682311',0,'2026-10-22 08:54:22');
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
  `schedule_date` date DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_by_name` varchar(100) DEFAULT NULL,
  `login_role_id` int DEFAULT NULL,
  `login_id` int DEFAULT NULL,
  `login_name` varchar(150) DEFAULT NULL,
  `state_id` int DEFAULT NULL,
  `state_name` varchar(100) DEFAULT NULL,
  `district_id` int DEFAULT NULL,
  `district_name` varchar(100) DEFAULT NULL,
  `area_id` int DEFAULT NULL,
  `area_name` varchar(100) DEFAULT NULL,
  `branch_head_id` int DEFAULT NULL,
  `branch_head_name` varchar(150) DEFAULT NULL,
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
  KEY `idx_bookings_area_id` (`area_id`),
  KEY `idx_bookings_branch_head_id` (`branch_head_id`),
  KEY `idx_bookings_schedule_date` (`schedule_date`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'Arun','7980989098','Flat 302, Green Valley Apartments, Kakkanad, Kochi, Kerala – 682030','','NEW',NULL,NULL,NULL,2,3,'Alex George (Coordinator)',1,'Kerala',1,'Ernakulam',5,'Fort Kochi',4,'Rajesh Menon','[]',0,'2026-10-24 12:30:47','2026-10-24 12:30:47'),(2,'Arjun Menon','6980979809','14, Rose Garden Street, Edappally, Kochi, Kerala – 682024','','NEW',NULL,NULL,NULL,2,3,'Alex George (Coordinator)',1,'Kerala',1,'Ernakulam',1,'Edapally',4,'Rajesh Menon','[]',0,'2026-10-24 12:31:56','2026-10-24 12:31:56'),(3,'Akhil Das','6879809798','House 24, Rose Villa, Kazhakkoottam, TVM, Kerala – 695582','','NEW',NULL,NULL,NULL,3,5,'Suresh Kumar',1,'Kerala',2,'Trivandrum',11,'Kazhakkoottam',5,'Suresh Kumar','[\"/uploads/1792845206690-door.jpg\"]',0,'2026-10-24 12:33:30','2026-10-24 12:33:30'),(5,'Ananya Thomas','9087909809','Flat 302, Silver Heights, Pattom, TVM, Kerala – 695004','','NEW',NULL,NULL,NULL,3,5,'Suresh Kumar',1,'Kerala',2,'Trivandrum',12,'Pattom',5,'Suresh Kumar','[\"/uploads/1792845388188-door__1_.jpg\"]',0,'2026-10-24 12:36:30','2026-10-24 12:36:30'),(6,'Diya Mathew','8098909878','House 12, Green Valley Lane, West Hill, Kozhikode, Kerala – 673005','','NEW',NULL,NULL,NULL,3,6,'Anas Kabeer',1,'Kerala',3,'Kozhikode',19,'Medical College',6,'Anas Kabeer','[]',0,'2026-10-24 12:37:52','2026-10-24 12:37:52'),(7,'Rahul Nair','9089878908','Flat 204, Sunrise Residency, Mavoor Road, Kozhikode, Kerala – 673004','','NEW',NULL,NULL,NULL,3,6,'Anas Kabeer',1,'Kerala',3,'Kozhikode',18,'Chevayur',6,'Anas Kabeer','[\"/uploads/1792845533064-door_2_.jpg\"]',0,'2026-10-24 12:38:55','2026-10-24 12:38:55'),(8,'Arjun Menon','6879879809','House 18, Rose Garden Lane, Ayyanthole, Thrissur, Kerala – 680003','','NEW',NULL,NULL,NULL,3,7,'Mohan Das',1,'Kerala',4,'Thrissur',22,'Ayyanthole',7,'Mohan Das','[]',0,'2026-10-24 12:39:55','2026-10-24 12:39:55'),(9,'Druvan customer','8986086817','Druvan house','Notes By Druvan','NEW',NULL,NULL,NULL,5,NULL,'customer',1,'Kerala',1,'Ernakulam',38,'Muvattupuzha',4,'Rajesh Menon','[\"/uploads/1792845625918-shopping__2_.webp\", \"/uploads/1792845625919-shopping__1_.webp\"]',0,'2026-10-24 12:40:29','2026-10-24 12:40:29'),(10,'Meera Suresh','6879089098','Flat 302, Green Meadows Residency, Punkunnam, Thrissur, Kerala – 680002','','NEW',NULL,NULL,NULL,3,7,'Mohan Das',1,'Kerala',4,'Thrissur',21,'Punkunnam',7,'Mohan Das','[\"/uploads/1792845677326-door_3_.jpg\"]',0,'2026-10-24 12:41:19','2026-10-24 12:41:19'),(11,'Vivek','8776086807','Vivek House','Vivek Notes','NEW',NULL,NULL,NULL,4,10,'Apex Doors Kochi',1,'Kerala',5,'Kannur',27,'South Bazar',8,'K. V. Pavithran','[\"/uploads/1792845703196-shopping.webp\"]',0,'2026-10-24 12:41:44','2026-10-24 12:41:44'),(12,'Ridhul','98675367835','Ridhul Address','Ridhul Notes','NEW',NULL,NULL,NULL,4,10,'Apex Doors Kochi',1,'Kerala',4,'Thrissur',23,'Ollur',7,'Mohan Das','[\"/uploads/1792845763031-shopping__1_.webp\"]',0,'2026-10-24 12:42:44','2026-10-24 12:42:44'),(13,'Vishnu Raj','9089089098','House 14, Palm Grove Lane, Thana, , Kerala – 670012','','NEW',NULL,NULL,NULL,3,8,'K. V. Pavithran',1,'Kerala',5,'Kannur',26,'Payyambalam',8,'K. V. Pavithran','[]',0,'2026-10-24 12:43:14','2026-10-24 12:43:14'),(14,'Jeevan','56875235465','Jeevan Address','Jeevan Notes','NEW',NULL,NULL,NULL,4,11,'Metro Infra Ltd',1,'Kerala',2,'Trivandrum',9,'Kowdiar',5,'Suresh Kumar','[\"/uploads/1792845837004-shopping.webp\"]',0,'2026-10-24 12:43:58','2026-10-24 12:43:58'),(15,'Midhun','8965412357','Midhun Address','Midhun Notes','NEW',NULL,NULL,NULL,4,11,'Metro Infra Ltd',1,'Kerala',5,'Kannur',27,'South Bazar',8,'K. V. Pavithran','[\"/uploads/1792845897172-shopping.webp\"]',0,'2026-10-24 12:44:58','2026-10-24 12:44:58');
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
  `client_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Scheduled','Completed','Cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `schedule_date` date DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_by_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_status_logs`
--

LOCK TABLES `client_status_logs` WRITE;
/*!40000 ALTER TABLE `client_status_logs` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'company_admin','123',1,'company',1,'admin','SteelGuard Executive Board','corporate@steeldoor.com','+91 98000 11223',1,'Kerala',NULL,NULL,NULL,1,0,'2026-10-24 12:47:24','2026-10-20 11:56:10','2026-10-24 12:47:24'),(2,'admin','123',2,'coordinator',1,'admin','Elena Vance (Coordinator)','admin@steeldoor.com','+91 98000 11224',1,'Kerala',NULL,NULL,NULL,1,0,'2026-10-21 06:20:59','2026-10-20 11:56:11','2026-10-24 12:14:09'),(3,'coordinator','123',2,'coordinator',2,'staff','Alex George (Coordinator)','coordinator@steeldoor.com','+91 98000 11225',1,'Kerala',NULL,NULL,NULL,1,0,'2026-10-24 12:26:53','2026-10-20 11:56:11','2026-10-24 12:26:53'),(4,'branch_ekm','123',3,'branch_head',2,'staff','Rajesh Menon','rajesh.menon@steeldoor.com','+91 98470 12345',1,'Kerala',1,'Ernakulam Hub',NULL,1,0,'2026-10-24 12:36:42','2026-10-20 11:56:11','2026-10-24 12:36:42'),(5,'branch_tvm','123',3,'branch_head',2,'staff','Suresh Kumar','suresh.kumar@steeldoor.com','+91 94471 23456',1,'Kerala',2,'Trivandrum Hub',NULL,1,0,'2026-10-24 12:32:15','2026-10-20 11:56:11','2026-10-24 12:32:15'),(6,'branch_clt','123',3,'branch_head',2,'staff','Anas Kabeer','anas.kabeer@steeldoor.com','+91 97452 34567',1,'Kerala',3,'Kozhikode Hub',NULL,1,0,'2026-10-24 12:43:56','2026-10-20 11:56:11','2026-10-24 12:43:56'),(7,'branch_tsr','123',3,'branch_head',2,'staff','Mohan Das','mohan.das@steeldoor.com','+91 98463 45678',1,'Kerala',4,'Thrissur Hub',NULL,1,0,'2026-10-24 12:44:10','2026-10-20 11:56:11','2026-10-24 12:44:10'),(8,'branch_knr','123',3,'branch_head',2,'staff','K. V. Pavithran','pavithran.kv@steeldoor.com','+91 94954 56789',1,'Kerala',5,'Kannur Hub',NULL,1,0,'2026-10-24 12:44:33','2026-10-20 11:56:11','2026-10-24 12:44:33'),(10,'apex_dealer','123',4,'dealer',NULL,NULL,'Apex Doors Kochi','sales@apexdoors.com','+91 98952 33441',1,'Kerala',NULL,NULL,'Door No 8/120, Bypass Junction, Edapally',1,0,'2026-10-24 12:40:47','2026-10-20 11:56:11','2026-10-24 12:40:47'),(11,'metro_builders','123',4,'dealer',NULL,NULL,'Metro Infra Ltd','contact@metroinfra.in','+91 98471 88990',1,'Kerala',NULL,NULL,'Plot 12, SmartCity Campus, Kakkanad',1,0,'2026-10-24 12:43:10','2026-10-20 11:56:11','2026-10-24 12:43:10');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-24 18:20:38
