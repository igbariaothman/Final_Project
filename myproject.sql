-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 24, 2026 at 06:21 PM
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
  `isRead` tinyint(1) DEFAULT 0,
  `messageType` enum('chat','notification') NOT NULL DEFAULT 'chat'
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
  `productstatus` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(20) DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`productId`, `productName`, `price`, `category`, `description`, `userId`, `images`, `listingType`, `productstatus`, `created_at`, `status`) VALUES
(51, 'שעון חכם Apple Watch Series 11', 0.00, 'אלקטרוניקה ומחשוב', 'שעון חכם מתקדם הכולל חיישנים לניטור מדדי בריאות וכושר, קבלת התראות מהסמארטפון ישירות לפרק היד, עיצוב אלגנטי ועמידות גבוהה לשימוש יומיומי ושגרת לימודים עמוסה', 11, '[\"/uploads/1785226920952-images (4).jpg\"]', 'donation', 'new', '2026-07-28 08:22:00', 'available'),
(54, 'ספר לימוד Java The Comprehensive Guide', 0.00, 'ספרים וחומרי לימוד', 'מדריך מקיף ומעמיק ללימוד שפת התכנות Java, מתאים לסטודנטים למדעי המחשב ולהנדסת תוכנה. מכיל הסברים ברורים, דוגמאות קוד מתקדמות ותרגילים מעשיים מהיסוד ועד ברמה מקצועית', 11, '[\"/uploads/1785227038266-9781493222957_800.png\"]', 'donation', 'like-new', '2026-07-28 08:23:58', 'available'),
(55, 'ספר לימוד Node.js The Comprehensive Guide', 0.00, 'ספרים וחומרי לימוד', 'ספר לימוד מקצועי לפיתוח צד שרת באמצעות Node.js, JavaScript וסביבות עבודה מתקדמות. מעולה לסטודנטים ולמתכנתים המעוניינים לבנות אפליקציות ווב חזקות, לעבוד עם מסדי נתונים ולשלוט בפיתוח Full-Stack', 11, '[\"/uploads/1785227090696-images (3).jpg\"]', 'donation', 'good', '2026-07-28 08:24:50', 'available'),
(57, 'קלמר שחור רב תאי לסטודנטים', 0.00, 'כלי כתיבה וציוד משרדי', 'קלמר רחב ידיים בעיצוב מודרני הכולל מספר תאים ורוכסנים לארגון נוח של עטים, מרקרים, מחק, סרגלים וציוד כתיבה נדרש ללימודים אקדמיים', 11, '[\"/uploads/1785227198097-Durable-Multifunctional-Pencil-Case-for-School-Students-Girls-Boys-Large-Capacity-Adult-Pen-Maker-Pencil-Pouch-Office-Organizer.avif\"]', 'donation', 'new', '2026-07-28 08:26:38', 'available'),
(58, 'סט עטים כדוריים (60 יחידות)', 0.00, 'כלי כתיבה וציוד משרדי', 'מארז חסכוני המכיל 60 עטים כדוריים איכותיים בכתיבה חלקה ובצבעים שימושיים, מעולה לרישום הערות בשיעורים, בחינות ופתרון תרגילים לאורך סמסטר שלם', 11, '[\"/uploads/1785227239434-61f9YD92tQL.jpg\"]', 'donation', 'new', '2026-07-28 08:27:19', 'available'),
(59, 'מחשבון מדעי מתוקדמת FX-991ES Plus', 90.00, 'אלקטרוניקה ומחשוב', 'מחשבון מדעי מתקדם המאושר לשימוש בבחינות אקדמיות ובקורסים מתמטיים והנדסיים. תומך בחישובים סטטיסטיים, מטריצות, אינטגרלים ומשוואות מורכבות, בעל צاهל כפול (סולארי וסוללה)', 11, '[\"/uploads/1785227276641-He64ab7c7fcfd4917b8ea2240e38a3335R.avif\"]', 'sale', 'good', '2026-07-28 08:27:56', 'available'),
(60, 'סט ספרי פסיכומטרי ומתמטיקה', 0.00, 'ספרים וחומרי לימוד', 'סט ספרי לימוד איכותיים ומקיפים הכוללים חומרי עזר ותרגילים מתקדמים להכנה למבחנים, פסיכומטרי ובגרויות. מתאים במיוחד לסטודנטים ולתלמידים המעוניינים לשפר ציון ולהעמיק את הידע', 11, '[\"/uploads/1785227350317-2016-11-10-16.57.59.jpg\"]', 'donation', 'like-new', '2026-07-28 08:29:10', 'available'),
(61, 'שולחן עבודה משרדי עם מגירות', 450.00, 'ריהוט וציוד לחדר', 'שולחן עבודה חזק ויציב עם רגלי מתכת ומבנה עץ איכותי, כולל שתי מגירות מובנות עם מנעול לאחסון נוח של מחברות, ציוד משרדי ולפטופ. אידיאלי לחדר סטודנטים או פינת לימודים', 11, '[\"/uploads/1785227397031-images (1).jpg\"]', 'sale', 'like-new', '2026-07-28 08:29:57', 'available'),
(62, 'כסא משרדי אורטופדי לסטודנטים', 350.00, 'ריהוט וציוד לחדר', 'כיסא ארגונומי מתקדם עם משענת גב רשת אוורירית, תמיכה מצוינת לצוואר ולגב התחתון, גלגלים חלקים וידיות מתכווננות לשעות ארוכות של ישיבה מול המחשב בלימודים או בעבודה', 11, '[\"/uploads/1785227445483-office-chair-student-plus-12.jpg\"]', 'sale', 'like-new', '2026-07-28 08:30:45', 'available'),
(71, 'מארקיז אלכוהול Ohuhu (320 צבעים)', 450.00, 'כלי כתיבה וציוד משרדי', 'ערכת טושים אלכוהוליים מקצועיים הכוללת 320 צבעים ותיק נשיאה שחור חזק', 11, '[\"/uploads/1785242887500-892828229.jpg\"]', 'sale', 'like-new', '2026-07-28 12:48:07', 'available'),
(72, 'דפדפת נייר צילום A4', 30.00, 'כלי כתיבה וציוד משרדי', 'חבילת נייר צילום והדפסה לבנה בגודל A4, מכילה 500 דפים במשקל 80 גרם, מתאימה לשימוש ביתי ומשרדי', 11, '[\"/uploads/1785242923107-487528745.avif\"]', 'sale', 'like-new', '2026-07-28 12:48:43', 'available'),
(73, 'מאוורר עומד Hyundai', 0.00, 'אלקטרוניקה ומחשוב', 'מאורר עומד שחור בעל להבים עוצמתיים ובסיס יציב למיזוג אוויר בחדרים ומשרדים', 11, '[\"/uploads/1785242975747-231874303.jpg\"]', 'donation', 'good', '2026-07-28 12:49:35', 'available'),
(74, 'משקפי ראייה במסגרת שחורה', 50.00, 'תיקים ואביזרים', 'משקפיים בעיצוב אלגנטי ומודרני עם מסגרת שחורה, מתאימים לשימוש יומיומי', 11, '[\"/uploads/1785243006492-472224384.jpg\"]', 'sale', 'new', '2026-07-28 12:50:06', 'available'),
(75, 'עט אפל פרו (Apple Pencil Pro)', 500.00, 'אלקטרוניקה ומחשוב', 'עט חכם מתקדם מבית Apple המיועד לטאבלטים, מספק דיוק גבוה ותגובה מהירה לציור וכתיבה', 11, '[\"/uploads/1785243029862-976760832.png\"]', 'sale', 'new', '2026-07-28 12:50:29', 'available'),
(79, 'כדורי אומגה 3 מבית BIOVEA', 0.00, 'אחר', 'תוסף תזונה שמן דגים אומגה 3 בריכוז 1200 מ\"ג למנה, מכיל 100 כמוסות רכות לתמיכה בבריאות הלב והמוח', 11, '[\"/uploads/1785243189704-428447995.jpg\"]', 'donation', 'new', '2026-07-28 12:53:09', 'available'),
(81, 'תיק גב שחור ללפטופ וללימודים', 150.00, 'תיקים ואביזרים', 'תיק גב אורטופדי, קל משקל ועמיד במים, המותאם במיוחד לסטודנטים. כולל תאים ייעודיים ומרופדים לנשיאת מחשב נייד, ספרים, מחברות וציוד אישי בנוחות מרבית לאורך כל היום בקמפוס', 11, '[\"/uploads/1785243941295-697001815.avif\"]', 'sale', 'new', '2026-07-28 13:05:41', 'available');

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
  `role` varchar(10) DEFAULT 'user',
  `profileImage` varchar(255) DEFAULT NULL,
  `lastUsernameChange` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `created_at`, `role`, `profileImage`, `lastUsernameChange`) VALUES
