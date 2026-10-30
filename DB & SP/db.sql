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
-- Table structure for table `booking_history`
--

DROP TABLE IF EXISTS `booking_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_history` (
  `history_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `booking_name` varchar(150) DEFAULT NULL,
  `action_type` varchar(350) NOT NULL,
  `customer_note` text,
  `staff_note` text,
  `old_status_id` int DEFAULT NULL,
  `old_status_code` varchar(50) DEFAULT NULL,
  `old_status_label` varchar(100) DEFAULT NULL,
  `old_status_color_code` varchar(20) DEFAULT NULL,
  `new_status_id` int DEFAULT NULL,
  `new_status_code` varchar(50) DEFAULT NULL,
  `new_status_label` varchar(100) DEFAULT NULL,
  `new_status_color_code` varchar(20) DEFAULT NULL,
  `old_schedule_date` date DEFAULT NULL,
  `new_schedule_date` date DEFAULT NULL,
  `from_branch_head_id` int DEFAULT NULL,
  `from_branch_head_name` varchar(150) DEFAULT NULL,
  `to_branch_head_id` int DEFAULT NULL,
  `to_branch_head_name` varchar(150) DEFAULT NULL,
  `from_assigned_head_district_id` int DEFAULT NULL,
  `from_assigned_head_district_name` varchar(100) DEFAULT NULL,
  `to_assigned_head_district_id` int DEFAULT NULL,
  `to_assigned_head_district_name` varchar(100) DEFAULT NULL,
  `action_by_id` int DEFAULT NULL,
  `action_by_name` varchar(150) DEFAULT NULL,
  `action_by_role_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `idx_bh_booking_id` (`booking_id`),
  KEY `idx_bh_action_type` (`action_type`),
  KEY `idx_bh_created_at` (`created_at`),
  KEY `idx_bh_to_branch_head` (`to_branch_head_id`),
  KEY `idx_bh_new_status` (`new_status_code`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_history`
--

LOCK TABLES `booking_history` WRITE;
/*!40000 ALTER TABLE `booking_history` DISABLE KEYS */;
INSERT INTO `booking_history` VALUES (1,20,NULL,'New Booking Created','working',NULL,NULL,NULL,NULL,NULL,1,'New','New','#3b82f6',NULL,NULL,NULL,NULL,4,'Rajesh Menon',NULL,NULL,1,'Ernakulam',4,'Rajesh Menon',3,'2026-10-28 11:30:20'),(2,20,NULL,'Customer Notes Updated','working 2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-28 11:31:49'),(3,20,NULL,'Status Updated',NULL,'working 2',1,'New','New','#3b82f6',2,'Scheduled','Scheduled','#7c3aed',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,4,'Rajesh Menon',3,'2026-10-28 11:49:08'),(4,20,NULL,'Transfered',NULL,'working 2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,4,'Rajesh Menon',6,'Anas Kabeer',1,'Ernakulam',3,'Kozhikode',3,'Alex George (Coordinator)',2,'2026-10-28 11:50:07'),(5,20,NULL,'Status Updated',NULL,'working 2',2,'Scheduled','Scheduled','#7c3aed',3,'Completed','Completed','#10b981',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,'Alex George (Coordinator)',2,'2026-10-28 11:51:21'),(6,20,NULL,'Transfered',NULL,'working 2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,6,'Anas Kabeer',4,'Rajesh Menon',3,'Kozhikode',1,'Ernakulam',3,'Alex George (Coordinator)',2,'2026-10-28 11:51:21'),(7,21,'new','New Booking Created','gg',NULL,NULL,NULL,NULL,NULL,1,'New','New','#3b82f6',NULL,NULL,NULL,NULL,4,'Rajesh Menon',NULL,NULL,1,'Ernakulam',3,'Alex George (Coordinator)',2,'2026-10-28 12:00:53'),(8,21,'old','Customer Notes Updated','ff',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-28 12:01:40'),(9,22,'test 1','New Booking Created','hh',NULL,NULL,NULL,NULL,NULL,1,'New','New','#3b82f6',NULL,NULL,NULL,NULL,4,'Rajesh Menon',NULL,NULL,1,'Ernakulam',4,'Rajesh Menon',3,'2026-10-28 12:08:28'),(10,22,'test 2','Customer Name Updated','Name changed from \"test 1\" to \"test 2\"',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-28 12:08:45'),(11,22,'test 2','Customer Notes Updated','hhjjjj',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-28 12:08:45'),(12,22,'test 4','Customer Name Updated from \"test 2\" to \"test 4\"',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-28 12:18:54'),(13,22,'test 4','Customer Notes Updated','hhjjjjgg',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-28 12:18:54'),(14,21,'old 2','Customer Name Updated from \"old\" to \"old 2\"',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-28 12:22:27'),(15,21,'old 2','Customer Notes Updated','ff 2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-28 12:22:27'),(16,21,'old 2 3','Customer Name Updated from \"old 2\" to \"old 2 3\"',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-28 12:24:37'),(17,21,'old 2 3','Customer Notes Updated','ff 2 3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-28 12:24:37'),(18,21,'old 4','Customer Name Updated from \"old 2 3\" to \"old 4\"',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-28 12:25:22'),(19,21,'old 4','Customer Notes Updated','ff 4',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-28 12:25:22'),(20,22,'test 5','Customer Name Updated from \"test 4\" to \"test 5\"',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'SteelGuard Executive Board',1,'2026-10-28 12:27:27'),(21,22,'test 5','Customer Notes Updated','5',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'SteelGuard Executive Board',1,'2026-10-28 12:27:27'),(22,22,'test 6','Customer Name Updated from \"test 5\" to \"test 6\"',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,4,'Rajesh Menon',3,'2026-10-28 12:28:45'),(23,22,'test 6','Customer Notes Updated','10',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,4,'Rajesh Menon',3,'2026-10-28 12:28:45'),(24,14,'Jeevan','Status Updated',NULL,'Jeevan Notes',2,'Scheduled','Scheduled','#7c3aed',4,'Cancelled','Cancelled','#ef4444',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,'Alex George (Coordinator)',2,'2026-10-28 12:32:23'),(25,14,'Jeevan','Transfered',NULL,'Jeevan Notes',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,5,'Suresh Kumar',7,'Mohan Das',2,'Trivandrum',4,'Thrissur',3,'Alex George (Coordinator)',2,'2026-10-28 12:32:23'),(26,22,'test 6','Status Updated',NULL,'123',1,'New','New','#3b82f6',2,'Scheduled','Scheduled','#7c3aed',NULL,'2026-10-28',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'SteelGuard Executive Board',1,'2026-10-28 12:43:34'),(27,22,'test 6','Scheduled Date Changed from \"28-10-2026\" to \"29-10-2026\"',NULL,NULL,2,'Scheduled','Scheduled','#7c3aed',2,'Scheduled','Scheduled','#7c3aed','2026-10-28','2026-10-29',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'SteelGuard Executive Board',1,'2026-10-28 12:44:10'),(28,23,'test','New Booking Created','123',NULL,NULL,NULL,NULL,NULL,1,'New','New','#3b82f6',NULL,NULL,NULL,NULL,8,'K. V. Pavithran',NULL,NULL,5,'Kannur',1,'SteelGuard Executive Board',1,'2026-10-29 05:24:08'),(29,24,'ss','New Booking Created',NULL,NULL,NULL,NULL,NULL,NULL,1,'New','New','#3b82f6',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'',1,'SteelGuard Executive Board',1,'2026-10-29 07:35:54'),(30,24,'ss','Customer Notes Updated','wqwq',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'SteelGuard Executive Board',1,'2026-10-29 07:37:01'),(31,25,'test notes','New Booking Created','test notes',NULL,NULL,NULL,NULL,NULL,1,'New','New','#3b82f6',NULL,NULL,NULL,NULL,6,'Anas Kabeer',NULL,NULL,3,'Kozhikode',1,'SteelGuard Executive Board',1,'2026-10-29 08:52:24'),(32,25,'test notes','Status Updated',NULL,'staff new notes',1,'New','New','#3b82f6',2,'Scheduled','Scheduled','#7c3aed',NULL,'2026-10-29',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'SteelGuard Executive Board',1,'2026-10-29 09:17:31'),(33,25,'test notes','Scheduled Date Changed from \"29-10-2026\" to \"28-10-2026\"',NULL,NULL,2,'Scheduled','Scheduled','#7c3aed',2,'Scheduled','Scheduled','#7c3aed','2026-10-29','2026-10-28',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'SteelGuard Executive Board',1,'2026-10-29 09:18:37'),(34,25,'test notes','Scheduled Date Changed from \"28-10-2026\" to \"30-10-2026\"',NULL,'sd',2,'Scheduled','Scheduled','#7c3aed',2,'Scheduled','Scheduled','#7c3aed','2026-10-28','2026-10-30',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'SteelGuard Executive Board',1,'2026-10-29 09:19:00'),(35,25,'test notes','Scheduled Date Changed from \"30-10-2026\" to \"29-10-2026\"',NULL,'test notes',2,'Scheduled','Scheduled','#7c3aed',2,'Scheduled','Scheduled','#7c3aed','2026-10-30','2026-10-29',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,'Alex George (Coordinator)',2,'2026-10-29 09:24:25'),(36,25,'test notes','Customer Notes Updated','test notes note',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'SteelGuard Executive Board',1,'2026-10-29 09:39:05'),(37,26,'zcc','New Booking Created','zxc',NULL,NULL,NULL,NULL,NULL,1,'New','New','#3b82f6',NULL,NULL,NULL,NULL,6,'Anas Kabeer',NULL,NULL,3,'Kozhikode',1,'SteelGuard Executive Board',1,'2026-10-29 09:39:39'),(38,27,'sxa','New Booking Created','axsas',NULL,NULL,NULL,NULL,NULL,1,'New','New','#3b82f6',NULL,NULL,NULL,NULL,5,'Suresh Kumar',NULL,NULL,2,'Trivandrum',1,'SteelGuard Executive Board',1,'2026-10-29 11:01:54'),(39,28,'test','New Booking Created','qwe',NULL,NULL,NULL,NULL,NULL,1,'New','New','#3b82f6',NULL,NULL,NULL,NULL,16,'test',NULL,NULL,7,'test',1,'SteelGuard Executive Board',1,'2026-10-29 16:19:09'),(40,28,'test','Status Updated',NULL,'123',1,'New','New','#3b82f6',2,'Scheduled','Scheduled','#7c3aed',NULL,'2026-10-29',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'SteelGuard Executive Board',1,'2026-10-29 16:20:26'),(41,28,'test','Status Updated',NULL,'123',2,'Scheduled','Scheduled','#7c3aed',1,'New','New','#3b82f6','2026-10-29',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'SteelGuard Executive Board',1,'2026-10-29 16:25:20'),(42,28,'test','Status Updated',NULL,'123',1,'New','New','#3b82f6',2,'Scheduled','Scheduled','#7c3aed',NULL,'2026-10-29',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'SteelGuard Executive Board',1,'2026-10-29 16:27:17'),(43,25,'test notes','Scheduled Date Changed from \"29-10-2026\" to \"28-10-2026\"',NULL,'123',2,'Scheduled','Scheduled','#7c3aed',2,'Scheduled','Scheduled','#7c3aed','2026-10-29','2026-10-28',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'SteelGuard Executive Board',1,'2026-10-29 16:28:14'),(44,29,'test branch head','New Booking Created','123',NULL,NULL,NULL,NULL,NULL,1,'New','New','#3b82f6',NULL,NULL,NULL,NULL,8,'K. V. Pavithran',NULL,NULL,5,'Kannur',1,'SteelGuard Executive Board',1,'2026-10-29 16:28:57'),(45,29,'test branch head','Status Updated',NULL,'123',1,'New','New','#3b82f6',2,'Scheduled','Scheduled','#7c3aed',NULL,'2026-10-29',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'SteelGuard Executive Board',1,'2026-10-29 16:29:11'),(46,28,'test','Transfered',NULL,'123',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,16,'test',4,'Rajesh Menon',7,'test',1,'Ernakulam',1,'SteelGuard Executive Board',1,'2026-10-29 16:41:56'),(47,28,'test','Scheduled Date Changed from \"29-10-2026\" to \"28-10-2026\"',NULL,'123',2,'Scheduled','Scheduled','#7c3aed',2,'Scheduled','Scheduled','#7c3aed','2026-10-29','2026-10-28',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'SteelGuard Executive Board',1,'2026-10-29 16:41:56'),(48,30,'test customer','New Booking Created','123',NULL,NULL,NULL,NULL,NULL,1,'New','New','#3b82f6',NULL,NULL,NULL,NULL,6,'Anas Kabeer',NULL,NULL,3,'Kozhikode',NULL,'customer',5,'2026-10-29 16:54:34'),(49,11,'Vivek','Customer Notes Updated','Vivek Notes updated',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,10,'Apex Doors Kochi',4,'2026-10-29 17:26:25');
/*!40000 ALTER TABLE `booking_history` ENABLE KEYS */;
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
  `staff_notes` text,
  `status_id` int DEFAULT '1',
  `status_code` varchar(50) DEFAULT 'New',
  `status_label` varchar(100) DEFAULT 'New',
  `status_color_code` varchar(20) DEFAULT '#3b82f6',
  `schedule_date` date DEFAULT NULL,
  `state_id` int DEFAULT NULL,
  `state_name` varchar(100) DEFAULT NULL,
  `district_id` int DEFAULT NULL,
  `district_name` varchar(100) DEFAULT NULL,
  `area_id` int DEFAULT NULL,
  `area_name` varchar(100) DEFAULT NULL,
  `assigned_head_district_id` int DEFAULT NULL,
  `assigned_head_district_name` varchar(100) DEFAULT NULL,
  `branch_head_id` int DEFAULT NULL,
  `branch_head_name` varchar(150) DEFAULT NULL,
  `documents` json DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `login_role_id` int DEFAULT NULL,
  `login_id` int DEFAULT NULL,
  `login_name` varchar(150) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_by_name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bookings_mobile` (`mobile`),
  KEY `idx_bookings_login_id` (`login_id`),
  KEY `idx_bookings_district_id` (`district_id`),
  KEY `idx_bookings_state_id` (`state_id`),
  KEY `idx_bookings_area_id` (`area_id`),
  KEY `idx_bookings_branch_head_id` (`branch_head_id`),
  KEY `idx_bookings_schedule_date` (`schedule_date`),
  KEY `idx_bookings_assigned_head_district_id` (`assigned_head_district_id`),
  KEY `idx_bookings_status_id` (`status_id`),
  KEY `idx_bookings_status_code` (`status_code`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'Arun','7980989098','Flat 302, Green Valley Apartments, Kakkanad, Kochi, Kerala – 682030','',NULL,1,'New','New','#3b82f6',NULL,1,'Kerala',1,'Ernakulam',5,'Fort Kochi',1,'Ernakulam',4,'Rajesh Menon','[]',0,2,3,'Alex George (Coordinator)',NULL,NULL,'2026-10-24 12:30:47','2026-10-27 11:31:05'),(2,'Arjun Menon','6980979809','14, Rose Garden Street, Edappally, Kochi, Kerala – 682024','',NULL,2,'Scheduled','Scheduled','#7c3aed','2024-10-21',1,'Kerala',1,'Ernakulam',1,'Edapally',1,'Ernakulam',4,'Rajesh Menon','[]',0,2,3,'Alex George (Coordinator)',4,'Rajesh Menon','2026-10-24 12:31:56','2026-10-28 08:46:15'),(3,'Akhil Das','6879809798','House 24, Rose Villa, Kazhakkoottam, TVM, Kerala – 695582','',NULL,1,'New','New','#3b82f6',NULL,1,'Kerala',2,'Trivandrum',11,'Kazhakkoottam',2,'Trivandrum',5,'Suresh Kumar','[\"/uploads/1792845206690-door.jpg\"]',0,3,5,'Suresh Kumar',NULL,NULL,'2026-10-24 12:33:30','2026-10-27 11:31:05'),(5,'Ananya Thomas','9087909809','Flat 302, Silver Heights, Pattom, TVM, Kerala – 695004','',NULL,1,'New','New','#3b82f6',NULL,1,'Kerala',2,'Trivandrum',12,'Pattom',2,'Trivandrum',5,'Suresh Kumar','[\"/uploads/1792845388188-door__1_.jpg\"]',0,3,5,'Suresh Kumar',NULL,NULL,'2026-10-24 12:36:30','2026-10-27 11:31:05'),(6,'Diya Mathew','8098909878','House 12, Green Valley Lane, West Hill, Kozhikode, Kerala – 673005','',NULL,1,'New','New','#3b82f6',NULL,1,'Kerala',3,'Kozhikode',19,'Medical College',3,'Kozhikode',6,'Anas Kabeer','[]',0,3,6,'Anas Kabeer',NULL,NULL,'2026-10-24 12:37:52','2026-10-27 11:31:05'),(7,'Rahul Nair','9089878908','Flat 204, Sunrise Residency, Mavoor Road, Kozhikode, Kerala – 673004','',NULL,1,'New','New','#3b82f6',NULL,1,'Kerala',3,'Kozhikode',18,'Chevayur',3,'Kozhikode',6,'Anas Kabeer','[\"/uploads/1792845533064-door_2_.jpg\"]',0,3,6,'Anas Kabeer',NULL,NULL,'2026-10-24 12:38:55','2026-10-27 11:31:05'),(8,'Arjun Menon','6879879809','House 18, Rose Garden Lane, Ayyanthole, Thrissur, Kerala – 680003','',NULL,1,'New','New','#3b82f6',NULL,1,'Kerala',4,'Thrissur',22,'Ayyanthole',4,'Thrissur',7,'Mohan Das','[]',0,3,7,'Mohan Das',NULL,NULL,'2026-10-24 12:39:55','2026-10-27 11:31:05'),(9,'Druvan customer','8986086817','Druvan house','Notes By Druvan',NULL,1,'New','New','#3b82f6','2024-10-23',1,'Kerala',1,'Ernakulam',38,'Muvattupuzha',2,'Trivandrum',5,'Suresh Kumar','[\"/uploads/1792845625918-shopping__2_.webp\", \"/uploads/1792845625919-shopping__1_.webp\"]',0,5,NULL,'customer',3,'Alex George (Coordinator)','2026-10-24 12:40:29','2026-10-28 05:49:14'),(10,'Meera Suresh','6879089098','Flat 302, Green Meadows Residency, Punkunnam, Thrissur, Kerala – 680002','',NULL,1,'New','New','#3b82f6',NULL,1,'Kerala',4,'Thrissur',21,'Punkunnam',4,'Thrissur',7,'Mohan Das','[\"/uploads/1792845677326-door_3_.jpg\"]',0,3,7,'Mohan Das',NULL,NULL,'2026-10-24 12:41:19','2026-10-27 11:31:05'),(11,'Vivek','8776086807','Vivek House','Vivek Notes updated',NULL,1,'New','New','#3b82f6',NULL,1,'Kerala',5,'Kannur',27,'South Bazar',5,'Kannur',8,'K. V. Pavithran','[\"/uploads/1792845703196-shopping.webp\"]',0,4,10,'Apex Doors Kochi',NULL,NULL,'2026-10-24 12:41:44','2026-10-29 17:26:25'),(12,'Ridhul','98675367835','Ridhul Address','Ridhul Notes',NULL,1,'New','New','#3b82f6',NULL,1,'Kerala',4,'Thrissur',23,'Ollur',4,'Thrissur',7,'Mohan Das','[\"/uploads/1792845763031-shopping__1_.webp\"]',0,4,10,'Apex Doors Kochi',NULL,NULL,'2026-10-24 12:42:44','2026-10-27 11:31:05'),(13,'Vishnu Raj','9089089098','House 14, Palm Grove Lane, Thana, , Kerala – 670012','',NULL,1,'New','New','#3b82f6',NULL,1,'Kerala',5,'Kannur',26,'Payyambalam',5,'Kannur',8,'K. V. Pavithran','[]',0,3,8,'K. V. Pavithran',NULL,NULL,'2026-10-24 12:43:14','2026-10-27 11:31:05'),(14,'Jeevan','56875235465','Jeevan Address','Jeevan Notes',NULL,4,'Cancelled','Cancelled','#ef4444',NULL,1,'Kerala',2,'Trivandrum',9,'Kowdiar',4,'Thrissur',7,'Mohan Das','[\"/uploads/1792845837004-shopping.webp\"]',0,4,11,'Metro Infra Ltd',3,'Alex George (Coordinator)','2026-10-24 12:43:58','2026-10-28 12:32:23'),(15,'Midhun','8965412357','Midhun Address','Midhun Notes',NULL,1,'New','New','#3b82f6',NULL,1,'Kerala',5,'Kannur',27,'South Bazar',5,'Kannur',8,'K. V. Pavithran','[\"/uploads/1793095720595-shopping.webp\"]',0,4,11,'Metro Infra Ltd',NULL,NULL,'2026-10-24 12:44:58','2026-10-27 10:08:40'),(20,'test','8909890989','gg, Aluva, Ernakulam, Kerala','working 2',NULL,3,'Completed','Completed','#10b981','2026-10-28',1,'Kerala',1,'Ernakulam',3,'Aluva',1,'Ernakulam',4,'Rajesh Menon','[]',0,3,4,'Rajesh Menon',3,'Alex George (Coordinator)','2026-10-28 11:30:20','2026-10-28 11:51:21'),(21,'old 4','1234567890','gg, Aluva, Ernakulam, Kerala','ff 4',NULL,1,'New','New','#3b82f6',NULL,1,'Kerala',1,'Ernakulam',3,'Aluva',1,'Ernakulam',4,'Rajesh Menon','[]',0,2,3,'Alex George (Coordinator)',NULL,NULL,'2026-10-28 12:00:53','2026-10-28 12:25:22'),(22,'test 6','1234567890','ff, Aluva, Ernakulam, Kerala, Aluva, Ernakulam, Kerala','123',NULL,2,'Scheduled','Scheduled','#7c3aed','2026-10-29',1,'Kerala',1,'Ernakulam',3,'Aluva',1,'Ernakulam',4,'Rajesh Menon','[\"/uploads/1793189306560-door_3_.jpg\"]',0,3,4,'Rajesh Menon',1,'SteelGuard Executive Board','2026-10-28 12:08:28','2026-10-28 12:44:10'),(23,'test','12345670','123','123',NULL,1,'New','New','#3b82f6',NULL,1,'Kerala',5,'Kannur',27,'South Bazar',5,'Kannur',8,'K. V. Pavithran','[\"/uploads/1793251434358-Neotronics_Enterprise_Product_Deck.pdf\"]',0,1,1,'SteelGuard Executive Board',NULL,NULL,'2026-10-29 05:24:08','2026-10-29 05:24:08'),(24,'ss','s','ss','wqwq','aa',1,'New','New','#3b82f6',NULL,1,'Kerala',NULL,'',NULL,NULL,NULL,'',NULL,NULL,'[]',0,1,1,'SteelGuard Executive Board',NULL,NULL,'2026-10-29 07:35:54','2026-10-29 09:07:26'),(25,'test notes','1234567890','test Add','test notes note','123',2,'Scheduled','Scheduled','#7c3aed','2026-10-28',1,'Kerala',3,'Kozhikode',15,'Mavoor Road',3,'Kozhikode',6,'Anas Kabeer','[\"/uploads/1793263942955-shopping__1_.webp\"]',0,1,1,'SteelGuard Executive Board',1,'SteelGuard Executive Board','2026-10-29 08:52:24','2026-10-29 16:28:14'),(26,'zcc','cczxcz','zxc','zxc',NULL,1,'New','New','#3b82f6',NULL,1,'Kerala',3,'Kozhikode',19,'Medical College',3,'Kozhikode',6,'Anas Kabeer','[]',0,1,1,'SteelGuard Executive Board',NULL,NULL,'2026-10-29 09:39:39','2026-10-29 09:39:39'),(27,'sxa','asxs','axssa','axsas','1243',1,'New','New','#3b82f6',NULL,1,'Kerala',2,'Trivandrum',10,'Technopark',2,'Trivandrum',5,'Suresh Kumar','[]',0,1,1,'SteelGuard Executive Board',1,'SteelGuard Executive Board','2026-10-29 11:01:54','2026-10-29 16:17:43'),(28,'test','qwew','qwe','qwe','123',2,'Scheduled','Scheduled','#7c3aed','2026-10-28',1,'Kerala',7,'test',NULL,NULL,1,'Ernakulam',4,'Rajesh Menon','[]',0,1,1,'SteelGuard Executive Board',1,'SteelGuard Executive Board','2026-10-29 16:19:09','2026-10-29 16:41:56'),(29,'test branch head','123434','123','123','123',2,'Scheduled','Scheduled','#7c3aed','2026-10-29',1,'Kerala',5,'Kannur',29,'Payyanur',5,'Kannur',8,'K. V. Pavithran','[]',0,1,1,'SteelGuard Executive Board',1,'SteelGuard Executive Board','2026-10-29 16:28:57','2026-10-29 16:29:11'),(30,'test customer','123','123','123',NULL,1,'New','New','#3b82f6',NULL,1,'Kerala',3,'Kozhikode',17,'Mananchira',3,'Kozhikode',6,'Anas Kabeer','[\"/uploads/1793292872317-shopping.webp\"]',0,5,NULL,'customer',NULL,NULL,'2026-10-29 16:54:34','2026-10-29 16:54:34');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `districts`
--

LOCK TABLES `districts` WRITE;
/*!40000 ALTER TABLE `districts` DISABLE KEYS */;
INSERT INTO `districts` VALUES (1,1,'Ernakulam','dist-ekm','2026-10-20 11:56:10'),(2,1,'Trivandrum','dist-tvm','2026-10-20 11:56:10'),(3,1,'Kozhikode','dist-clt','2026-10-20 11:56:10'),(4,1,'Thrissur','dist-tsr','2026-10-20 11:56:10'),(5,1,'Kannur','dist-knr','2026-10-20 11:56:10'),(7,1,'test','ww','2026-10-29 10:08:23');
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
-- Table structure for table `status_options`
--

DROP TABLE IF EXISTS `status_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `label` varchar(100) NOT NULL,
  `color_code` varchar(20) DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_status_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `status_options`
--

LOCK TABLES `status_options` WRITE;
/*!40000 ALTER TABLE `status_options` DISABLE KEYS */;
INSERT INTO `status_options` VALUES (1,'New','New','#3b82f6',1,1,'2026-10-27 06:52:44','2026-10-27 07:34:55'),(2,'Scheduled','Scheduled','#7c3aed',2,1,'2026-10-27 06:52:44','2026-10-27 06:52:44'),(3,'Completed','Completed','#10b981',3,1,'2026-10-27 06:52:44','2026-10-27 06:52:44'),(4,'Cancelled','Cancelled','#ef4444',4,1,'2026-10-27 06:52:44','2026-10-27 07:23:17');
/*!40000 ALTER TABLE `status_options` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'company_admin','123',1,'company',1,'admin','SteelGuard Executive Board','corporate@steeldoor.com','+91 98000 11223',1,'Kerala',NULL,NULL,NULL,1,0,'2026-10-29 17:28:34','2026-10-20 11:56:10','2026-10-29 17:29:06'),(2,'admin','123',2,'coordinator',1,'admin','Elena Vance (Coordinator)','admin@steeldoor.com','+91 98000 11224',1,'Kerala',NULL,NULL,NULL,1,0,'2026-10-21 06:20:59','2026-10-20 11:56:11','2026-10-24 12:14:09'),(3,'coordinator','123',2,'coordinator',2,'staff','Alex George (Coordinator)','coordinator@steeldoor.com','+91 98000 11225',1,'Kerala',NULL,NULL,NULL,1,0,'2026-10-29 11:16:10','2026-10-20 11:56:11','2026-10-29 11:16:10'),(4,'branch_ekm','123',3,'branch_head',2,'staff','Rajesh Menon','rajesh.menon@steeldoor.com','+91 98470 12345',1,'Kerala',1,'Ernakulam',NULL,1,0,'2026-10-29 11:15:11','2026-10-20 11:56:11','2026-10-29 15:21:21'),(5,'branch_tvm','123',3,'branch_head',2,'staff','Suresh Kumar','suresh.kumar@steeldoor.com','+91 94471 23456',1,'Kerala',2,'Trivandrum',NULL,1,0,'2026-10-27 11:37:06','2026-10-20 11:56:11','2026-10-29 15:21:21'),(6,'branch_clt','123',3,'branch_head',2,'staff','Anas Kabeer','anas.kabeer@steeldoor.com','+91 97452 34567',1,'Kerala',3,'Kozhikode',NULL,1,0,'2026-10-24 12:43:56','2026-10-20 11:56:11','2026-10-29 15:21:21'),(7,'branch_tsr','123',3,'branch_head',2,'staff','Mohan Das','mohan.das@steeldoor.com','+91 98463 45678',1,'Kerala',4,'Thrissur',NULL,1,0,'2026-10-27 11:35:37','2026-10-20 11:56:11','2026-10-29 15:21:21'),(8,'branch_knr','123',3,'branch_head',2,'staff','K. V. Pavithran','pavithran.kv@steeldoor.com','+91 94954 56789',1,'Kerala',5,'Kannur',NULL,1,0,'2026-10-24 12:44:33','2026-10-20 11:56:11','2026-10-29 15:21:21'),(10,'apex_dealer','123',4,'dealer',NULL,NULL,'Apex Doors Kochi','sales@apexdoors.com','+91 98952 33441',1,'Kerala',NULL,NULL,'Door No 8/120, Bypass Junction, Edapally',1,0,'2026-10-29 17:25:33','2026-10-20 11:56:11','2026-10-29 17:25:33'),(11,'metro_builders','123',4,'dealer',NULL,NULL,'Metro Infra Ltd','contact@metroinfra.in','+91 98471 88990',1,'Kerala',NULL,NULL,'Plot 12, SmartCity Campus, Kakkanad',1,0,'2026-10-24 12:43:10','2026-10-20 11:56:11','2026-10-24 12:43:10'),(16,'test','123',3,'branch_head',2,'staff','test','123','123',1,'Kerala',7,'test','123',0,0,NULL,'2026-10-29 15:25:22','2026-10-29 17:21:02'),(17,'test 2','1234',3,'branch_head',2,'staff','test 2','123','123',1,'Kerala',7,'tests','123',1,0,NULL,'2026-10-29 17:16:06','2026-10-29 17:25:49');
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

-- Dump completed on 2026-10-29 23:01:10
