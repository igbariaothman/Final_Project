-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 08, 2026 at 01:40 PM
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
-- Database: `nodepro`
--

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `productId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `favorites`
--

INSERT INTO `favorites` (`id`, `userId`, `productId`) VALUES
(4, 23, 1),
(1, 23, 3),
(2, 23, 4),
(12, 23, 5),
(10, 23, 6),
(11, 23, 7),
(20, 24, 1),
(19, 24, 2),
(15, 24, 3),
(21, 24, 5),
(22, 24, 6),
(23, 26, 2),
(24, 26, 3);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `productName` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `userId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `productName`, `price`, `category`, `description`, `userId`) VALUES
(1, 'Laptop', 1500.00, 'Electronics', 'High-performance laptop for work and gaming', 1),
(2, 'Smartphone', 800.00, 'Electronics', 'Latest smartphone with great camera', 2),
(3, 'Headphones', 120.00, 'Electronics', 'Noise-cancelling over-ear headphones', 1),
(4, 'Coffee Maker', 90.50, 'Home Appliances', 'Automatic coffee machine with timer', 3),
(5, 'Office Chair', 200.00, 'Furniture', 'Ergonomic chair for home office', 2),
(6, 'Notebook', 5.00, 'Stationery', '200-page ruled notebook', 4),
(7, 'Backpack', 45.99, 'Accessories', 'Durable backpack for school and travel', 3);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`) VALUES
(11, 'AhmadHabashi', 'habashiahmad@gmail.com', '$2b$10$uHGac93sY3Oe2wSOeuVHN.iaAdyJSHNLD.5esVKpKXrV6BO/uwOK6'),
(20, 'othman', 'otman@gmail.com', '$2b$10$wgxMW1rBf/nATGJGvMmLB.DmOPc9VWapclZbXXyBvhJnjU.Z4Z3jC'),
(21, 'SosoAlmtw7sh', 'sosoalmtw7sh@pet.ac.il', '$2b$10$Pez4t1hQuIUjmzj2XdaNmeUQTVDxGvbgelqE0EEp97nd/pHOSBf7m'),
(23, 'othmanigbaria', 'othman@gmail.com', '$2b$10$arhOIE1LwURMNreQVCM66OmrpIY5Ug8e0xEKGGAOBICDvdiHvn/Jm'),
(24, 'test', 'test@gmail.com', '$2b$10$tsze2LyHjn33gA6Lh438nOfJUHdbTxFxbMgfCJSZ7bXJ78i1KrQSi'),
(25, 'ward', 'ward@gmail.com', '$2b$10$i.T7f3Rj2ITaZt2C5DYlLeZLLGcmMM0.GwkBWdatQnjPX90tTyApm'),
(26, 'othmanaa', 'othmanigb@gmail.com', '$2b$10$4KrYDdTUwf8bz68Irxwzz.brQlRVBNL/6Yh9R4Nr4mNqACW/Nog4S');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`userId`,`productId`),
  ADD KEY `fk_favorite_product` (`productId`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email_2` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `fk_favorite_product` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_favorite_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