(6, 'm7md', 'm7md@gmail.com', '$2b$10$CxWZ9eV3noGXL6599wWPze70A3NjDwflu7EJeXh4fmFcoZB6UsomC', '2026-05-05 12:01:34', 'user', NULL, NULL),
(10, 'ward', 'ward@gmail.com', '$2b$10$8dvHSfR8a5pDGI.jB8.IROH3xNGxRXKGhoKqnWe08w85hXKAYFcuq', '2026-07-27 14:43:47', 'user', NULL, NULL),
(11, 'ahmad', 'ahmad@gmail.com', '$2b$10$hl7lPiArUL/12O/xCctl0uIEglL9QZnXKAnrAHEPMMp6CLDIf9Jr2', '2026-07-28 08:03:32', 'user', NULL, NULL),
(12, 'USER', 'user@gmail.com', '$2b$10$PoiHJaWsw/GHSRlPWdLCEeCvmRSqF/M6Zu4B9HALHaekrWVxCQWuy', '2026-07-28 09:30:19', 'user', '/uploads/profiles/profile-1787585866939-495020736.svg', '2026-08-24 15:37:46'),
(14, 'Admin', 'admin@gmail.com', '$2b$10$RYwAEcMZbj7Is4JA0qxFeue33BF3ZOpGHesLqCrvFErN4QcITx/L.', '2026-08-24 14:47:15', 'admin', NULL, NULL);

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
  MODIFY `favoriteId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `productId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `reportId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

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
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiverId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
