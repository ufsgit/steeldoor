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
INSERT INTO `areas` VALUES (1,1,'Edapally','682024',0,'2026-10-20 11:56:10'),(2,1,'Kakkanad','682030',0,'2026-10-20 11:56:10'),(3,1,'Aluva','683101',0,'2026-10-20 11:56:10'),(4,1,'Palarivattom','682025',0,'2026-10-20 11:56:10'),(5,1,'Fort Kochi','682001',0,'2026-10-20 11:56:10'),(6,1,'Vyttila','682019',0,'2026-10-20 11:56:10'),(7,1,'Kaloor','682017',0,'2026-10-20 11:56:10'),(8,1,'Tripunithura','682301',0,'2026-10-20 11:56:10'),(9,2,'Kowdiar','695003',0,'2026-10-20 11:56:10'),(10,2,'Technopark','695581',0,'2026-10-20 11:56:10'),(11,2,'Kazhakkoottam','695582',0,'2026-10-20 11:56:10'),(12,2,'Pattom','695004',0,'2026-10-20 11:56:10'),(13,2,'Vellayambalam','695010',0,'2026-10-20 11:56:10'),(14,2,'Thampanoor','695001',0,'2026-10-20 11:56:10'),(15,3,'Mavoor Road','673004',0,'2026-10-20 11:56:10'),(16,3,'Palayam','673001',0,'2026-10-20 11:56:10'),(17,3,'Mananchira','673001',0,'2026-10-20 11:56:10'),(18,3,'Chevayur','673017',0,'2026-10-20 11:56:10'),(19,3,'Medical College','673008',0,'2026-10-20 11:56:10'),(20,4,'Round North','680001',0,'2026-10-20 11:56:10'),(21,4,'Punkunnam','680002',0,'2026-10-20 11:56:10'),(22,4,'Ayyanthole','680003',0,'2026-10-20 11:56:10'),(23,4,'Ollur','680306',0,'2026-10-20 11:56:10'),(24,4,'Chalakudy','680307',0,'2026-10-20 11:56:10'),(25,5,'Thana','670012',0,'2026-10-20 11:56:10'),(26,5,'Payyambalam','670001',0,'2026-10-20 11:56:10'),(27,5,'South Bazar','670002',0,'2026-10-20 11:56:10'),(28,5,'Talap','670002',0,'2026-10-20 11:56:10'),(29,5,'Payyanur','670307',0,'2026-10-20 11:56:10'),(30,1,'Kadavanthra','682020',0,'2026-10-22 08:54:22'),(31,1,'Panampilly Nagar','682036',0,'2026-10-22 08:54:22'),(32,1,'Marine Drive','682031',0,'2026-10-22 08:54:22'),(33,1,'Ravipuram','682016',0,'2026-10-22 08:54:22'),(34,1,'Thrikkakara','682021',0,'2026-10-22 08:54:22'),(35,1,'Kalamassery','683104',0,'2026-10-22 08:54:22'),(36,1,'Angamaly','683572',0,'2026-10-22 08:54:22'),(37,1,'Perumbavoor','683542',0,'2026-10-22 08:54:22'),(38,1,'Muvattupuzha','686661',0,'2026-10-22 08:54:22'),(39,1,'Kothamangalam','686691',0,'2026-10-22 08:54:22'),(40,1,'North Paravur','683513',0,'2026-10-22 08:54:22'),(41,1,'Mattancherry','682002',0,'2026-10-22 08:54:22'),(42,1,'Thevara','682013',0,'2026-10-22 08:54:22'),(43,1,'Maradu','682304',0,'2026-10-22 08:54:22'),(44,1,'Cherai','683514',0,'2026-10-22 08:54:22'),(45,1,'Piravom','686664',0,'2026-10-22 08:54:22'),(46,1,'Kolenchery','682311',0,'2026-10-22 08:54:22'),(47,6,'qwe','qwe',0,'2026-10-24 08:30:35');
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
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'Anand Varma','+91 98470 11223','Flat 4B, SkyLine Apts, Palarivattom','Fitting scheduled for tomorrow morning.','SCHEDULED','2024-10-24',NULL,NULL,2,2,'Elena Vance',1,'Kerala',1,'Ernakulam Hub',4,'Palarivattom',4,'Rajesh Menon','[\"/uploads/site_plan.pdf\"]',1,'2026-10-21 07:14:20','2026-10-23 10:21:41'),(2,'Rahul Krishnan','+91 94471 22334','House 12, MG Road, Ernakulam','Double door fitting required','NEW',NULL,NULL,NULL,2,2,'Elena Vance',1,'Kerala',1,'Ernakulam Hub',1,'Edapally',4,'Rajesh Menon','[\"/uploads/site_plan.pdf\"]',0,'2026-10-21 10:38:24','2026-10-23 08:24:19'),(3,'Rahul Krishnan','+91 94471 22334','House 12, MG Road, Ernakulam','Client requested cancellation.','CANCELLED',NULL,NULL,NULL,2,2,'Elena Vance',1,'Kerala',1,'Ernakulam Hub',1,'Edapally',4,'Rajesh Menon','[\"/uploads/site_plan.pdf\"]',0,'2026-10-22 05:22:47','2026-10-23 10:21:41'),(4,'Test Lead','9876543210','Kochi Road','Testing API','NEW',NULL,NULL,NULL,NULL,NULL,NULL,1,'Kerala',NULL,NULL,1,'Edapally',NULL,NULL,'[]',0,'2026-10-22 06:39:47','2026-10-22 06:39:47'),(5,'Test','6897638','ALUVA, Aluva, Ernakulam Hub, Kerala','SRG','CANCELLED',NULL,4,'Rajesh Menon',3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam Hub',3,'Aluva',4,'Rajesh Menon','[]',0,'2026-10-22 06:48:54','2026-10-23 10:21:41'),(6,'testing','79809878098','test','','NEW',NULL,NULL,NULL,3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam Hub',5,'Fort Kochi',4,'Rajesh Menon','[]',1,'2026-10-22 06:50:38','2026-10-23 08:19:48'),(7,'hlo chalakudy','789098970','44, Chalakudy, Ernakulam Hub, Kerala, Chalakudy, Ernakulam Hub, Kerala','hjj','NEW',NULL,NULL,NULL,3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam Hub',24,'Chalakudy',4,'Rajesh Menon','[]',0,'2026-10-22 07:06:10','2026-10-23 08:19:48'),(8,'gsd','7980978098','o','','NEW',NULL,NULL,NULL,3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam Hub',NULL,'',4,'Rajesh Menon','[]',1,'2026-10-22 08:48:53','2026-10-23 08:19:48'),(9,'googke','7980987098','oiuyoipj, Aluva, Ernakulam, Kerala, Aluva, Ernakulam, Kerala','','SCHEDULED','2024-09-10',4,'Rajesh Menon',3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam',3,'Aluva',4,'Rajesh Menon','[\"/uploads/googleLogo.png\"]',1,'2026-10-22 10:20:43','2026-10-24 05:42:03'),(10,'doc test','7869879809','bn, Aluva, Ernakulam, Kerala','mn','SCHEDULED','2024-10-24',4,'Rajesh Menon',3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam',3,'Aluva',4,'Rajesh Menon','[\"/uploads/googleLogo.png\"]',1,'2026-10-22 11:03:29','2026-10-24 05:41:57'),(11,'doc test','78769870423','sad','aef','SCHEDULED','2024-10-24',4,'Rajesh Menon',3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam',NULL,'',4,'Rajesh Menon','[\"/uploads/profile_icon.png\"]',1,'2026-10-22 11:54:33','2026-10-24 05:42:09'),(12,'awef','23452345','we','asef','NEW',NULL,NULL,NULL,3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam',NULL,'',4,'Rajesh Menon','[\"/uploads/schoolbus.png\"]',1,'2026-10-22 11:55:00','2026-10-23 08:19:48'),(13,'AWFDW','76868990','ADW, Angamaly, Ernakulam, Kerala, Angamaly, Ernakulam, Kerala','done in 3','CANCELLED',NULL,4,'Rajesh Menon',3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam',36,'Angamaly',4,'Rajesh Menon','[\"/uploads/profile_.jpeg\"]',0,'2026-10-22 11:56:40','2026-10-23 11:44:41'),(15,'files','7898099879','fgh','ghjk','NEW',NULL,NULL,NULL,3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam',NULL,'',4,'Rajesh Menon','[\"/uploads/FLUTTER_WEB_CSP_WHITE_SCREEN_RESOLUTION.pdf\"]',1,'2026-10-23 06:30:59','2026-10-24 05:41:19'),(16,'file 2','4567876323','sdf','sdfsadf','SCHEDULED','2024-10-24',5,'Suresh Kumar',3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam',NULL,'',4,'Rajesh Menon','[\"/uploads/FLUTTER_WEB_CSP_WHITE_SCREEN_RESOLUTION.pdf\"]',1,'2026-10-23 06:36:54','2026-10-24 05:41:51'),(17,'John Doe','9876543210','MG Road, Kochi','Requires wood finish','CANCELLED',NULL,4,'Rajesh Menon',2,2,'Elena Vance',1,'Kerala',1,'Ernakulam',1,'Edapally',4,'Rajesh Menon','[]',0,'2026-10-23 08:28:41','2026-10-24 09:07:13'),(19,'avabs','1234567890','sbsns','zbsnxms','NEW',NULL,NULL,NULL,2,3,'Alex George (Field Coordinator)',1,'Kerala',NULL,NULL,39,'Kothamangalam',NULL,NULL,'[]',0,'2026-10-23 09:38:43','2026-10-23 09:38:43'),(20,'tvm','7062583654','dass','fghjk','NEW',NULL,NULL,NULL,3,5,'Suresh Kumar',1,'Kerala',2,'Trivandrum',11,'Kazhakkoottam',5,'Suresh Kumar','[]',0,'2026-10-23 09:43:36','2026-10-23 09:43:36'),(21,'doc','1234567890','bsnd','','SCHEDULED','2024-10-01',3,'Alex George (Field Coordinator)',2,3,'Alex George (Field Coordinator)',1,'Kerala',NULL,NULL,17,'Mananchira',NULL,NULL,'[\"/uploads/IMG-20261023-WA0045.jpg\"]',1,'2026-10-23 09:45:20','2026-10-23 10:21:41'),(22,'das','1234123412','wer','','NEW',NULL,NULL,NULL,2,3,'Alex George (Field Coordinator)',1,'Kerala',NULL,NULL,26,'Payyambalam',NULL,NULL,'[]',0,'2026-10-23 10:16:04','2026-10-23 10:16:04'),(24,'doc tt','1234567890','wer','','NEW',NULL,NULL,NULL,2,3,'Alex George (Field Coordinator)',1,'Kerala',NULL,NULL,36,'Angamaly',NULL,NULL,'[\"/uploads/volume.png\"]',0,'2026-10-23 11:39:01','2026-10-23 11:39:01'),(25,'doctt ff','1234567890','af','','SCHEDULED','2024-10-24',3,'Alex George (Coordinator)',2,3,'Alex George (Field Coordinator)',1,'Kerala',NULL,NULL,44,'Cherai',NULL,NULL,'[\"/uploads/FLUTTER_WEB_CSP_WHITE_SCREEN_RESOLUTION.pdf\"]',0,'2026-10-23 11:39:28','2026-10-23 11:57:04'),(26,'swaroop','1234567890','ashh','ashh','SCHEDULED','2024-10-24',3,'Alex George (Coordinator)',3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam',3,'Aluva',4,'Rajesh Menon','[]',1,'2026-10-23 11:52:48','2026-10-23 11:55:53'),(27,'swaroop','1234567890','gbn','','SCHEDULED','2024-10-24',3,'Alex George (Coordinator)',2,3,'Alex George (Coordinator)',1,'Kerala',NULL,NULL,3,'Aluva',NULL,NULL,'[]',0,'2026-10-23 12:01:02','2026-10-23 12:06:28'),(28,'sdf','1234567890','szsz','','SCHEDULED','2024-10-24',3,'Alex George (Coordinator)',2,3,'Alex George (Coordinator)',1,'Kerala',NULL,NULL,21,'Punkunnam',NULL,NULL,'[]',0,'2026-10-23 12:07:45','2026-10-23 12:08:29'),(29,'asap','1234567890','asd','','SCHEDULED','2024-10-24',5,'Suresh Kumar',3,5,'Suresh Kumar',1,'Kerala',2,'Trivandrum',11,'Kazhakkoottam',5,'Suresh Kumar','[]',0,'2026-10-23 12:11:14','2026-10-24 09:06:31'),(30,'1234','1234567890','1234','12343','NEW',NULL,NULL,NULL,4,10,'Apex Doors Kochi',1,'Kerala',5,'Kannur',27,'South Bazar',8,'K. V. Pavithran','[\"/uploads/1792816047625-Bus.jpeg\"]',0,'2026-10-24 04:27:39','2026-10-24 04:27:39'),(31,'dbsxfg','dxfbdfb','zxfbfzbf','1234','CANCELLED',NULL,10,'Apex Doors Kochi',4,10,'Apex Doors Kochi',1,'Kerala',5,'Kannur',16,'Palayam',8,'K. V. Pavithran','[\"/uploads/1792817128741-web_structure.docx\"]',0,'2026-10-24 04:45:32','2026-10-24 07:06:13'),(32,'Test User','9999999999','Test Address',NULL,'NEW',NULL,NULL,NULL,NULL,NULL,NULL,1,'Kerala',NULL,NULL,NULL,NULL,NULL,NULL,'[]',0,'2026-10-24 04:52:58','2026-10-24 04:52:58'),(33,'Test File','9898989898','Test Address',NULL,'SCHEDULED','2024-10-24',3,'Alex George (Coordinator)',NULL,NULL,NULL,1,'Kerala',NULL,NULL,NULL,NULL,5,'Suresh Kumar','[\"/uploads/1792817585247-test_doc.pdf\"]',0,'2026-10-24 04:53:05','2026-10-24 06:22:43'),(34,'Test Multi','9797979797','Multi Address',NULL,'NEW',NULL,NULL,NULL,NULL,NULL,NULL,1,'Kerala',NULL,NULL,NULL,NULL,NULL,NULL,'[\"/uploads/1792817599186-doc1.txt\", \"/uploads/1792817599187-doc2.txt\"]',0,'2026-10-24 04:53:19','2026-10-24 04:53:19'),(35,'Test JSON Doc','9696969696','JSON Address',NULL,'NEW',NULL,NULL,NULL,NULL,NULL,NULL,1,'Kerala',NULL,NULL,NULL,NULL,NULL,NULL,'[\"/uploads/1792817691073-sample.pdf\"]',0,'2026-10-24 04:55:44','2026-10-24 04:56:00'),(36,'dfgf','fsdgfds','dfgs','sdfgfsd','NEW',NULL,NULL,NULL,4,10,'Apex Doors Kochi',1,'Kerala',1,'Ernakulam',42,'Thevara',4,'Rajesh Menon','[\"/uploads/1792817901795-1792817128741-web_structure.docx\"]',1,'2026-10-24 04:58:23','2026-10-24 05:41:11'),(37,'doccc','1234567890','as, Aluva, Ernakulam, Kerala','','CANCELLED',NULL,4,'Rajesh Menon',3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam',3,'Aluva',4,'Rajesh Menon','[\"/uploads/1792819148519-FLUTTER_WEB_CSP_WHITE_SCREEN_RESOLUTION.pdf\", \"/uploads/1792832917199-profile_3.png\"]',0,'2026-10-24 05:19:29','2026-10-24 09:08:50'),(38,'pic test','1234567890','das','dfsgsyj','NEW',NULL,NULL,NULL,3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam',1,'Edapally',4,'Rajesh Menon','[]',1,'2026-10-24 05:30:09','2026-10-24 05:31:30'),(39,'pic test','7980979809','das','as','NEW',NULL,NULL,NULL,3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam',3,'Aluva',4,'Rajesh Menon','[\"/uploads/1792819914152-profile_3.png\"]',1,'2026-10-24 05:31:56','2026-10-24 05:41:00'),(40,'status','1234567890','asd','','CANCELLED',NULL,4,'Rajesh Menon',3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam',3,'Aluva',4,'Rajesh Menon','[]',1,'2026-10-24 05:32:50','2026-10-24 05:40:54'),(41,'test mul','123','test','1234','SCHEDULED','2026-10-26',10,'Apex Doors Kochi',4,10,'Apex Doors Kochi',1,'Kerala',5,'Kannur',28,'Talap',4,'Rajesh Menon','[\"/uploads/1792821565603-Bus.jpeg\", \"/uploads/1792821565606-Car.jpeg\", \"/uploads/1792821565614-jeep.jpeg\", \"/uploads/1792821571481-1792817128741-web_structure.docx\"]',0,'2026-10-24 05:58:44','2026-10-24 06:36:47'),(42,'image test','1234567809','qs','','SCHEDULED','2026-10-01',3,'Alex George (Coordinator)',2,3,'Alex George (Coordinator)',1,'Kerala',NULL,NULL,36,'Angamaly',3,NULL,'[]',1,'2026-10-24 06:08:27','2026-10-24 06:11:14'),(43,'test status change','123','test status change','asdd','SCHEDULED','2024-10-19',3,'Alex George (Coordinator)',4,10,'Apex Doors Kochi',1,'Kerala',3,'Kozhikode',15,'Mavoor Road',3,'Anas Kabeer','[\"/uploads/1792822955043-1792816047625-Bus.jpeg\"]',0,'2026-10-24 06:22:35','2026-10-24 07:04:20'),(44,'dd','6789878987','yaya, Aluva, Kerala','das','SCHEDULED','2024-10-24',3,'Alex George (Coordinator)',2,3,'Alex George (Coordinator)',1,'Kerala',NULL,NULL,3,'Aluva',4,'Rajesh Menon','[]',0,'2026-10-24 06:23:39','2026-10-24 07:33:13'),(45,'arun','1234567890','ss','','COMPLETED','2024-10-24',3,'Alex George (Coordinator)',2,3,'Alex George (Coordinator)',1,'Kerala',NULL,NULL,26,'Payyambalam',5,'Suresh Kumar','[]',0,'2026-10-24 07:45:30','2026-10-24 08:03:39'),(46,'testtstst','testtstst','testtstst','testtstst','NEW',NULL,NULL,NULL,4,10,'Apex Doors Kochi',1,'Kerala',3,'Kozhikode',15,'Mavoor Road',6,'Anas Kabeer','[]',0,'2026-10-24 07:46:37','2026-10-24 07:46:37'),(47,'ekm','1234567890','dd','','CANCELLED',NULL,3,'Alex George (Coordinator)',3,4,'Rajesh Menon',1,'Kerala',5,'Kannur',3,'Aluva',5,'Suresh Kumar','[]',0,'2026-10-24 07:46:58','2026-10-24 09:40:47'),(48,'test cus','123','123','123','NEW',NULL,NULL,NULL,4,10,'Apex Doors Kochi',1,'Kerala',3,'Kozhikode',17,'Mananchira',6,'Anas Kabeer','[\"/uploads/1792829007716-1792817901795-1792817128741-web_structure__3_.docx\", \"/uploads/1792829007720-1792816047625-Bus.jpeg\"]',0,'2026-10-24 08:03:33','2026-10-24 08:03:33'),(49,'eeee','2345678901','asf','','NEW',NULL,NULL,NULL,2,3,'Alex George (Coordinator)',1,'Kerala',NULL,NULL,3,'Aluva',NULL,NULL,'[]',0,'2026-10-24 08:05:01','2026-10-24 08:05:01'),(50,'test cus logout','test cus logout','test cus logout','test cus logout','NEW',NULL,NULL,NULL,1,1,'SteelGuard Executive Board',1,'Kerala',3,'Kozhikode',19,'Medical College',6,'Anas Kabeer','[]',0,'2026-10-24 08:11:07','2026-10-24 08:11:07'),(51,'dis test','1234567890','22','','SCHEDULED','2024-10-24',3,'Alex George (Coordinator)',2,3,'Alex George (Coordinator)',1,'Kerala',4,'Thrissur',37,'Perumbavoor',8,'K. V. Pavithran','[]',0,'2026-10-24 08:13:25','2026-10-24 09:09:46'),(52,'asd','+asd','sadf','asd','SCHEDULED','2024-10-24',3,'Alex George (Coordinator)',1,1,'SteelGuard Executive Board',1,'Kerala',3,'Kozhikode',15,'Mavoor Road',6,'Anas Kabeer','[]',0,'2026-10-24 08:13:45','2026-10-24 08:24:39'),(53,'test cus','123','123','sss','SCHEDULED','2026-10-30',1,'SteelGuard Executive Board',5,NULL,'customer',1,'Kerala',5,'Kannur',27,'South Bazar',8,'K. V. Pavithran','[]',0,'2026-10-24 08:29:38','2026-10-24 08:30:14'),(54,'err','12','123','123','SCHEDULED','2026-10-24',1,'SteelGuard Executive Board',1,1,'SteelGuard Executive Board',1,'Kerala',1,'Ernakulam',1,'Edapally',4,'Rajesh Menon','[]',0,'2026-10-24 08:38:26','2026-10-24 08:38:52'),(55,'big b','1234567890','ff','','SCHEDULED','2026-10-24',4,'Rajesh Menon',3,4,'Rajesh Menon',1,'Kerala',1,'Ernakulam',3,'Aluva',5,'Suresh Kumar','[]',0,'2026-10-24 08:55:11','2026-10-24 09:07:00'),(56,'asd','asd','asd','as','SCHEDULED','2026-10-24',1,'SteelGuard Executive Board',5,NULL,'customer',1,'Kerala',4,'Thrissur',15,'Mavoor Road',5,'Suresh Kumar','[]',0,'2026-10-24 08:58:47','2026-10-24 09:23:54'),(57,'tvmmm','1234567890','aa','','SCHEDULED','2024-10-24',3,'Alex George (Coordinator)',3,5,'Suresh Kumar',1,'Kerala',2,'Trivandrum',9,'Kowdiar',4,'Rajesh Menon','[]',0,'2026-10-24 09:41:42','2026-10-24 09:42:26');
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
) ENGINE=InnoDB AUTO_INCREMENT=95 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_status_logs`
--

LOCK TABLES `client_status_logs` WRITE;
/*!40000 ALTER TABLE `client_status_logs` DISABLE KEYS */;
INSERT INTO `client_status_logs` VALUES (6,1,'Abhijith','Scheduled','2024-10-24','Fitting scheduled for tomorrow morning.',NULL,NULL,'2026-10-23 04:41:35','2026-10-23 04:41:35'),(7,3,'Arun','Cancelled',NULL,'Client requested cancellation.',NULL,NULL,'2026-10-23 04:42:35','2026-10-23 04:42:35'),(8,10,'doc test','Scheduled','2024-10-24','',4,'Rajesh Menon','2026-10-23 05:20:31','2026-10-23 05:20:31'),(9,5,'Test','Cancelled',NULL,'',4,'Rajesh Menon','2026-10-23 05:20:44','2026-10-23 05:20:44'),(10,13,'AWFDW','Cancelled',NULL,'',4,'Rajesh Menon','2026-10-23 05:23:00','2026-10-23 05:23:00'),(11,13,'AWFDW','Scheduled','2024-10-24','',4,'Rajesh Menon','2026-10-23 05:23:10','2026-10-23 05:23:10'),(12,9,'googke','Scheduled','2024-10-01','',4,'Rajesh Menon','2026-10-23 05:23:35','2026-10-23 05:23:35'),(13,9,'googke','Scheduled','2024-09-10','',4,'Rajesh Menon','2026-10-23 05:24:21','2026-10-23 05:24:21'),(14,11,'doc test','Cancelled',NULL,'',4,'Rajesh Menon','2026-10-23 05:53:20','2026-10-23 05:53:20'),(15,13,'AWFDW','Completed','2024-10-24','done in 3',4,'Rajesh Menon','2026-10-23 06:03:30','2026-10-23 06:03:30'),(17,16,'file 2','Cancelled',NULL,'',5,'Suresh Kumar','2026-10-23 08:02:16','2026-10-23 08:02:16'),(18,16,'file 2','Scheduled','2024-10-24','',5,'Suresh Kumar','2026-10-23 08:02:46','2026-10-23 08:02:46'),(19,21,'doc','Scheduled','2024-10-01','',3,'Alex George (Coordinator)','2026-10-23 10:05:14','2026-10-23 12:00:10'),(20,13,'AWFDW','Cancelled',NULL,'',4,'Rajesh Menon','2026-10-23 11:44:41','2026-10-23 11:44:41'),(21,11,'doc test','Scheduled','2024-10-24','',4,'Rajesh Menon','2026-10-23 11:45:01','2026-10-23 11:45:01'),(22,26,'swaroop','Cancelled',NULL,'',4,'Rajesh Menon','2026-10-23 11:53:24','2026-10-23 11:53:24'),(23,26,'swaroop','Scheduled','2024-10-08','',3,'Alex George (Coordinator)','2026-10-23 11:54:19','2026-10-23 11:54:19'),(24,26,'swaroop','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-23 11:54:51','2026-10-23 11:54:51'),(25,25,'doctt ff','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-23 11:56:50','2026-10-23 11:56:50'),(26,25,'doctt ff','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-23 11:57:04','2026-10-23 11:57:04'),(27,27,'swaroop','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-23 12:05:48','2026-10-23 12:05:48'),(28,27,'swaroop','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-23 12:06:28','2026-10-23 12:06:28'),(29,28,'sdf','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-23 12:07:59','2026-10-23 12:07:59'),(30,28,'sdf','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-23 12:08:29','2026-10-23 12:08:29'),(31,29,'asap','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-23 12:12:09','2026-10-23 12:12:09'),(32,29,'asap','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-23 12:12:25','2026-10-23 12:12:25'),(33,40,'status','Cancelled',NULL,'',4,'Rajesh Menon','2026-10-24 05:39:41','2026-10-24 05:39:41'),(34,37,'doc test','Cancelled',NULL,'',4,'Rajesh Menon','2026-10-24 05:40:00','2026-10-24 05:40:00'),(35,29,'asap','Scheduled','2022-07-21','',3,'Alex George (Coordinator)','2026-10-24 05:43:50','2026-10-24 05:43:50'),(36,41,'test mul','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 06:07:02','2026-10-24 06:07:02'),(37,42,'image test','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 06:08:51','2026-10-24 06:08:51'),(38,42,'image test','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 06:09:07','2026-10-24 06:09:07'),(39,42,'image test','Scheduled','2026-10-01','',3,'Alex George (Coordinator)','2026-10-24 06:10:10','2026-10-24 06:10:10'),(40,33,'Test File','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 06:22:43','2026-10-24 06:22:43'),(41,41,'test mul','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 06:23:07','2026-10-24 06:23:07'),(42,44,'dd','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 06:23:51','2026-10-24 06:23:51'),(43,44,'dd','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 06:24:06','2026-10-24 06:24:06'),(44,44,'dd','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 06:24:58','2026-10-24 06:24:58'),(45,44,'dd','Scheduled','2026-10-24','',3,'Alex George (Coordinator)','2026-10-24 06:25:12','2026-10-24 06:25:12'),(46,44,'dd','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 06:25:48','2026-10-24 06:25:48'),(47,44,'dd','Cancelled',NULL,'',3,'Alex George (Coordinator)','2026-10-24 06:26:30','2026-10-24 06:26:30'),(48,44,'dd','Scheduled','2026-10-24','',3,'Alex George (Coordinator)','2026-10-24 06:26:49','2026-10-24 06:26:49'),(49,43,'test status change','Scheduled','2026-10-24','asdd',10,'Apex Doors Kochi','2026-10-24 06:36:33','2026-10-24 06:36:33'),(50,41,'test mul','Scheduled','2026-10-26','1234',10,'Apex Doors Kochi','2026-10-24 06:36:47','2026-10-24 06:36:47'),(51,44,'dd','Scheduled','2026-10-24','',3,'Alex George (Coordinator)','2026-10-24 07:03:34','2026-10-24 07:03:34'),(52,43,'test status change','Scheduled','2024-10-19','asdd',3,'Alex George (Coordinator)','2026-10-24 07:04:20','2026-10-24 07:04:20'),(53,31,'dbsxfg','Scheduled','2026-10-24','123',10,'Apex Doors Kochi','2026-10-24 07:04:30','2026-10-24 07:04:30'),(54,31,'dbsxfg','Completed',NULL,'123',10,'Apex Doors Kochi','2026-10-24 07:04:43','2026-10-24 07:04:43'),(55,44,'dd','Scheduled','2026-11-20','',3,'Alex George (Coordinator)','2026-10-24 07:05:18','2026-10-24 07:05:18'),(56,44,'dd','Scheduled','2026-11-20','das',3,'Alex George (Coordinator)','2026-10-24 07:05:36','2026-10-24 07:05:36'),(57,44,'dd','Scheduled','2026-11-20','das',3,'Alex George (Coordinator)','2026-10-24 07:06:06','2026-10-24 07:06:06'),(58,31,'dbsxfg','Cancelled',NULL,'1234',10,'Apex Doors Kochi','2026-10-24 07:06:13','2026-10-24 07:06:13'),(59,44,'dd','Scheduled','2024-10-24','das',3,'Alex George (Coordinator)','2026-10-24 07:06:25','2026-10-24 07:06:25'),(60,44,'dd','Scheduled','2024-10-24','das',3,'Alex George (Coordinator)','2026-10-24 07:33:13','2026-10-24 07:33:13'),(61,47,'ekm','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 07:48:10','2026-10-24 07:48:10'),(62,47,'ekm','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 07:52:46','2026-10-24 07:52:46'),(63,47,'ekm','Completed',NULL,NULL,1,'SteelGuard Executive Board','2026-10-24 07:54:11','2026-10-24 07:54:11'),(64,47,'ekm','Cancelled',NULL,NULL,1,'SteelGuard Executive Board','2026-10-24 07:54:21','2026-10-24 07:54:21'),(65,47,'ekm','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 08:01:40','2026-10-24 08:01:40'),(66,45,'arun','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 08:02:38','2026-10-24 08:02:38'),(67,45,'arun','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 08:02:59','2026-10-24 08:02:59'),(68,45,'arun','Completed','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 08:03:39','2026-10-24 08:03:39'),(69,47,'ekm','Cancelled',NULL,'',3,'Alex George (Coordinator)','2026-10-24 08:04:26','2026-10-24 08:04:26'),(70,51,'dis test','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 08:14:25','2026-10-24 08:14:25'),(71,52,'asd','Scheduled','2024-10-24','asd',3,'Alex George (Coordinator)','2026-10-24 08:24:05','2026-10-24 08:24:05'),(72,52,'asd','Scheduled','2024-10-24','asd',3,'Alex George (Coordinator)','2026-10-24 08:24:19','2026-10-24 08:24:19'),(73,52,'asd','Scheduled','2024-10-24','asd',3,'Alex George (Coordinator)','2026-10-24 08:24:39','2026-10-24 08:24:39'),(74,51,'dis test','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 08:24:57','2026-10-24 08:24:57'),(75,53,'test cus','Scheduled','2026-10-30','sss',1,'SteelGuard Executive Board','2026-10-24 08:30:14','2026-10-24 08:30:14'),(76,51,'dis test','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 08:36:07','2026-10-24 08:36:07'),(77,51,'dis test','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 08:38:31','2026-10-24 08:38:31'),(78,54,'err','Scheduled','2026-10-24',NULL,1,'SteelGuard Executive Board','2026-10-24 08:38:41','2026-10-24 08:38:41'),(79,54,'err','Scheduled','2026-10-24',NULL,1,'SteelGuard Executive Board','2026-10-24 08:38:52','2026-10-24 08:38:52'),(80,51,'dis test','Scheduled','2026-10-24',NULL,1,'SteelGuard Executive Board','2026-10-24 08:40:49','2026-10-24 08:40:49'),(81,51,'dis test','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 08:43:19','2026-10-24 08:43:19'),(82,55,'big b','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 08:55:44','2026-10-24 08:55:44'),(83,55,'big b','Completed','2024-10-24','',4,'Rajesh Menon','2026-10-24 08:58:21','2026-10-24 08:58:21'),(84,29,'asap','Cancelled',NULL,'',5,'Suresh Kumar','2026-10-24 09:02:08','2026-10-24 09:02:08'),(85,29,'asap','Scheduled','2024-10-24','',5,'Suresh Kumar','2026-10-24 09:06:31','2026-10-24 09:06:31'),(86,55,'big b','Scheduled','2026-10-24','',4,'Rajesh Menon','2026-10-24 09:07:00','2026-10-24 09:07:00'),(87,17,'John Doe','Cancelled',NULL,'Requires wood finish',4,'Rajesh Menon','2026-10-24 09:07:13','2026-10-24 09:07:13'),(88,37,'doccc','Cancelled',NULL,'',4,'Rajesh Menon','2026-10-24 09:08:49','2026-10-24 09:08:49'),(89,51,'dis test','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 09:09:37','2026-10-24 09:09:37'),(90,51,'dis test','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 09:09:46','2026-10-24 09:09:46'),(91,56,'asd','Scheduled','2026-10-24','',1,'SteelGuard Executive Board','2026-10-24 09:19:07','2026-10-24 09:19:07'),(92,56,'asd','Scheduled','2026-10-24','as',1,'SteelGuard Executive Board','2026-10-24 09:23:54','2026-10-24 09:23:54'),(93,47,'ekm','Cancelled',NULL,'',3,'Alex George (Coordinator)','2026-10-24 09:40:47','2026-10-24 09:40:47'),(94,57,'tvmmm','Scheduled','2024-10-24','',3,'Alex George (Coordinator)','2026-10-24 09:42:26','2026-10-24 09:42:26');
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
INSERT INTO `districts` VALUES (1,1,'Ernakulam','dist-ekm','2026-10-20 11:56:10'),(2,1,'Trivandrum','dist-tvm','2026-10-20 11:56:10'),(3,1,'Kozhikode','dist-clt','2026-10-20 11:56:10'),(4,1,'Thrissur','dist-tsr','2026-10-20 11:56:10'),(5,1,'Kannur','dist-knr','2026-10-20 11:56:10'),(6,1,'test','test','2026-10-24 07:28:17');
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'company_admin','123',1,'company',1,'admin','SteelGuard Executive Board','corporate@steeldoor.com','+91 98000 11223',1,'Kerala',NULL,NULL,NULL,1,0,'2026-10-24 08:35:17','2026-10-20 11:56:10','2026-10-24 08:35:17'),(2,'admin','123',2,'coordinator',1,'admin','Elena Vance (Coordinator)','admin@steeldoor.com','+91 98000 11224',1,'Kerala',NULL,NULL,NULL,1,0,'2026-10-21 06:20:59','2026-10-20 11:56:11','2026-10-23 11:44:51'),(3,'coordinator','123',2,'coordinator',2,'staff','Alex George (Coordinator)','coordinator@steeldoor.com','+91 98000 11225',1,'Kerala',NULL,NULL,NULL,1,0,'2026-10-24 09:42:08','2026-10-20 11:56:11','2026-10-24 09:42:08'),(4,'branch_ekm','123',3,'branch_head',2,'staff','Rajesh Menon','rajesh.menon@steeldoor.com','+91 98470 12345',1,'Kerala',1,'Ernakulam Hub',NULL,1,0,'2026-10-24 09:42:38','2026-10-20 11:56:11','2026-10-24 09:42:38'),(5,'branch_tvm','123',3,'branch_head',2,'staff','Suresh Kumar','suresh.kumar@steeldoor.com','+91 94471 23456',1,'Kerala',2,'Trivandrum Hub',NULL,1,0,'2026-10-24 09:40:58','2026-10-20 11:56:11','2026-10-24 09:40:58'),(6,'branch_clt','123',3,'branch_head',2,'staff','Anas Kabeer','anas.kabeer@steeldoor.com','+91 97452 34567',1,'Kerala',3,'Kozhikode Hub',NULL,1,0,NULL,'2026-10-20 11:56:11','2026-10-22 04:37:14'),(7,'branch_tsr','123',3,'branch_head',2,'staff','Mohan Das','mohan.das@steeldoor.com','+91 98463 45678',1,'Kerala',4,'Thrissur Hub',NULL,1,0,NULL,'2026-10-20 11:56:11','2026-10-22 04:37:14'),(8,'branch_knr','123',3,'branch_head',2,'staff','K. V. Pavithran','pavithran.kv@steeldoor.com','+91 94954 56789',1,'Kerala',5,'Kannur Hub',NULL,1,0,NULL,'2026-10-20 11:56:11','2026-10-22 04:37:14'),(9,'user','123',5,'customer',NULL,NULL,'John Mathew','john.mathew@gmail.com','+91 94470 55443',1,'Kerala',NULL,NULL,'42 Orchid Residency, Stadium Link Rd, Kaloor',1,0,NULL,'2026-10-20 11:56:11','2026-10-23 05:41:03'),(10,'apex_dealer','123',4,'dealer',NULL,NULL,'Apex Doors Kochi','sales@apexdoors.com','+91 98952 33441',1,'Kerala',NULL,NULL,'Door No 8/120, Bypass Junction, Edapally',1,0,'2026-10-24 06:57:45','2026-10-20 11:56:11','2026-10-24 06:57:45'),(11,'metro_builders','123',4,'dealer',NULL,NULL,'Metro Infra Ltd','contact@metroinfra.in','+91 98471 88990',1,'Kerala',NULL,NULL,'Plot 12, SmartCity Campus, Kakkanad',1,0,'2026-10-24 04:28:12','2026-10-20 11:56:11','2026-10-24 04:28:12'),(13,'aa','123',3,'branch_head',2,'staff','aa','1234','1234',1,'Kerala',6,'test','1234',1,1,NULL,'2026-10-24 07:28:48','2026-10-24 07:29:39'),(14,'aaa','123',3,'branch_head',2,'staff','aaa','1234','1234',1,'Kerala',6,'test',NULL,1,0,NULL,'2026-10-24 07:29:23','2026-10-24 07:29:45');
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

-- Dump completed on 2026-10-24 15:22:50
