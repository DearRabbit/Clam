-- MySQL dump 10.13  Distrib 5.5.46, for Linux (x86_64)
--
-- Host: localhost    Database: clam
-- ------------------------------------------------------
-- Server version	5.5.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `friendList`
--

DROP TABLE IF EXISTS `friendList`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `friendList` (
  `mainID` int(11) NOT NULL,
  `friendID` int(11) NOT NULL,
  `groupName` varchar(40) DEFAULT NULL,
  KEY `mainID` (`mainID`),
  KEY `friendID` (`friendID`),
  CONSTRAINT `friendList_ibfk_1` FOREIGN KEY (`mainID`) REFERENCES `userinfo` (`userID`) ON DELETE CASCADE,
  CONSTRAINT `friendList_ibfk_2` FOREIGN KEY (`friendID`) REFERENCES `userinfo` (`userID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friendList`
--

LOCK TABLES `friendList` WRITE;
/*!40000 ALTER TABLE `friendList` DISABLE KEYS */;
INSERT INTO `friendList` VALUES (4,8,'atfriend'),(8,4,'ä¸­æ'),(4,11,'at4'),(11,4,'中文');
/*!40000 ALTER TABLE `friendList` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `msgLog`
--

DROP TABLE IF EXISTS `msgLog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `msgLog` (
  `msgid` int(11) NOT NULL AUTO_INCREMENT,
  `senderID` int(11) DEFAULT NULL,
  `recverID` int(11) DEFAULT NULL,
  `msgState` int(11) DEFAULT NULL,
  `sendTime` datetime DEFAULT NULL,
  `msgContent` text,
  PRIMARY KEY (`msgid`),
  KEY `senderID` (`senderID`),
  KEY `recverID` (`recverID`),
  CONSTRAINT `msgLog_ibfk_1` FOREIGN KEY (`senderID`) REFERENCES `userinfo` (`userID`) ON DELETE CASCADE,
  CONSTRAINT `msgLog_ibfk_2` FOREIGN KEY (`recverID`) REFERENCES `userinfo` (`userID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `msgLog`
--

LOCK TABLES `msgLog` WRITE;
/*!40000 ALTER TABLE `msgLog` DISABLE KEYS */;
/*!40000 ALTER TABLE `msgLog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userinfo`
--

DROP TABLE IF EXISTS `userinfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userinfo` (
  `userID` int(11) NOT NULL AUTO_INCREMENT,
  `userName` varchar(40) DEFAULT NULL,
  `passWord` char(32) NOT NULL,
  `salt` char(32) NOT NULL,
  `userState` int(11) DEFAULT NULL,
  `registerDate` datetime DEFAULT NULL,
  `realName` varchar(40) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `userName` (`userName`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userinfo`
--

LOCK TABLES `userinfo` WRITE;
/*!40000 ALTER TABLE `userinfo` DISABLE KEYS */;
INSERT INTO `userinfo` VALUES (3,'username1','pass','salt',0,'2016-06-18 13:51:37','lee','e@zju.com','1230'),(4,'usr2','pwd','salt',0,'2016-06-18 13:51:37','lee2','4@zju.com','123'),(8,'user1','17cb4497c29517e91558f55e12949a69','fe9d26c3e620eeb69bd166c8be89fb8f',0,'2016-06-18 13:10:06','lee','jj@qq.com','123'),(11,'us1','17cb4497c29517e91558f55e12949a69','fe9d26c3e620eeb69bd166c8be89fb8f',1,'2016-06-18 13:11:02','lee','jj@qqxin.com','123');
/*!40000 ALTER TABLE `userinfo` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-06-18 15:51:51
