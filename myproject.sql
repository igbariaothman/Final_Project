-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 12, 2026 at 01:29 PM
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

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`categoryId`, `categoryName`) VALUES
(1, 'אלקטרוניקה ומחשוב'),
(2, 'ספרים וחומרי לימוד'),
(3, 'ריהוט וציוד לחדר'),
(4, 'מוצרי חשמל למעונות'),
(5, 'תיקים ואביזרים'),
(6, 'כלי כתיבה וציוד משרדי'),
(7, 'ציוד מעבדה'),
(8, 'אחר');

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `favoriteId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
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

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `senderId`, `receiverId`, `productId`, `messageText`, `created_at`, `isRead`) VALUES
(2, 8, 8, 37, 'rgr', '2026-05-07 09:45:37', 0),
(3, 8, 8, 37, 'hdth', '2026-05-07 09:45:39', 0),
(4, 8, 8, 37, 'rsgh', '2026-05-07 09:45:40', 0),
(5, 6, 8, 37, 'rgigrn', '2026-05-07 09:46:37', 0),
(6, 6, 8, 37, 'rg', '2026-05-07 09:47:14', 0),
(7, 6, 8, 37, 'wg', '2026-05-07 09:47:16', 0),
(8, 6, 8, 37, 'geth', '2026-05-07 09:47:19', 0),
(9, 6, 8, 37, 'wgrg', '2026-05-07 09:47:21', 0);

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
  `productstatus` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`productId`, `productName`, `price`, `category`, `description`, `userId`, `images`, `listingType`, `productstatus`, `created_at`) VALUES
(31, 'מחשב שולחני משרדי', 6000.00, 'אלקטרוניקה ומחשוב', 'מחשב שולחני משרדי DELL Precision T3680  I9-14900K 32GB 1TB - כולל Windwos 11 Pro  ו- 3 שנות אחריות באתר הלקוח', 1, '[\"/uploads/1778083488864-pc.jpg\"]', 'sale', 'like-new', '2026-05-06 16:04:48'),
(32, 'תיק סטודנטים', 100.00, 'תיקים ואביזרים', 'תיק לסטודנטים במצב מצוין', 1, '[\"/uploads/1778083545408-×ª××§ ×¡×××× ×××.jpg\"]', 'sale', 'good', '2026-05-06 16:05:45'),
(33, 'כיסא סטודנט איכותי', 0.00, 'ריהוט וציוד לחדר', 'כיסא סטודנט איכותי מתכוונן עם גב מתכוונן ומשענות ידיים נקי במצב מצויין', 1, '[\"/uploads/1778083591992-×××¡× ×¡×××× ×.jpg\"]', 'donation', 'new', '2026-05-06 16:06:31'),
(34, 'ספרים פסיכומטרי', 0.00, 'ספרים וחומרי לימוד', 'ספרי לימוד וחזרות העוסקים בחשיבה כמותית, חשיבה מילולית ואנגלית.\r\nספר לעבודה בכיתה\r\n3 חוברות סימולציות מלאות\r\nחוברת מבחן אמצע\r\nחוברת מבחני מרתון\r\nלומדות נוספות ומאגר השאלות מהקמפוס של יואל גבע.\r\n2 מקראות לתרגול קריאה בעברית', 1, '[\"/uploads/1778083630115-×¤×¡××××××¨× ×¡×¤×¨××.jpg\"]', 'donation', 'like-new', '2026-05-06 16:07:10'),
(35, 'מק בוק אייר 13 אינץ 512 גיגה', 5000.00, 'אלקטרוניקה ומחשוב', 'מק בוק אייר חדש כמעט ולא היה בשימוש מוכרת מק בוק אייר במצב חדש לגמרי היה בשימוש רק 4 פעמים בודדות סוללה 100 אחוז נפח512 גיגה צבע מיוחד ויפה לא סטנדרטי מגיע עם עכבר מקורי של אפל נקנה באיי דיגיטל יבואן רשמי המחשב שמור ברמה גבוהה מאוד כמו חדש מהקופסה סיבה למכירהאין לי שימוש בו גמישה במחיר לרציניים בלבד כולל ביטוח למחשב +עכבר מקורי של אפל', 1, '[\"/uploads/1778083666172-MacBook13.jpg\"]', 'sale', 'new', '2026-05-06 16:07:46'),
(36, 'Ipad Pro 11', 2000.00, 'אלקטרוניקה ומחשוב', 'iPad Pro 11 M4 (2024) 512GB Wi-Fi + Cellular למכירה מצב מצוין – כמו חדש כולל קופסה מקורית וכבל טעינה, דגם עם סים (Cellular) זיכרון: 512GB מסך: 11 אינץ\' מעבד: M4 האייפד עובד מצוין ללא בעיות. נמכר בגלל חוסר שימוש. כולל נרתיק ,כיסוי מגן ועט סטילוס', 1, '[\"/uploads/1778083696918-ipad pro 13.jpg\"]', 'sale', 'good', '2026-05-06 16:08:16'),
(37, 'm7md', 0.00, 'ריהוט וציוד לחדר', 'student', 8, '[\"/uploads/1778147098879-134015687351623932.jpg\",\"/uploads/1778147098902-133995791583540665.jpg\",\"/uploads/1778147098924-134071458069640213.jpg\",\"/uploads/1778147098938-134163597727642388.jpg\",\"/uploads/1778147098956-134167021220744640.jpg\",\"/uploads/1778147098974-134175719603543026.jpg\",\"/uploads/1778147099019-image_0.jpg\"]', 'donation', 'fair', '2026-05-07 09:44:59');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `reportId` int(11) NOT NULL,
  `productId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `reportType` varchar(50) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`reportId`, `productId`, `userId`, `reportType`, `message`, `createdAt`) VALUES
(1, 1, 2, 'product', 'This product looks fake or misleading.', '2026-05-08 16:21:35'),
(2, 36, 8, 'user', 'qewfq', '2026-05-08 17:59:03');

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
(8, 'OthmanIgb', 'othman@gmail.com', '$2b$10$LxPcij4eCu9Z52smnnAQBOfPCw7VmIfc.bW5u.YD0NgP1WabPWLwK', '2026-05-05 12:03:18', 'admin'),
(9, 'AhmadAdmin', 'ahmadadmin@gmail.com', '$2b$10$5y/kBqKDL72oT48TebEhE.aFvXKBVb6wDcruyGTqthhc5pvjEeGlW', '2026-05-06 17:22:28', 'admin');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`categoryId`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`favoriteId`),
  ADD UNIQUE KEY `unique_user_product` (`userId`,`productId`),
  ADD KEY `fk_fav_product` (`productId`);

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
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`reportId`);

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
  MODIFY `categoryId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `favoriteId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `productId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `reportId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `fk_fav_product` FOREIGN KEY (`productId`) REFERENCES `products` (`productId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fav_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
