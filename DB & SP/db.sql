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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '209751e0-37b8-11f1-bfed-40c2ba987f8c:1-52561,
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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `areas`
--

LOCK TABLES `areas` WRITE;
/*!40000 ALTER TABLE `areas` DISABLE KEYS */;
INSERT INTO `areas` VALUES (1,1,'Edapally','682024','2026-10-20 11:56:10'),(2,1,'Kakkanad','682030','2026-10-20 11:56:10'),(3,1,'Aluva','683101','2026-10-20 11:56:10'),(4,1,'Palarivattom','682025','2026-10-20 11:56:10'),(5,1,'Fort Kochi','682001','2026-10-20 11:56:10'),(6,1,'Vyttila','682019','2026-10-20 11:56:10'),(7,1,'Kaloor','682017','2026-10-20 11:56:10'),(8,1,'Tripunithura','682301','2026-10-20 11:56:10'),(9,2,'Kowdiar','695003','2026-10-20 11:56:10'),(10,2,'Technopark','695581','2026-10-20 11:56:10'),(11,2,'Kazhakkoottam','695582','2026-10-20 11:56:10'),(12,2,'Pattom','695004','2026-10-20 11:56:10'),(13,2,'Vellayambalam','695010','2026-10-20 11:56:10'),(14,2,'Thampanoor','695001','2026-10-20 11:56:10'),(15,3,'Mavoor Road','673004','2026-10-20 11:56:10'),(16,3,'Palayam','673001','2026-10-20 11:56:10'),(17,3,'Mananchira','673001','2026-10-20 11:56:10'),(18,3,'Chevayur','673017','2026-10-20 11:56:10'),(19,3,'Medical College','673008','2026-10-20 11:56:10'),(20,4,'Round North','680001','2026-10-20 11:56:10'),(21,4,'Punkunnam','680002','2026-10-20 11:56:10'),(22,4,'Ayyanthole','680003','2026-10-20 11:56:10'),(23,4,'Ollur','680306','2026-10-20 11:56:10'),(24,4,'Chalakudy','680307','2026-10-20 11:56:10'),(25,5,'Thana','670012','2026-10-20 11:56:10'),(26,5,'Payyambalam','670001','2026-10-20 11:56:10'),(27,5,'South Bazar','670002','2026-10-20 11:56:10'),(28,5,'Talap','670002','2026-10-20 11:56:10'),(29,5,'Payyanur','670307','2026-10-20 11:56:10');
/*!40000 ALTER TABLE `areas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `branch_code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `state_id` int NOT NULL,
  `district_id` int NOT NULL,
  `address` text,
  `phone` varchar(25) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `branch_code` (`branch_code`),
  KEY `idx_branches_state` (`state_id`),
  KEY `idx_branches_district` (`district_id`),
  CONSTRAINT `fk_branches_district` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_branches_state` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` VALUES (1,'BH-EKM','Ernakulam Regional Hub',1,1,'Metro Pillar 420, Civil Line Rd, Palarivattom, Kochi','+91 98470 12345','ekm.hub@steeldoor.com',1,'2026-10-20 11:56:10'),(2,'BH-TVM','Trivandrum Regional Hub',1,2,'Opp. Technopark Main Gate, Kazhakkoottam, Thiruvananthapuram','+91 94471 23456','tvm.hub@steeldoor.com',1,'2026-10-20 11:56:10'),(3,'BH-CLT','Kozhikode Regional Hub',1,3,'Near Arayidathupalam Junction, Mavoor Rd, Kozhikode','+91 97452 34567','clt.hub@steeldoor.com',1,'2026-10-20 11:56:10'),(4,'BH-TSR','Thrissur Regional Hub',1,4,'City Centre Complex, Round West, Thrissur','+91 98463 45678','tsr.hub@steeldoor.com',1,'2026-10-20 11:56:10'),(5,'BH-KNR','Kannur Regional Hub',1,5,'Near Caltex Junction, NH-66, Kannur','+91 94954 56789','knr.hub@steeldoor.com',1,'2026-10-20 11:56:10');
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
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
INSERT INTO `districts` VALUES (1,1,'Ernakulam Hub','dist-ekm','2026-10-20 11:56:10'),(2,1,'Trivandrum Hub','dist-tvm','2026-10-20 11:56:10'),(3,1,'Kozhikode Hub','dist-clt','2026-10-20 11:56:10'),(4,1,'Thrissur Hub','dist-tsr','2026-10-20 11:56:10'),(5,1,'Kannur Hub','dist-knr','2026-10-20 11:56:10');
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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_code` varchar(50) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('superadmin','admin','subadmin','customer') NOT NULL,
  `user_type` enum('company','coordinator','branch_head','customer','dealer') NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(25) DEFAULT NULL,
  `state_id` int DEFAULT NULL,
  `district_id` int DEFAULT NULL,
  `branch_id` int DEFAULT NULL,
  `area_id` int DEFAULT NULL,
  `address` text,
  `dealer_license` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_code` (`user_code`),
  UNIQUE KEY `username` (`username`),
  KEY `fk_users_district` (`district_id`),
  KEY `fk_users_area` (`area_id`),
  KEY `idx_users_username` (`username`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_user_type` (`user_type`),
  KEY `idx_users_branch` (`branch_id`),
  KEY `idx_users_state` (`state_id`),
  CONSTRAINT `fk_users_area` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_district` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_state` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'USR-COMP-001','company_admin','company123','superadmin','company','SteelGuard Executive Board','corporate@steeldoor.com','+91 98000 11223',1,NULL,NULL,NULL,NULL,NULL,1,NULL,'2026-10-20 11:56:10','2026-10-20 11:56:10'),(2,'USR-COORD-001','admin','admin123','admin','coordinator','Elena Vance (Operations Coordinator)','admin@steeldoor.com','+91 98000 11224',1,NULL,NULL,NULL,NULL,NULL,1,NULL,'2026-10-20 11:56:11','2026-10-20 11:56:11'),(3,'USR-COORD-002','coordinator','admin123','admin','coordinator','Alex George (Field Coordinator)','coordinator@steeldoor.com','+91 98000 11225',1,NULL,NULL,NULL,NULL,NULL,1,NULL,'2026-10-20 11:56:11','2026-10-20 11:56:11'),(4,'USR-BH-001','branch_ekm','branch123','subadmin','branch_head','Rajesh Menon','rajesh.menon@steeldoor.com','+91 98470 12345',1,1,1,NULL,NULL,NULL,1,NULL,'2026-10-20 11:56:11','2026-10-20 11:56:11'),(5,'USR-BH-002','branch_tvm','branch123','subadmin','branch_head','Suresh Kumar','suresh.kumar@steeldoor.com','+91 94471 23456',1,2,2,NULL,NULL,NULL,1,NULL,'2026-10-20 11:56:11','2026-10-20 11:56:11'),(6,'USR-BH-003','branch_clt','branch123','subadmin','branch_head','Anas Kabeer','anas.kabeer@steeldoor.com','+91 97452 34567',1,3,3,NULL,NULL,NULL,1,NULL,'2026-10-20 11:56:11','2026-10-20 11:56:11'),(7,'USR-BH-004','branch_tsr','branch123','subadmin','branch_head','Mohan Das','mohan.das@steeldoor.com','+91 98463 45678',1,4,4,NULL,NULL,NULL,1,NULL,'2026-10-20 11:56:11','2026-10-20 11:56:11'),(8,'USR-BH-005','branch_knr','branch123','subadmin','branch_head','K. V. Pavithran','pavithran.kv@steeldoor.com','+91 94954 56789',1,5,5,NULL,NULL,NULL,1,NULL,'2026-10-20 11:56:11','2026-10-20 11:56:11'),(9,'CLI-CUST-1001','user','user123','customer','customer','John Mathew','john.mathew@gmail.com','+91 94470 55443',1,1,1,NULL,'42 Orchid Residency, Stadium Link Rd, Kaloor',NULL,1,NULL,'2026-10-20 11:56:11','2026-10-20 11:56:11'),(10,'CLI-DEAL-2001','apex_dealer','dealer123','customer','dealer','Apex Doors Kochi','sales@apexdoors.com','+91 98952 33441',1,1,1,NULL,'Door No 8/120, Bypass Junction, Edapally','DL-EKM-2024-88',1,NULL,'2026-10-20 11:56:11','2026-10-20 11:56:11'),(11,'CLI-DEAL-2002','metro_builders','company123','customer','dealer','Metro Infra Ltd','contact@metroinfra.in','+91 98471 88990',1,1,1,NULL,'Plot 12, SmartCity Campus, Kakkanad','CO-INFRA-4491',1,NULL,'2026-10-20 11:56:11','2026-10-20 11:56:11');
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

-- Dump completed on 2026-10-20 17:35:36
