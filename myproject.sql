-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 05, 2026 at 04:16 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `myproject`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `categoryId` int(11) NOT NULL,
  `categoryName` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `senderId` int(11) NOT NULL,
  `receiverId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `messageText` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `isRead` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `productId` int(11) NOT NULL,
  `productName` varchar(255) NOT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `category` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `userId` int(11) NOT NULL,
  `images` text DEFAULT NULL,
  `listingType` enum('sale','donation') DEFAULT 'sale',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`productId`, `productName`, `price`, `category`, `description`, `userId`, `images`, `listingType`, `created_at`) VALUES
(6, 'Ipad Pro 11', 2000.00, ' טאבלטים', 'iPad Pro 11 M4 (2024) 512GB Wi-Fi + Cellular למכירה מצב מצוין – כמו חדש כולל קופסה מקורית וכבל טעינה, דגם עם סים (Cellular) זיכרון: 512GB מסך: 11 אינץ\' מעבד: M4 האייפד עובד מצוין ללא בעיות. נמכר בגלל חוסר שימוש. כולל נרתיק ,כיסוי מגן ועט סטילוס', 1, '[\"/uploads/1777119639033-ipad pro 13.jpg\"]', 'sale', '2026-04-25 12:20:39'),
(7, 'מק בוק אייר 13 אינץ 512 גיגה', 5000.00, ' מחשבים ניידים', 'מק בוק אייר חדש כמעט ולא היה בשימוש מוכרת מק בוק אייר במצב חדש לגמרי היה בשימוש רק 4 פעמים בודדות סוללה 100 אחוז נפח512 גיגה צבע מיוחד ויפה לא סטנדרטי מגיע עם עכבר מקורי של אפל נקנה באיי דיגיטל יבואן רשמי המחשב שמור ברמה גבוהה מאוד כמו חדש מהקופסה סיבה למכירהאין לי שימוש בו גמישה במחיר לרציניים בלבד כולל ביטוח למחשב +עכבר מקורי של אפל', 1, '[\"/uploads/1777119801715-MacBook13.jpg\"]', 'sale', '2026-04-25 12:23:21'),
(8, 'ספרים פסיכומטרי', 0.00, 'ספרים', ' ספרי לימוד וחזרות העוסקים בחשיבה כמותית, חשיבה מילולית ואנגלית.\r\nספר לעבודה בכיתה\r\n3 חוברות סימולציות מלאות\r\nחוברת מבחן אמצע\r\nחוברת מבחני מרתון\r\nלומדות נוספות ומאגר השאלות מהקמפוס של יואל גבע.\r\n2 מקראות לתרגול קריאה בעברית', 1, '[\"/uploads/1777120037038-×¤×¡××××××¨× ×¡×¤×¨××.jpg\"]', 'donation', '2026-04-25 12:27:17'),
(9, 'כיסא סטודנט איכותי', 0.00, 'כיסאות', 'כיסא סטודנט איכותי מתכוונן עם גב מתכוונן ומשענות ידיים נקי במצב מצויין', 1, '[\"/uploads/1777120301347-×××¡× ×¡×××× ×.jpg\"]', 'donation', '2026-04-25 12:31:41'),
(10, 'תיק סטודנטים', 50.00, 'תיקים', 'תיק לסטודנטים במצב מצוין', 1, '[\"/uploads/1777120468860-×ª××§ ×¡×××× ×××.jpg\"]', 'sale', '2026-04-25 12:34:28'),
(11, 'מחשב שולחני משרדי', 6000.00, 'מחשב', 'מחשב שולחני משרדי DELL Precision T3680  I9-14900K 32GB 1TB - כולל Windwos 11 Pro  ו- 3 שנות אחריות באתר הלקוח', 1, '[\"/uploads/1777120590886-pc.jpg\"]', 'sale', '2026-04-25 12:36:30');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `role` varchar(10) DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `created_at`, `role`) VALUES
(1, 'ahmad123', 'ahmad123@gmail.com', '$2b$10$gUZj6JwjNPnyMUBkxagd7.9ac50OWtaQC.QXZENfldOzpNwxdceZa', '2026-04-25 11:53:30', 'user'),
(6, 'm7md', 'm7md@gmail.com', '$2b$10$CxWZ9eV3noGXL6599wWPze70A3NjDwflu7EJeXh4fmFcoZB6UsomC', '2026-05-05 12:01:34', 'user'),
(8, 'OthmanIgb', 'othman@gmail.com', '$2b$10$LxPcij4eCu9Z52smnnAQBOfPCw7VmIfc.bW5u.YD0NgP1WabPWLwK', '2026-05-05 12:03:18', 'admin');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`categoryId`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `senderId` (`senderId`),
  ADD KEY `receiverId` (`receiverId`),
  ADD KEY `productId` (`productId`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`productId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `categoryId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `productId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiverId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`productId`) REFERENCES `products` (`productId`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
